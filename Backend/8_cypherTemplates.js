// =====================================================================
// 8_cypherTemplates.js — SAFE CYPHER GENERATION
// =====================================================================
//
// LLM NEVER writes raw Cypher. Instead:
//   1. LLM outputs a JSON plan (which templates to use)
//   2. This file VALIDATES every step against whitelists
//   3. This file BUILDS safe read-only Cypher
//
// WHITELIST = list of things that ARE allowed.
// Anything NOT on the list is rejected.
//
// This guarantees: no DELETE, no SET, no CREATE can ever reach Neo4j.
// =====================================================================

// ── What labels (node types) are allowed ──
const ALLOWED_LABELS = new Set([
  "Movie", "Director", "Actor", "Genre", "Theme", "Award",
]);

// ── What relationships are allowed ──
const ALLOWED_RELATIONSHIPS = new Set([
  "DIRECTED", "ACTED_IN", "BELONGS_TO", "EXPLORES", "WON",
]);

// ── What properties each label can access ──
const ALLOWED_PROPERTIES = {
  Movie: ["title", "year"],
  Director: ["name"],
  Actor: ["name"],
  Genre: ["name"],
  Theme: ["name"],
  Award: ["name", "category"],
};

// ── What filter operators are allowed ──
const ALLOWED_OPERATORS = new Set([
  "=", "<>", ">", "<", ">=", "<=", "CONTAINS", "STARTS WITH",
]);

// ── Short variable names for each label ──
const LABEL_VAR_MAP = {
  Movie: "m", Director: "d", Actor: "a",
  Genre: "g", Theme: "t", Award: "aw",
};

// Validate ONE step from the plan
function validateStep(step) {
  switch (step.type) {
    case "traversal":
      if (!ALLOWED_LABELS.has(step.from)) throw new Error(`Invalid label: ${step.from}`);
      if (!ALLOWED_LABELS.has(step.to)) throw new Error(`Invalid label: ${step.to}`);
      if (!ALLOWED_RELATIONSHIPS.has(step.rel)) throw new Error(`Invalid relationship: ${step.rel}`);
      break;

    case "filter": {
      const [label, prop] = step.field.split(".");
      if (!ALLOWED_LABELS.has(label)) throw new Error(`Invalid label: ${label}`);
      if (!ALLOWED_PROPERTIES[label]?.includes(prop)) throw new Error(`Invalid property: ${step.field}`);
      if (!ALLOWED_OPERATORS.has(step.op)) throw new Error(`Invalid operator: ${step.op}`);
      break;
    }

    case "projection":
      for (const field of step.fields) {
        const [lbl, prp] = field.split(".");
        if (!ALLOWED_LABELS.has(lbl)) throw new Error(`Invalid label: ${lbl}`);
        if (!ALLOWED_PROPERTIES[lbl]?.includes(prp)) throw new Error(`Invalid property: ${field}`);
      }
      break;

    case "aggregation": {
      const validAggs = ["count", "collect", "sum", "avg", "min", "max"];
      if (!validAggs.includes(step.function)) throw new Error(`Invalid aggregation: ${step.function}`);
      break;
    }

    case "sort": {
      const [sLabel, sProp] = step.field.split(".");
      if (!ALLOWED_LABELS.has(sLabel)) throw new Error(`Invalid label: ${sLabel}`);
      if (!["ASC", "DESC"].includes(step.direction?.toUpperCase())) throw new Error(`Invalid direction: ${step.direction}`);
      break;
    }

    case "limit":
      if (typeof step.value !== "number" || step.value < 1 || step.value > 100)
        throw new Error(`Invalid limit: ${step.value}`);
      break;

    default:
      throw new Error(`Unknown step type: ${step.type}`);
  }
}

