import React, { useState, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Loader2, Sparkles, Palette, Lightbulb, Layout, Layers, Check, Info, ThumbsUp, ThumbsDown, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateInteriorDesigns } from '../services/gemini';
import { InteriorDesignOption } from '../types';
import { PlanContext } from '../App';

export const InteriorDesigner: React.FC = () => {
  const { plan, setActiveTab, aiDesignsUsed, setAiDesignsUsed, favorites, setFavorites, setShowFavorites } = useContext(PlanContext);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<InteriorDesignOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<InteriorDesignOption | null>(null);
  const [satisfied, setSatisfied] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aiLimits = {
    standard: 8,
    professional: 15,
    premium: 1000 // Unlimited for practical purposes
  };

  const currentLimit = aiLimits[plan];
  const isLimitReached = aiDesignsUsed >= currentLimit;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setOptions([]);
        setSelectedOption(null);
        setSatisfied(null);
        setError(null);
      };
      reader.readAsDataURL(file);
      // Reset input value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const handleReset = () => {
    setImage(null);
    setOptions([]);
    setSelectedOption(null);
    setSatisfied(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!image || isLimitReached) return;
    setLoading(true);
    setError(null);
    setSatisfied(null);
    try {
      const results = await generateInteriorDesigns(image, 'Modern');
      if (!results || results.length === 0) {
        throw new Error("No design options were generated. Please try a different photo.");
      }
      setOptions(results);
      setSelectedOption(results[0]);
      setAiDesignsUsed(prev => prev + 1);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || '';
      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        setError("The AI is currently busy. Please wait a few seconds and try again.");
      } else {
        setError(err.message || "Failed to analyze room. Please try again with a clearer photo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (option: InteriorDesignOption) => {
    const isLiked = favorites.some(fav => fav.id === option.id);
    if (isLiked) {
      setFavorites(prev => prev.filter(fav => fav.id !== option.id));
    } else {
      setFavorites(prev => [...prev, { ...option, type: 'interior' }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-app-bg text-app-text overflow-y-auto transition-colors duration-300">
      <div className="p-6 border-b border-app-border bg-app-surface shadow-sm transition-colors duration-300">
        <h2 className="text-2xl font-semibold text-app-text flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand" />
          AI Interior Designer
        </h2>
        <p className="text-app-text/60 mt-1">Upload a photo of your room and get instant design ideas.</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column: Input */}
        <div className="space-y-6">
          <div 
            className="aspect-video bg-app-bg/50 rounded-2xl border-2 border-dashed border-app-border flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-brand/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <>
                <img src={image} alt="Room" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-app-text/20 mb-2" />
                <p className="text-app-text/40 font-medium">Click to upload room photo</p>
                <p className="text-xs text-app-text/20 mt-1">Supports JPG, PNG</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={!image || loading || isLimitReached}
              className="flex-1 py-4 bg-brand text-white rounded-xl font-bold text-lg hover:bg-brand-dark disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand/20"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              Generate Design Options
            </button>
            {image && (
              <button
                onClick={handleReset}
                className="px-6 py-4 bg-app-bg border border-app-border rounded-xl text-app-text/40 hover:text-app-text hover:bg-app-bg/80 transition-all"
                title="Reset"
              >
                <RefreshCw className="w-6 h-6" />
              </button>
            )}
          </div>

          {isLimitReached && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4"
            >
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-500 font-bold">AI Design Limit Reached</p>
                <p className="text-xs text-red-500/70">
                  {aiDesignsUsed >= currentLimit 
                    ? `You have used all ${currentLimit} designs for this month.`
                    : "Plan Limit Reached."}
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('home')}
                className="px-4 py-2 bg-red-500 text-white text-xs font-black uppercase rounded-xl hover:bg-red-600 transition-colors"
              >
                Upgrade Plan
              </button>
            </motion.div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium flex items-center gap-3">
              <Info className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="h-[400px] flex flex-col items-center justify-center bg-app-surface rounded-2xl border border-app-border shadow-xl transition-colors duration-300 relative overflow-hidden">
              {/* Architectural Grid */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'linear-gradient(to right, var(--color-brand) 1px, transparent 1px), linear-gradient(to bottom, var(--color-brand) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12 text-brand" />
              </motion.div>
              <p className="mt-4 text-lg font-bold text-app-text">Rendering Concepts...</p>
              <p className="text-sm text-app-text/60 font-mono">Applying textures & lighting models</p>
            </div>
          ) : options.length > 0 ? (
            <div className="space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOption(opt)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedOption?.id === opt.id
                      ? 'bg-brand text-white'
                      : 'bg-app-bg text-app-text/60 border border-app-border'
                    }`}
                  >
                    {opt.title}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {selectedOption && (
                  <motion.div
                    key={selectedOption.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-app-surface rounded-2xl border border-app-border shadow-xl overflow-hidden transition-colors duration-300"
                  >
                    <div className="p-6 space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-app-text">{selectedOption.title}</h3>
                        <p className="text-app-text/60 mt-2 leading-relaxed">{selectedOption.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                            <Palette className="w-4 h-4" />
                            Color Palette
                          </div>
                          <div className="flex gap-2">
                            {selectedOption.palette.map((color, i) => (
                              <div 
                                key={i} 
                                className="w-8 h-8 rounded-full border border-app-border shadow-sm" 
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-yellow-500">
                            <Lightbulb className="w-4 h-4" />
                            Lighting
                          </div>
                          <p className="text-xs text-app-text/60">{selectedOption.lighting}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-app-bg/50 rounded-xl border border-app-border/50">
                          <Layout className="w-5 h-5 text-brand mt-0.5" />
                          <div>
                            <span className="text-sm font-semibold text-app-text">Furniture Layout</span>
                            <p className="text-xs text-app-text/60 mt-1">{selectedOption.furnitureLayout}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-app-bg/50 rounded-xl border border-app-border/50">
                          <Layers className="w-5 h-5 text-brand/60 mt-0.5" />
                          <div>
                            <span className="text-sm font-semibold text-app-text">Textures & Materials</span>
                            <p className="text-xs text-app-text/60 mt-1">{selectedOption.textures}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold text-brand uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" />
                            Key Pieces to Shop
                          </div>
                          <span className="text-[10px] font-bold text-app-text/40 bg-app-bg px-2 py-0.5 rounded-full border border-app-border">
                            {selectedOption.shoppingList.length} Items
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {selectedOption.shoppingList.map((item, i) => (
                            <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-app-bg/50 rounded-2xl border border-app-border/50 group/item hover:border-brand/30 transition-all hover:shadow-lg hover:shadow-black/5">
                              <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-app-bg">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-app-text truncate">{item.name}</h4>
                                    <span className="text-xs font-black text-brand tabular-nums">{item.price}</span>
                                  </div>
                                  <p className="text-[11px] text-app-text/60 line-clamp-2 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                                <div className="mt-3 sm:mt-0 flex items-center justify-end">
                                  <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-brand text-white hover:bg-brand-dark rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-brand/10 hover:shadow-brand/20 active:scale-95"
                                  >
                                    Shop Now
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Satisfaction Section */}
                        <div className="pt-4 border-t border-app-border/50">
                          <div className="bg-app-bg/30 rounded-2xl p-4 border border-app-border/30">
                            <p className="text-sm font-bold text-app-text text-center mb-4">Are you satisfied with these pieces?</p>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => {
                                  setSatisfied(true);
                                  if (selectedOption && !favorites.some(fav => fav.id === selectedOption.id)) {
                                    setFavorites(prev => [...prev, { ...selectedOption, type: 'interior' }]);
                                  }
                                }}
                                className={cn(
                                  "flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all",
                                  satisfied === true 
                                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                                  : "bg-app-surface text-app-text/60 border border-app-border hover:border-green-500/30"
                                )}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                Yes, I love them
                              </button>
                              <button 
                                onClick={() => {
                                  setSatisfied(false);
                                  handleGenerate();
                                }}
                                className={cn(
                                  "flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all",
                                  satisfied === false 
                                  ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                                  : "bg-app-surface text-app-text/60 border border-app-border hover:border-red-500/30"
                                )}
                              >
                                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                                No, show more
                              </button>
                            </div>
                            {satisfied === true && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-3 mt-4"
                              >
                                <p className="text-[10px] text-green-500 font-bold text-center">
                                  Awesome! We've saved these to your favorites.
                                </p>
                                <button
                                  onClick={() => {
                                    setShowFavorites(true);
                                    setActiveTab('browse');
                                  }}
                                  className="px-4 py-2 bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-full border border-brand/20 hover:bg-brand/20 transition-colors flex items-center gap-2"
                                >
                                  <Search className="w-3 h-3" />
                                  View Favorites
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          if (selectedOption && !favorites.some(fav => fav.id === selectedOption.id)) {
                            setFavorites(prev => [...prev, { ...selectedOption, type: 'interior' }]);
                          }
                          setSatisfied(true);
                        }}
                        className="w-full py-3 bg-brand text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors shadow-lg shadow-brand/10"
                      >
                        <Check className="w-4 h-4" />
                        Save this Design
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-app-text/40 bg-app-surface rounded-2xl border-2 border-dashed border-app-border transition-colors duration-300">
              <Sparkles className="w-12 h-12 mb-4 opacity-20 text-brand" />
              <p className="text-center max-w-xs">Upload a photo and select a style to see AI-generated design options.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
