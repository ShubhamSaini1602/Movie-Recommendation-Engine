import { Bot, Zap, Share2, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import GraphVisualizer from './GraphVisualizer';
import MovieGrid from './MovieGrid';
import ReactMarkdown from 'react-markdown';

export default function ResultPanel({ result, query, watchlist, toggleWatchlist }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result?.response?.text) return;
    await navigator.clipboard.writeText(result.response.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if we have path data from Neo4j to render a graph
  const hasGraphData = result?.response?.rawData && result.response.rawData[0]?.pathNodes;
  
  // Check the query type returned by the backend
  const isSimilarity = result?.type === 'similarity';

  return (
    <div className="result-panel glass-panel animate-slide-up">
      <div className="result-meta-bar">
        <div className="result-query-tag">
          <Zap size={12} />
          <span>{query}</span>
        </div>
        <div className="result-actions">
          <button className="icon-action-btn" onClick={handleCopy} title="Copy response">
            {copied ? <CheckCheck size={15} className="copied-icon" /> : <Copy size={15} />}
          </button>
          <button className="icon-action-btn" title="Share">
            <Share2 size={15} />
          </button>
        </div>
      </div>

      <div className="result-header-row">
        <div className="result-avatar">
          <Bot size={25} />
          <div className="result-avatar-pulse" />
        </div>
        <div className="result-header-text">
          <h3 className="result-title">Neural Response</h3>
          {/* Conditionally render the subtitle based on query type */}
          <span className="result-subtitle">
            {isSimilarity ? '( GraphDB + VectorDB ) Analysis' : 'GraphDB Analysis'}
          </span>
        </div>
        <div className="result-status-dot" />
      </div>

      <div className="result-divider" />

      <div className="result-body">
        <div className="result-text-markdown">
            <ReactMarkdown>{result?.response?.text}</ReactMarkdown>
        </div>
        
        {/* Render the GraphVisualizer if the query is about finding relationships b/w entities */}
        {hasGraphData && (
          <div style={{ marginTop: '2.5rem' }}>
            <h4 style={{ 
              color: '#94a3b8', 
              fontSize: '0.85rem', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#3b82f6', 
                boxShadow: '0 0 10px #3b82f6' 
              }} />
              Knowledge Graph Extraction
            </h4>
            <GraphVisualizer rawData={result.response.rawData} />
          </div>
        )}

        {/* Render the MovieGrid for similarity/recommendation queries */}
        {isSimilarity && result?.response?.rawData && (
          <MovieGrid 
            movies={result.response.rawData}
            watchlist={watchlist} 
            toggleWatchlist={toggleWatchlist}
          />
        )}
      </div>

      <div className="result-footer">
        <div className="result-footer-badge">
          <div className="footer-dot footer-dot--green" />
          Graph traversal complete
        </div>
        
        {/* Conditionally render the Vector badge ONLY if it's a similarity query */}
        {isSimilarity && (
          <div className="result-footer-badge">
            <div className="footer-dot footer-dot--blue" />
            Vector similarity scored
          </div>
        )}
      </div>
    </div>
  );
}