import { Clock, History, Trash2, X, Search } from 'lucide-react';

export default function HistorySidebar({ isOpen, onToggle, history, onClear }) {
  return (
    <>
      <button
        className={`sidebar-toggle-btn ${isOpen ? 'sidebar-toggle-btn--active' : ''}`}
        onClick={onToggle}
        title={isOpen ? 'Close history' : 'Open history'}
      >
        {isOpen ? <X size={18} /> : <History size={18} />}
        {!isOpen && history.length > 0 && (
          <span className="sidebar-toggle-badge">{history.length}</span>
        )}
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
      />

      <aside className={`history-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-left">
            <div className="sidebar-header-icon-wrap">
              <Clock size={14} />
            </div>
            <span>Query History</span>
          </div>
          {history.length > 0 && (
            <button className="sidebar-clear-btn" onClick={onClear} title="Clear all history">
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="sidebar-scan-line" />

        <div className="sidebar-content">
          {history.length === 0 ? (
            <div className="sidebar-empty">
              <div className="sidebar-empty-icon-wrap">
                <Search size={24} />
              </div>
              <p className="sidebar-empty-title">No history yet</p>
              <span className="sidebar-empty-sub">
                Your past queries will be recorded here automatically
              </span>
            </div>
          ) : (
            <div className="sidebar-history-list">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  className="history-item"
                  style={{ '--item-delay': `${index * 0.04}s` }}
                >
                  <div className="history-item-index">{history.length - index}</div>
                  <div className="history-item-content">
                    <p className="history-item-query">{item.query}</p>
                    <div className="history-item-meta">
                      <Clock size={10} />
                      <span className="history-item-time">{item.time}</span>
                    </div>
                  </div>
                  <div className="history-item-glow" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-dot" />
          <span>{history.length} {history.length === 1 ? 'query' : 'queries'} recorded</span>
        </div>
      </aside>
    </>
  );
}
