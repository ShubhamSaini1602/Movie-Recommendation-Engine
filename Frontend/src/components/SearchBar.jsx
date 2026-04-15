import { Search, Sparkles, Film, Star, TrendingUp, HelpCircle } from 'lucide-react';

const suggestions = [
  { icon: Film, label: 'Movies similar to The Matrix' },
  { icon: TrendingUp, label: 'How is DiCaprio related to Nolan?' },
  { icon: HelpCircle, label: 'Movies to watch when feeling low' },
  { icon: Star, label: 'Tell me everything about Inception' },
  { icon: HelpCircle, label: 'Recommend me some horror Movies' },
  { icon: TrendingUp, label: 'Movies starring Leonardo DiCaprio and Kate Winslet' },
  { icon: Film, label: 'Best sci-fi movies after 2015' },
];

export default function SearchBar({ query, setQuery, onSearch, isLoading }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch(query);
  };

  return (
    <div className="searchbar-root">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="premium-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the GraphRAG engine anything..."
          disabled={isLoading}
          autoComplete="off"
          spellCheck="false"
        />
        <button
          className={`search-btn ${isLoading ? 'search-btn--loading' : ''}`}
          onClick={() => onSearch(query)}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <span className="btn-spinner" />
          ) : (
            <>
              <Sparkles size={14} />
              Analyze
            </>
          )}
        </button>
      </div>
      <div className="chips-container">
        {suggestions.map(({ icon: Icon, label }, index) => (
          <button
            key={index}
            className="suggestion-chip"
            style={{ '--chip-delay': `${index * 0.08}s` }}
            onClick={() => {
              setQuery(label);
              onSearch(label);
            }}
            disabled={isLoading}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
