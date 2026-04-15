import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Film, Sparkles, Star, Plus, Check } from 'lucide-react';

const CarouselCard = ({ movie, variants, watchlist, toggleWatchlist }) => {
  const [posterUrl, setPosterUrl] = useState(null);
  const [rating, setRating] = useState(null);
  const [extractedTitle, setExtractedTitle] = useState(null);
  const [extractedGenres, setExtractedGenres] = useState([]);

  useEffect(() => {

    let currentTitle = "";
    let currentGenres = [];

    if (typeof movie === 'string') {
      // It's a fallback string! Extract the title using Regex.
      const titleMatch = movie.match(/Movie Title:\s*(.+)/i);
      if (titleMatch) currentTitle = titleMatch[1].trim();

      // Attempt to extract genres if they exist in the string
      const genreMatch = movie.match(/Genre:[\s\S]*?(?=Themes:|Awards:|$)/i);
      if (genreMatch) {
        currentGenres = genreMatch[0]
          .replace(/Genre:/i, '')
          .split('\n')
          .map(g => g.replace(/[-\s]/g, '').trim())
          .filter(g => g.length > 0);
      }
    } else {
      // It's a normal object from Neo4j
      currentTitle = movie.title || "";
      if (movie.genres) {
        currentGenres = movie.genres.split(',').map(g => g.trim());
      }
    }

    setExtractedTitle(currentTitle);
    setExtractedGenres(currentGenres);

    // FETCH TMDB POSTER
    const fetchMovieData = async () => {;

      try {
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
          params: {
            api_key: import.meta.env.VITE_TMDB_API_KEY,
            query: currentTitle
          }
        });

        // If we found a match, grab the poster AND the rating
        if (response.data.results?.[0]) {
          const data = response.data.results[0];
          
          if (data.poster_path) {
            setPosterUrl(`https://image.tmdb.org/t/p/w500${data.poster_path}`);
          }
          
          // Only show rating if it's greater than 0
          if (data.vote_average > 0) {
            setRating(data.vote_average.toFixed(1)); 
          }
        }
      } catch (error) {
        console.error("TMDB Fetch Error:", error);
      }
    };

    fetchMovieData();
  }, [movie]);

  // Check if this movie is already in the watchlist array
  const isAdded = watchlist.some(m => m.title === extractedTitle);

  return (
    <motion.div 
      variants={variants}
      className="carousel-card"
    >
      <div className="carousel-poster-wrapper">
        {/* WATCHLIST BUTTON */}
        <button 
          className={`carousel-add-btn ${isAdded ? 'added' : ''}`}
          onClick={() => toggleWatchlist({ title: extractedTitle, poster: posterUrl })}
          title="Add to Watchlist"
        >
          {isAdded ? <Check size={14} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
        </button>

        {rating && (
          <div className="carousel-rating-badge">
            <Star size={12} fill="#fbbf24" color="#fbbf24" />
            <span>{rating}</span>
          </div>
        )}
        {posterUrl ? (
          <img src={posterUrl} alt={extractedTitle} className="carousel-poster-img" />
        ) : (
          <div className="carousel-poster-placeholder">
            <Film size={32} opacity={0.3} color="#94a3b8" />
          </div>
        )}
      </div>

      <div className="carousel-info">
        <h5 className="carousel-title" title={extractedTitle}>
          {extractedTitle || "Unknown Movie"}
        </h5>
        
        <div className="carousel-genres">
          {extractedGenres.slice(0, 2).map((genre, idx) => (
            <span key={idx} className="carousel-genre-pill">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function MovieGrid({ movies, watchlist, toggleWatchlist }) {
  if (!movies || movies.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="movie-grid-wrapper">
      <h4 className="movie-grid-header">
        <Sparkles size={16} color="#c084fc" />
        Similar Movies Discovered
      </h4>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="carousel-container"
      >
        {movies.map((movie, idx) => (
          <CarouselCard key={idx} movie={movie} variants={itemVariants} watchlist={watchlist} toggleWatchlist={toggleWatchlist} />
        ))}
      </motion.div>
    </div>
  );
}