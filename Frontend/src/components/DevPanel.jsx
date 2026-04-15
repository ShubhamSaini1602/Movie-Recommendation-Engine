import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Activity, Database, Cpu, CheckCircle2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function DevPanel({ isOpen, onClose, result }) {

  const getPipelineSteps = () => {
    if (!result) return [];
    return [
      "Parsing query semantics...",
      "LLM Entity Extraction Triggered",
      `Routing -> ${result.type === 'similarity' ? 'VectorDB + GraphDB' : 'GraphDB'}`,
      `Executing ${result.type === 'similarity' ? 'Cosine Similarity + Graph Traversal' : 'Cypher Traversal'}`,
      `Returning ${result.response?.rawData?.length || 0} candidate nodes`,
      "Synthesizing final natural language response"
    ];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="dev-panel-overlay"
          />

          {/* Sliding Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="dev-panel-container"
          >
            <div className="dev-panel-header">
              <h2 className="dev-panel-title">
                <Terminal size={28} />
                Engine Diagnostics
              </h2>
              <button onClick={onClose} className="dev-close-btn">
                <X size={24} />
              </button>
            </div>

            <div className="dev-panel-body">
              {/* State 1: No Search Yet */}
              {!result && (
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                  Execute a query to view neural routing metrics.
                </div>
              )}

              {/* State 2: Results Available */}
              {result && !result.error && (
                <>
                  {/* Performance Metrics */}
                  <div>
                    <h3 className="dev-section-title">
                      <Activity size={18} style={{ display: 'inline', marginRight: '10px', marginBottom: '-4px' }} />
                      Execution Trace
                    </h3>
                    <div className="dev-metric-box">
                      <div className="dev-metric-row">
                        <span className="dev-metric-label">Routing Decision:</span>
                        <span className="dev-metric-value highlight">
                          {result.type === 'similarity' ? 'Pinecone (Vector) + Neo4j (Graph)' : 'Neo4j (Graph)'}
                        </span>
                      </div>
                      <div className="dev-metric-row">
                        <span className="dev-metric-label">Status:</span>
                        <span className="dev-metric-value highlight">200 OK</span>
                      </div>
                    </div>
                  </div>

                  {/* Architecture Flow */}
                  <div>
                    <h3 className="dev-section-title">
                      <Cpu size={18} style={{ display: 'inline', marginRight: '10px', marginBottom: '-3px' }} />
                      Pipeline Logs
                    </h3>
                    <div className="dev-code-block" style={{ padding: '0.75rem' }}>
                      {getPipelineSteps().map((step, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem',
                          marginBottom: index === 5 ? '0' : '0.6rem'
                        }}>
                          <span style={{ 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            color: '#60a5fa', 
                            fontSize: '0.65rem', 
                            fontWeight: 'bold',
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}>
                            0{index + 1}
                          </span>
                          <span style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>
                            {step}
                          </span>
                          {index === 5 && (
                            <CheckCircle2 size={14} color="#34d399" style={{ marginLeft: 'auto' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Raw Payload Preview */}
                  <div>
                    <h3 className="dev-section-title">
                      <Database size={18} style={{ display: 'inline', marginRight: '10px', marginBottom: '-3px' }} />
                      Raw Response Data (JSON)
                    </h3>
                    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                      <SyntaxHighlighter 
                        language="json" 
                        style={atomDark}
                        customStyle={{ margin: 0, padding: '1rem', fontSize: '0.8rem', background: '#09090b' }}
                        wrapLongLines={true}
                      >
                        {(() => {
                          const rawData = result.response?.rawData || [];
                          const displayData = rawData.slice(0, 5);
                          
                          // Inject a stylish truncation message directly into the JSON array
                          if (rawData.length > 2) {
                            displayData.push(`... (${rawData.length - 5} more items truncated for display)`);
                          }
                          
                          return JSON.stringify(displayData, null, 5);
                        })()}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}