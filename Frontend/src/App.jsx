import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ResultPanel from './components/ResultPanel';
import LoadingState from './components/LoadingState';
import HistorySidebar from './components/HistorySidebar';
import { Clapperboard, Network, Cpu } from 'lucide-react';
import DevPanel from './components/DevPanel';
import { Settings, Database } from 'lucide-react';
import WatchlistDock from './components/WatchlistDock';

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setHistory((prev) => [
      { id: Date.now(), query: searchQuery.trim(), time: formatTime() },
      ...prev,
    ]);

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to connect to the Neural Engine. Make sure the backend is running.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const toggleWatchlist = (movieObj) => {
    setWatchlist(prev => {
      // If it's already in the list, remove it
      if (prev.some(m => m.title === movieObj.title)) {
        return prev.filter(m => m.title !== movieObj.title);
      }
      // Otherwise, add it
      return [...prev, movieObj];
    });
  };

  return (
    <>
    <div className={`app-container ${mounted ? 'mounted' : ''}`}>
      <div className="bg-layer">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-grid" />
        <div className="film-strip film-strip-left" />
        <div className="film-strip film-strip-right" />
      </div>

      {Array.from({ length: 30 }).map((_, i) => (
        <span
          key={i}
          className="star"
          style={{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`,
            '--delay': `${Math.random() * 4}s`,
            '--size': `${1 + Math.random() * 2}px`,
          }}
        />
      ))}

      <HistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        history={history}
        onClear={handleClearHistory}
      />

      <header className="app-header">
        <div className="brand-icon-wrapper">
          <Clapperboard size={32} className="brand-icon" />
          <div className="brand-icon-ring" />
        </div>

        <h1 className="title-gradient">
          GraphRAG Engine
          <span className="title-cursor" />
        </h1>

        <div className="title-badges">
          <span className="badge">
            <Network size={12} />
            Graph Relationships
          </span>
          <span className="badge-sep" />
          <span className="badge">
            <Cpu size={12} />
            Vector Similarity
          </span>
          <span className="badge-sep" />
          <span className="badge">Neural Search</span>
        </div>

        <div className="header-scan-line" />

        {/* DATABASE STATUS BADGE */}
        <div className="db-status-badge">
          <div className="db-pulse" />
          <Database size={12} strokeWidth={2.5} />
          <span>Connected to Neo4j & Pinecone • Indexed on a curated 350-movie sample</span>
        </div>
      </header>

      <div className="search-container">
        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>

      <div className="results-outer">
        {isLoading && <LoadingState />}

        {result?.error && !isLoading && (
          <div className="error-panel glass-panel animate-slide-up">
            <div className="error-icon-row">
              <div className="error-dot" />
              <span>Connection Error</span>
            </div>
            <p>{result.error}</p>
          </div>
        )}

        {result && !result.error && !isLoading && (
          <ResultPanel result={result} query={query} watchlist={watchlist} toggleWatchlist={toggleWatchlist} />
        )}
      </div>

      {/* DEV PANEL TOGGLE BUTTON */}
      <button 
        className="dev-toggle-float"
        onClick={() => setShowDevPanel(true)}
      >
        <Settings size={22} />
        View Diagnostics
      </button>

      <WatchlistDock watchlist={watchlist} />
    </div>

    {/* THE SLIDING PANEL */}
      <DevPanel 
        isOpen={showDevPanel} 
        onClose={() => setShowDevPanel(false)} 
        result={result} 
      />
    </>
  );
}

export default App;
