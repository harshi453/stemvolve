import React, { useState, Suspense, useContext } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Sky, Float, SoftShadows } from '@react-three/drei';
import { EffectComposer, Bloom, SSAO, Vignette, Noise } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Send, Home, Info, Maximize2, Minimize2, Eye, LayoutGrid, Box, RotateCcw, Sparkles, Moon, Sun, AlertCircle, Heart, Search, X, FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import { GLTFExporter } from 'three-stdlib';
import { generateHouseLayout, generateHouseRenders } from '../services/gemini';
import { HouseLayout } from '../types';
import { HouseModel } from './ThreeD/HouseModel';
import { FloorPlanViewer } from './shared/FloorPlanViewer';
import { RoomLegend } from './shared/RoomLegend';
import { cn } from '../lib/utils';
import { PlanContext } from '../App';

export const HouseGenerator: React.FC = () => {
  const { plan, setActiveTab, favorites, setFavorites, setShowFavorites } = useContext(PlanContext);
  const [prompt, setPrompt] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [floors, setFloors] = useState('1');
  const [customizations, setCustomizations] = useState('');
  const [loading, setLoading] = useState(false);
  const [layouts, setLayouts] = useState<HouseLayout[]>([]);
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(0);
  const [images, setImages] = useState<{ label: string; image: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'floorplan' | '3d'>('floorplan');
  const [isNightMode, setIsNightMode] = useState(false);
  const [visibleFloor, setVisibleFloor] = useState<number | null>(null);
  const [showRoof, setShowRoof] = useState(false);
  const [houseStyle, setHouseStyle] = useState<'modern' | 'classic' | 'brutalist'>('modern');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const floorPlanRef = React.useRef<HTMLDivElement>(null);
  const threeContainerRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<THREE.Scene | null>(null);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!threeContainerRef.current) return;
    if (!document.fullscreenElement) {
      threeContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const SceneGrabber = () => {
    const { scene } = useThree();
    React.useEffect(() => {
      sceneRef.current = scene;
    }, [scene]);
    return null;
  };

  const limits = {
    standard: { floors: 2, bedrooms: 3, bathrooms: 3, projects: 3 },
    professional: { floors: 5, bedrooms: 6, bathrooms: 6, projects: 25 },
    premium: { floors: 100, bedrooms: 100, bathrooms: 100, projects: 1000 }
  };

  const currentLimits = limits[plan];
  const isOverFloors = plan !== 'premium' && parseInt(floors) > currentLimits.floors;
  const isOverBedrooms = plan !== 'premium' && parseInt(bedrooms) > currentLimits.bedrooms;
  const isOverBathrooms = plan !== 'premium' && parseInt(bathrooms) > currentLimits.bathrooms;
  const isLimited = isOverFloors || isOverBedrooms || isOverBathrooms;

  const handleGenerate = async () => {
    if (!prompt.trim() || isLimited) return;
    setLoading(true);
    setError(null);
    setLayouts([]);
    setCurrentLayoutIndex(0);
    setVisibleFloor(null);
    setImages([]);
    
    try {
      // Construct a detailed prompt from the specific fields
      const detailedPrompt = `
        Base requirements: ${prompt}
        Bedrooms: ${bedrooms}
        Bathrooms: ${bathrooms}
        Floors: ${floors}
        Specific Room Customizations: ${customizations}
      `.trim();

      // Generate multiple layout options in parallel
      const [layout1, layout2] = await Promise.all([
        generateHouseLayout(detailedPrompt, 'Modern'),
        generateHouseLayout(`${detailedPrompt} (Alternative layout option)`, 'Modern')
      ]);
      
      setLayouts([layout1, layout2]);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || '';
      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        setError('The AI is currently receiving too many requests. Please wait a moment and try again.');
      } else {
        setError('Failed to generate house design. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLayouts([]);
    setCurrentLayoutIndex(0);
    setVisibleFloor(null);
    setImages([]);
    setPrompt('');
    setBedrooms('3');
    setBathrooms('2');
    setFloors('1');
    setCustomizations('');
    setError(null);
  };

  const handleExport = async () => {
    if (!layout) return;
    setIsExporting(true);
    
    try {
      // 1. Export 3D Render (if in 3D mode)
      if (activeView === '3d') {
        const canvas = threeContainerRef.current?.querySelector('canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.download = `Draft-3D-Render-${layout.id}.png`;
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // 2. Export 3D Model (GLB)
        if (sceneRef.current) {
          // Small delay to ensure render download starts
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const exporter = new GLTFExporter();
          exporter.parse(
            sceneRef.current,
            (result) => {
              const output = result instanceof ArrayBuffer ? result : JSON.stringify(result);
              const blob = new Blob([output], { type: 'model/gltf-binary' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `Draft-Model-${layout.id}.glb`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            },
            (error) => {
              console.error('Error exporting GLB:', error);
              setError("Failed to export 3D model.");
            },
            { binary: true }
          );
        }
      }

      // 3. Export Floor Plan Image
      if (activeView === 'floorplan' && floorPlanRef.current) {
        const canvas = await html2canvas(floorPlanRef.current, {
          backgroundColor: isNightMode ? '#1a1c1e' : '#f5f2ed',
          scale: 2,
          useCORS: true,
          logging: false
        });
        const link = document.createElement('a');
        link.download = `Draft-FloorPlan-${layout.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

    } catch (err) {
      console.error("Export failed", err);
      setError("Failed to export design. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const layout = layouts[currentLayoutIndex];
  const isFavorited = layout && favorites.some(fav => fav.id === layout.id);
  const selectedRoom = layout?.rooms.find(r => r.id === selectedRoomId);

  const updateRoom = (roomId: string, updates: Partial<HouseLayout['rooms'][0]>) => {
    if (!layout) return;
    const newLayouts = [...layouts];
    const currentLayout = { ...newLayouts[currentLayoutIndex] };
    currentLayout.rooms = currentLayout.rooms.map(r => 
      r.id === roomId ? { ...r, ...updates } : r
    );
    newLayouts[currentLayoutIndex] = currentLayout;
    setLayouts(newLayouts);
  };

  const handleToggleFavorite = () => {
    if (!layout) return;
    if (isFavorited) {
      setFavorites(prev => prev.filter(fav => fav.id !== layout.id));
    } else {
      // Create a rich favorite object that BrowseIdeas can display
      const favoriteItem = {
        ...layout,
        type: 'house',
        title: prompt || `Custom ${houseStyle} House`,
        description: customizations || `A custom ${houseStyle} house with ${bedrooms} bedrooms and ${bathrooms} bathrooms.`,
        image: images[0]?.image || `https://picsum.photos/seed/${layout.id}/800/600`,
        tags: [houseStyle, `${bedrooms} BR`, `${bathrooms} BA`, `${floors} Floors`],
        source: 'AI Generator',
        url: '#', // In a real app, this would be a deep link
        date: new Date().toISOString()
      };
      setFavorites(prev => [...prev, favoriteItem]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-app-bg text-app-text overflow-y-auto transition-colors duration-300">
      <div className="p-8 border-b border-app-border bg-app-surface shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-app-text flex items-center gap-3">
            <Box className="w-8 h-8 text-brand" />
            3D Home Generator
          </h2>
          <p className="text-app-text/60 mt-2">Describe your dream home — get a floor plan and realistic AI renders.</p>
        </div>
      </div>

      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Input Panel */}
        <div className="bg-app-surface p-6 rounded-2xl border border-app-border shadow-xl space-y-6 transition-colors duration-300">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand uppercase tracking-wider">Bedrooms</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-app-bg text-app-text transition-colors duration-300",
                    isOverBedrooms ? "border-red-500 ring-red-500" : "border-app-border"
                  )}
                />
                {isOverBedrooms && (
                  <p className="text-[10px] text-red-500 font-bold">Max {currentLimits.bedrooms} on {plan}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand uppercase tracking-wider">Restrooms</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-app-bg text-app-text transition-colors duration-300",
                    isOverBathrooms ? "border-red-500 ring-red-500" : "border-app-border"
                  )}
                />
                {isOverBathrooms && (
                  <p className="text-[10px] text-red-500 font-bold">Max {currentLimits.bathrooms} on {plan}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand uppercase tracking-wider">Floors</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-app-bg text-app-text transition-colors duration-300",
                    isOverFloors ? "border-red-500 ring-red-500" : "border-app-border"
                  )}
                />
                {isOverFloors && (
                  <p className="text-[10px] text-red-500 font-bold">Max {currentLimits.floors} on {plan}</p>
                )}
              </div>
            </div>

            {isLimited && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-red-500 font-bold">Plan Limit Exceeded</p>
                  <p className="text-[10px] text-red-500/70">Upgrade your plan to design larger houses.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-600 transition-colors"
                >
                  Upgrade
                </button>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand uppercase tracking-wider">Room Customizations</label>
              <input
                type="text"
                value={customizations}
                onChange={(e) => setCustomizations(e.target.value)}
                placeholder="e.g., Modern living area, sleek kitchen..."
                className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-app-bg text-app-text placeholder:text-app-text/30 transition-colors duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand uppercase tracking-wider">Other Requirements</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Open-concept, large windows, attached garage..."
                className="w-full h-32 px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-app-bg text-app-text placeholder:text-app-text/30 resize-none transition-colors duration-300"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || isLimited}
              className="flex-1 py-4 bg-brand text-white rounded-xl font-bold text-lg hover:bg-brand-dark disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? "Designing..." : "Generate Design"}
            </button>
            {layout && (
              <button 
                onClick={handleReset}
                className="p-4 bg-app-bg border border-app-border rounded-xl text-app-text/40 hover:text-app-text hover:bg-app-bg/80 transition-all"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {layout && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-app-surface p-6 rounded-2xl border border-app-border shadow-xl transition-colors duration-300 space-y-6"
            >
              <RoomLegend rooms={layout.rooms} />
              
              <div className="pt-6 border-t border-app-border space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-brand uppercase tracking-wider">Layout Options</label>
                  <span className="text-[10px] font-bold text-app-text/40 bg-app-bg px-2 py-0.5 rounded-full border border-app-border">
                    Option {currentLayoutIndex + 1} of {layouts.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {layouts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentLayoutIndex(idx)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-bold transition-all border",
                        currentLayoutIndex === idx
                        ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
                        : "bg-app-bg text-app-text/60 border-app-border hover:border-brand/30"
                      )}
                    >
                      Layout {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Viewer Panel */}
            <div className="bg-app-surface rounded-2xl border border-app-border shadow-2xl overflow-hidden h-[550px] flex flex-col transition-colors duration-300">
              <div className="px-4 py-3 border-b border-app-border flex items-center justify-between bg-app-surface/50 backdrop-blur-md shrink-0 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1">
                  {[
                    { id: 'floorplan', icon: LayoutGrid, label: 'Plan' },
                    { id: '3d', icon: Box, label: '3D' }
                  ].map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view.id as any)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap",
                        activeView === view.id 
                        ? "bg-brand text-white shadow-lg shadow-brand/20" 
                        : "text-app-text/40 hover:text-app-text/60 hover:bg-app-bg"
                      )}
                    >
                      <view.icon className="w-4 h-4" />
                      {view.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNightMode(!isNightMode)}
                    className={cn(
                      "p-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold",
                      isNightMode 
                      ? "bg-slate-800 text-yellow-400 border border-slate-700" 
                      : "bg-yellow-50 text-yellow-600 border border-yellow-100"
                    )}
                  >
                    {isNightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    {isNightMode ? "Night" : "Day"}
                  </button>
                  
                  {activeView === '3d' && (
                    <button
                      onClick={toggleFullscreen}
                      className="flex items-center gap-2 px-3 py-1.5 bg-brand/10 text-brand rounded-lg border border-brand/20 hover:bg-brand/20 transition-all"
                    >
                      {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                      <span className="text-[10px] font-bold uppercase">
                        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      </span>
                    </button>
                  )}

                  {(activeView === '3d' || activeView === 'floorplan') && layout && (
                    <div className="flex items-center gap-1 bg-app-bg p-1 rounded-xl border border-app-border">
                      <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1.5",
                          isExporting 
                          ? "bg-app-bg text-app-text/40 border-app-border cursor-wait" 
                          : "bg-app-surface text-brand border-brand/20 hover:bg-brand/5"
                        )}
                        title={activeView === '3d' ? "Export 3D Model & Render" : "Export Floor Plan Image"}
                      >
                        {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
                        {isExporting ? "Exporting..." : "Export"}
                      </button>
                      <div className="w-px h-4 bg-app-border mx-1" />
                      <button
                        onClick={handleToggleFavorite}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5",
                          isFavorited 
                          ? "bg-brand text-white" 
                          : "bg-app-surface text-app-text/60 border border-app-border hover:border-brand/30"
                        )}
                      >
                        <Heart className={cn("w-3 h-3", isFavorited && "fill-current")} />
                        {isFavorited ? "Saved" : "Save"}
                      </button>
                      {isFavorited && (
                        <>
                          <div className="w-px h-4 bg-app-border mx-1" />
                          <button
                            onClick={() => {
                              setShowFavorites(true);
                              setActiveTab('browse');
                            }}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 flex items-center gap-1.5"
                          >
                            <Search className="w-3 h-3" />
                            View Favorites
                          </button>
                        </>
                      )}
                      <div className="w-px h-4 bg-app-border mx-1" />
                      <select 
                        value={houseStyle}
                        onChange={(e) => setHouseStyle(e.target.value as any)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-app-bg border border-app-border text-app-text outline-none focus:border-brand transition-all"
                      >
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="brutalist">Brutalist</option>
                      </select>
                      <div className="w-px h-4 bg-app-border mx-1" />
                      <button
                        onClick={() => setShowRoof(!showRoof)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5",
                          showRoof 
                          ? "bg-brand text-white shadow-sm" 
                          : "text-app-text/40 hover:text-app-text/60 bg-app-bg border border-app-border"
                        )}
                      >
                        <Box className="w-3 h-3" />
                        {showRoof ? "Hide Roof" : "Show Roof"}
                      </button>
                      <div className="w-px h-4 bg-app-border mx-1" />
                      <button
                        onClick={() => setVisibleFloor(null)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                          visibleFloor === null 
                          ? "bg-brand text-white shadow-sm" 
                          : "text-app-text/40 hover:text-app-text/60"
                        )}
                      >
                        All
                      </button>
                      {Array.from(new Set(layout.rooms.map(r => r.floor))).sort().map(f => (
                        <button
                          key={f}
                          onClick={() => setVisibleFloor(f)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                            visibleFloor === f 
                            ? "bg-brand text-white shadow-sm" 
                            : "text-app-text/40 hover:text-app-text/60"
                          )}
                        >
                          Floor {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 relative overflow-hidden">
                {activeView === 'floorplan' && (
                  <div 
                    ref={floorPlanRef}
                    className={cn(
                      "h-full flex items-center justify-center transition-colors duration-500",
                      isNightMode ? "bg-[#1a1c1e]" : "bg-[#f5f2ed]"
                    )}
                  >
                    <FloorPlanViewer rooms={layout.rooms} isNightMode={isNightMode} />
                  </div>
                )}

                {activeView === '3d' && (
                  <div ref={threeContainerRef} className="h-full relative bg-slate-950">
                    <Canvas 
                      shadows 
                      dpr={[1, 2]} 
                      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
                      onPointerMissed={() => setSelectedRoomId(null)}
                    >
                      <SoftShadows size={2.5} samples={20} focus={0} />
                      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={40} />
                      <OrbitControls 
                        enableDamping 
                        dampingFactor={0.05}
                        minDistance={5}
                        maxDistance={50}
                        maxPolarAngle={Math.PI / 2.1}
                        makeDefault
                      />
                      
                      <Sky 
                        sunPosition={isNightMode ? [0, -1, 0] : [1, 0.5, 1]} 
                        turbidity={0.01}
                        rayleigh={0.2}
                        mieCoefficient={0.005}
                        mieDirectionalG={0.8}
                      />
                      <Environment preset={isNightMode ? "night" : "city"} />
                      
                      <fog attach="fog" args={isNightMode ? ["#030712", 10, 50] : ["#cbd5e0", 20, 100]} />
                      
                      <ambientLight intensity={isNightMode ? 0.02 : 0.4} />
                      
                      <directionalLight 
                        position={[10, 20, 10]} 
                        intensity={isNightMode ? 0.15 : 0.7} 
                        castShadow 
                        shadow-mapSize={[2048, 2048]}
                        shadow-bias={-0.0001}
                        shadow-camera-far={50}
                        shadow-camera-left={-20}
                        shadow-camera-right={20}
                        shadow-camera-top={20}
                        shadow-camera-bottom={-20}
                      />

                      <SceneGrabber />

                      <ContactShadows 
                        position={[0, -0.01, 0]} 
                        opacity={0.4} 
                        scale={40} 
                        blur={2} 
                        far={4.5} 
                      />

                      <Suspense fallback={null}>
                        <HouseModel 
                          layout={layout} 
                          isNightMode={isNightMode} 
                          visibleFloor={visibleFloor}
                          showRoof={showRoof}
                          style={houseStyle}
                          selectedRoomId={selectedRoomId}
                          onRoomSelect={setSelectedRoomId}
                        />
                      </Suspense>

                      <EffectComposer>
                        <SSAO 
                          intensity={20} 
                          radius={0.3} 
                          luminanceInfluence={0.6} 
                        />
                        <Bloom 
                          intensity={isNightMode ? 1.0 : 0.2} 
                          luminanceThreshold={isNightMode ? 0.4 : 0.9} 
                          luminanceSmoothing={0.9} 
                        />
                        <Vignette eskil={false} offset={0.1} darkness={0.5} />
                      </EffectComposer>
                    </Canvas>

                    {/* Room Editor Overlay */}
                    <AnimatePresence>
                      {selectedRoom && (
                        <motion.div
                          initial={{ x: 300, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 300, opacity: 0 }}
                          className="absolute top-4 right-4 bottom-4 w-72 bg-app-surface/95 backdrop-blur-xl border border-app-border rounded-3xl shadow-2xl p-6 z-10 flex flex-col gap-6"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tighter flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-brand" />
                              Room Editor
                            </h3>
                            <button 
                              onClick={() => setSelectedRoomId(null)}
                              className="p-2 hover:bg-app-bg rounded-xl transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-brand">Room Name</label>
                              <input 
                                type="text"
                                value={selectedRoom.name}
                                onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })}
                                className="w-full px-4 py-2 bg-app-bg border border-app-border rounded-xl text-sm focus:ring-2 focus:ring-brand outline-none"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-brand">Room Type</label>
                              <select 
                                value={selectedRoom.type}
                                onChange={(e) => updateRoom(selectedRoom.id, { type: e.target.value as any })}
                                className="w-full px-4 py-2 bg-app-bg border border-app-border rounded-xl text-sm focus:ring-2 focus:ring-brand outline-none"
                              >
                                <option value="living">Living Room</option>
                                <option value="bedroom">Bedroom</option>
                                <option value="bathroom">Bathroom</option>
                                <option value="kitchen">Kitchen</option>
                                <option value="dining">Dining Room</option>
                                <option value="garage">Garage</option>
                                <option value="stairs">Stairs</option>
                                <option value="elevator">Elevator</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-brand">Dimensions</label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[8px] text-app-text/40">Width (m)</span>
                                  <input 
                                    type="number"
                                    step="0.1"
                                    value={selectedRoom.width}
                                    onChange={(e) => updateRoom(selectedRoom.id, { width: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-1.5 bg-app-bg border border-app-border rounded-lg text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8px] text-app-text/40">Depth (m)</span>
                                  <input 
                                    type="number"
                                    step="0.1"
                                    value={selectedRoom.depth}
                                    onChange={(e) => updateRoom(selectedRoom.id, { depth: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-1.5 bg-app-bg border border-app-border rounded-lg text-xs"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-brand">Position</label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[8px] text-app-text/40">X Offset (m)</span>
                                  <input 
                                    type="number"
                                    step="0.1"
                                    value={selectedRoom.x}
                                    onChange={(e) => updateRoom(selectedRoom.id, { x: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-1.5 bg-app-bg border border-app-border rounded-lg text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8px] text-app-text/40">Z Offset (m)</span>
                                  <input 
                                    type="number"
                                    step="0.1"
                                    value={selectedRoom.z}
                                    onChange={(e) => updateRoom(selectedRoom.id, { z: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-1.5 bg-app-bg border border-app-border rounded-lg text-xs"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-app-border space-y-4">
                              <button 
                                onClick={() => {
                                  if (!layout) return;
                                  const newLayouts = [...layouts];
                                  const currentLayout = { ...newLayouts[currentLayoutIndex] };
                                  currentLayout.rooms = currentLayout.rooms.filter(r => r.id !== selectedRoom.id);
                                  newLayouts[currentLayoutIndex] = currentLayout;
                                  setLayouts(newLayouts);
                                  setSelectedRoomId(null);
                                }}
                                className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Delete Room
                              </button>
                              <p className="text-[10px] text-app-text/40 italic">
                                Changes are reflected in real-time in the 3D model.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!layout && !loading && (
          <div className="h-[400px] flex flex-col items-center justify-center gap-6 px-12 text-center bg-app-surface rounded-2xl border border-app-border shadow-xl">
            <div className="w-24 h-24 rounded-[2rem] bg-app-bg flex items-center justify-center border border-app-border shadow-sm">
              <Home className="w-12 h-12 text-app-text/20" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-app-text">Your design will appear here</h3>
              <p className="text-app-text/60 mt-2 max-w-sm mx-auto">
                Enter your requirements above to generate an architectural floor plan and 3D model.
              </p>
            </div>
          </div>
        )}

        {loading && !layout && (
          <div className="h-[400px] flex flex-col items-center justify-center gap-6 bg-app-surface rounded-2xl border border-app-border shadow-xl relative overflow-hidden">
            {/* Blueprint Grid Animation */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'linear-gradient(to right, var(--color-brand) 1px, transparent 1px), linear-gradient(to bottom, var(--color-brand) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-brand/5 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <LayoutGrid className="w-12 h-12 text-brand" />
                </motion.div>
              </div>
            </div>
            <div className="text-center z-10">
              <p className="text-2xl font-bold text-app-text tracking-tight">Drafting Blueprint...</p>
              <p className="text-app-text/60 mt-1 italic font-mono text-sm">Calculating structural integrity & spatial flow</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