// Build safe Cypher from a validated plan
function buildCypher(plan) {
  const steps = plan.steps;

  // Validate ALL steps first
  steps.forEach(validateStep);

  const matchClauses = [];
  const whereClauses = [];
  let returnClause = "";
  let orderClause = "";
  let limitClause = "";
  const params = {};
  let paramCounter = 0;

  // ==========================================
  // NEW: STATE TRACKING (THE HUB RULE)
  // Prevents variable collisions like 'a' vs 'a'
  // ==========================================
  const labelCounts = {}; // e.g., { Actor: 2, Movie: 1 }
  const currentVars = {}; // e.g., { Actor: "a2", Movie: "m1" }

  function getVar(label, isTarget) {
    const prefix = LABEL_VAR_MAP[label] || label.charAt(0).toLowerCase();

    // 1. HUB RULE: Always intersect on the SAME Movie to tie the graph together.
    if (label === 'Movie' && currentVars['Movie']) {
      return currentVars['Movie'];
    }

    // 2. SOURCE RULE: If traversing FROM a label we already tracked, reuse it.
    if (!isTarget && currentVars[label]) {
      return currentVars[label];
    }

    // 3. TARGET RULE: Create a NEW variable to prevent overwriting (e.g., a1, a2)
    labelCounts[label] = (labelCounts[label] || 0) + 1;
    const newVar = `${prefix}${labelCounts[label]}`;
    currentVars[label] = newVar; // Update pointer to the latest
    return newVar;
  }
  // ==========================================

  for (const step of steps) {
    switch (step.type) {
      case "traversal": {
        const fromVar = getVar(step.from, false);
        const toVar = getVar(step.to, true);

        // FIX: Use undirected relationships `-[:REL]-` instead of `->`
        // This stops Neo4j from failing if the LLM guesses the direction backwards!
        matchClauses.push(
          `MATCH (${fromVar}:${step.from})-[:${step.rel}]-(${toVar}:${step.to})`
        );
        break;
      }

      case "filter": {
        const [label, prop] = step.field.split(".");
        // Apply filter to the MOST RECENTLY generated variable for this label
        const varName = currentVars[label] || LABEL_VAR_MAP[label];
        const paramName = `p${paramCounter++}`;
        params[paramName] = step.value;
        whereClauses.push(`${varName}.${prop} ${step.op} $${paramName}`);
        break;
      }

      case "projection": {
        const fields = step.fields.map((f) => {
          const [lbl, prp] = f.split(".");
          const varName = currentVars[lbl] || LABEL_VAR_MAP[lbl];
          return `${varName}.${prp}`;
        });
        const distinct = step.distinct ? "DISTINCT " : "";
        returnClause = `RETURN ${distinct}${fields.join(", ")}`;
        break;
      }

      case "aggregation": {
        const alias = step.alias || `${step.function}_result`;
        if (step.groupBy) {
          const [grpLabel, grpProp] = step.groupBy.split(".");
          const grpVar = currentVars[grpLabel] || LABEL_VAR_MAP[grpLabel];
          const [aggLabel] = (step.field || "").split(".");
          const aggTarget = aggLabel ? (currentVars[aggLabel] || LABEL_VAR_MAP[aggLabel]) : "*";
          returnClause = `RETURN ${grpVar}.${grpProp}, ${step.function}(${aggTarget}) AS ${alias}`;
        } else {
          const [aggLabel] = (step.field || "").split(".");
          const aggTarget = aggLabel ? (currentVars[aggLabel] || LABEL_VAR_MAP[aggLabel]) : "*";
          returnClause = `RETURN ${step.function}(${aggTarget}) AS ${alias}`;
        }
        break;
      }

      case "sort": {
        const [sLabel, sProp] = step.field.split(".");
        const sVar = currentVars[sLabel] || LABEL_VAR_MAP[sLabel];
        if (returnClause.includes(` AS ${sProp}`)) {
          orderClause = `ORDER BY ${sProp} ${step.direction.toUpperCase()}`;
        } else {
          orderClause = `ORDER BY ${sVar}.${sProp} ${step.direction.toUpperCase()}`;
        }
        break;
      }

      case "limit": {
        limitClause = `LIMIT ${step.value}`;
        break;
      }
    }
  }

  const cypher = [
    ...matchClauses,
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "",
    returnClause,
    orderClause,
    limitClause,
  ].filter((p) => p.length > 0).join("\n");

  return { cypher, params };
}

export { buildCypher, validateStep, ALLOWED_LABELS, ALLOWED_RELATIONSHIPS };
