import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileDown, CheckCircle2 } from 'lucide-react'; // Added FileDown icon
import { useState } from 'react';

export default function WatchlistDock({ watchlist }) {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    // 1. Format the list beautifully (Markdown format)
    const fileContent = `# 🎬 My Neural Graph Watchlist\n\n` + 
      watchlist.map((m, i) => `${i + 1}. **${m.title}**`).join('\n') + 
      `\n\n---\n*Generated via GraphRAG Engine.*`;

    // 2. Create a Blob (Binary Large Object) representing the file
    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8;' });
    
    // 3. Generate a temporary URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // 4. Create an invisible anchor tag, attach the URL, and force a click
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Neural_Watchlist.md'); // The name of the downloaded file
    document.body.appendChild(link);
    link.click();
    
    // 5. Clean up the DOM and memory
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // 6. Show success state
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <AnimatePresence>
      {watchlist.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 100, opacity: 0, x: '-50%' }}
          className="watchlist-dock-container"
        >
          {/* Stacked Avatars/Posters */}
          <div className="watchlist-avatars">
            {watchlist.slice(0, 3).map((movie, idx) => (
              <img 
                key={idx} 
                src={movie.poster || 'https://via.placeholder.com/35/1e293b/ffffff?text=M'} 
                alt={movie.title} 
                className="watchlist-avatar" 
                style={{ zIndex: 3 - idx }}
              />
            ))}
            {watchlist.length > 3 && (
              <div className="watchlist-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#94a3b8', zIndex: 0 }}>
                +{watchlist.length - 3}
              </div>
            )}
          </div>

          <div className="watchlist-info">
            <h4 className="watchlist-title">Curated Playlist</h4>
            <p className="watchlist-subtitle">{watchlist.length} movies selected</p>
          </div>

          <button className="watchlist-export-btn" onClick={handleExport}>
            {exported ? (
              <><CheckCircle2 size={16} /> Downloaded!</>
            ) : (
              <><FileDown size={16} /> Download List</>
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}