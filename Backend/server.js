import express from "express";
const app = express();
const PORT = process.env.PORT || 5000;
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { resolveQueryEntities } from "./9_entityResolver.js";
import { classifyQuery } from "./10_queryClassifier.js";
import { handleGraphQuery } from "./11_graphHandler.js";
import { handleSimilarityQuery } from "./12_similarityHandler.js";

app.use(cors({
	origin: ["http://localhost:5173"],
	credentials: true
}));
app.use(express.json());

// QUERY from the user (FRONTEND)
app.post("/api/query", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log(`\n📬 Received Query: "${query}"`);

    // ── THE GRAPH RAG PIPELINE  ──

    // Step 1: Entity Resolution
    console.log("🔍 Running Entity Resolution...");
    const resolved = await resolveQueryEntities(query);

    // Step 2: Classification
    console.log("🧠 Running Classification...");
    const classification = await classifyQuery(query, resolved);
    console.log(`   Type: ${classification.type} | Reason: ${classification.reasoning}`);

    // Step 3: Routing
    let answer;

    if (classification.type === "similarity") {
      console.log("📐 Routing to Similarity Handler (Pinecone + Neo4j)...");
      answer = await handleSimilarityQuery(query, resolved);
    } else {
      console.log("🗄️ Routing to Graph Handler (Neo4j)...");
      answer = await handleGraphQuery(query, resolved);
    }

    res.json({
      success: true,
      query: query,
      type: classification.type,
      // 'answer' will contain both the LLM's text answer AND the raw array data
      response: answer 
    });

  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// A Simple route to test if the backend is live in the browser
app.get("/", (req, res) => {
  res.status(200).json({ message: "GraphRAG Neural Engine is online and operational." });
});

// Start listening for traffic
app.listen(PORT, () => {
  console.log("===========================================");
  console.log(`🚀 GraphRAG API Server running on port ${PORT}`);
  console.log("===========================================");
});