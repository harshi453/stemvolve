import React, { useState, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Heart, Share2, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { HOUSE_IDEAS } from '../data/houseIdeas';

import { PlanContext } from '../App';

const HouseCard: React.FC<{ idea: any; index: number; onLike?: () => void }> = ({ idea, index, onLike }) => {
  const { favorites, setFavorites } = useContext(PlanContext);
  const [imageError, setImageError] = useState(false);
  const isLiked = favorites.some(fav => fav.id === idea.id);
  const fallbackImage = `https://picsum.photos/seed/${idea.id}/800/600`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: idea.title,
          text: idea.description,
          url: idea.url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(idea.url);
      alert("Link copied to clipboard!");
    }
  };

  const toggleLike = () => {
    if (isLiked) {
      setFavorites(prev => prev.filter(fav => fav.id !== idea.id));
    } else {
      setFavorites(prev => [...prev, idea]);
      if (onLike) onLike();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 1) }}
      className="bg-app-surface rounded-2xl overflow-hidden shadow-xl border border-app-border hover:border-app-text/20 transition-all group"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-app-bg">
        <img 
          src={imageError ? fallbackImage : idea.image} 
          alt={idea.title} 
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={toggleLike}
            className={cn(
              "p-2 backdrop-blur-sm rounded-full transition-all shadow-lg border",
              isLiked 
              ? "bg-red-500 border-red-500 text-white" 
              : "bg-app-surface/80 border-app-border text-app-text hover:text-red-500"
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
          </button>
          <button 
            onClick={handleShare}
            className="p-2 bg-app-surface/80 backdrop-blur-sm rounded-full text-app-text hover:text-brand transition-colors shadow-lg border border-app-border"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="px-2 py-1 bg-app-surface/80 backdrop-blur-sm text-app-text text-[10px] font-bold uppercase tracking-wider rounded border border-app-border">
            {idea.source}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {idea.tags.map((tag: string) => (
            <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-bold text-app-text mb-2">{idea.title}</h3>
        <p className="text-sm text-app-text/60 line-clamp-2 mb-4">{idea.description}</p>
        <a 
          href={idea.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 border border-app-border rounded-xl text-sm font-semibold text-app-text/60 hover:bg-app-bg flex items-center justify-center gap-2 transition-colors"
        >
          View on {idea.source}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};

export const BrowseIdeas: React.FC = () => {
  const { favorites, setFavorites, showFavorites, setShowFavorites } = useContext(PlanContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLikedBanner, setShowLikedBanner] = useState(false);

  const handleLike = () => {
    setShowLikedBanner(true);
    setTimeout(() => setShowLikedBanner(false), 1500);
  };

  const filteredIdeas = useMemo(() => {
    const source = showFavorites ? favorites : HOUSE_IDEAS;
    return source.filter(idea => 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, showFavorites, favorites]);

  return (
    <div className="flex flex-col h-full bg-app-bg text-app-text overflow-y-auto transition-colors duration-300">
      <AnimatePresence>
        {showLikedBanner && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-brand text-white px-8 py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest overflow-hidden shrink-0"
          >
            <Heart className="w-3 h-3 fill-current" />
            Liked
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-8 border-b border-app-border bg-app-surface shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-app-text flex items-center gap-2">
                {showFavorites ? <Heart className="w-8 h-8 text-red-500 fill-current" /> : <Search className="w-8 h-8 text-brand" />}
                {showFavorites ? 'Your Favorites' : 'Browse House Ideas'}
              </h2>
              <p className="text-app-text/60 mt-1">
                {showFavorites 
                  ? `You have ${favorites.length} saved inspirations.` 
                  : `Explore ${HOUSE_IDEAS.length} curated inspirations from around the web.`
                }
              </p>
            </div>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={cn(
                "ml-4 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
                showFavorites 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : "bg-app-bg text-app-text/60 border border-app-border hover:border-red-500/30 hover:text-red-500"
              )}
            >
              <Heart className={cn("w-4 h-4", showFavorites && "fill-current")} />
              {showFavorites ? 'Show All' : 'Favorites'}
              {favorites.length > 0 && !showFavorites && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search styles, tags..." 
              className="pl-10 pr-4 py-2 border border-app-border rounded-full bg-app-bg text-app-text focus:outline-none focus:ring-2 focus:ring-brand w-full md:w-64 placeholder:text-app-text/30 transition-colors duration-300"
            />
            <Search className="w-4 h-4 text-app-text/30 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full">
        {filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredIdeas.map((idea, index) => (
              <HouseCard key={idea.id} idea={idea} index={index} onLike={handleLike} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {showFavorites ? (
              <>
                <Heart className="w-16 h-16 text-app-text/10 mb-4" />
                <h3 className="text-xl font-bold text-app-text">No favorites yet</h3>
                <p className="text-app-text/60 mt-2">Start liking designs to see them here.</p>
                <button 
                  onClick={() => setShowFavorites(false)}
                  className="mt-6 text-brand font-bold hover:underline"
                >
                  Browse all ideas
                </button>
              </>
            ) : (
              <>
                <Search className="w-16 h-16 text-app-text/10 mb-4" />
                <h3 className="text-xl font-bold text-app-text">No results found</h3>
                <p className="text-app-text/60 mt-2">Try searching for a different style or keyword.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 text-brand font-bold hover:underline"
                >
                  Clear search
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
