/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, Layout, Info, Search, Moon, Sun, MessageSquare, Mail, Phone, LogIn, LogOut, User, CreditCard, Heart, X, AlertCircle } from 'lucide-react';
import { HouseGenerator } from './components/HouseGenerator';
import { InteriorDesigner } from './components/InteriorDesigner';
import { BrowseIdeas } from './components/BrowseIdeas';
import { HomePage } from './components/HomePage';
import { PricingPage } from './components/PricingPage';
import { cn } from './lib/utils';
import { auth, signInWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { PlanType, Region } from './types';
import { Globe, MapPin } from 'lucide-react';

import { Chatbot } from './components/Chatbot';

export const PlanContext = React.createContext<{
  plan: PlanType;
  setPlan: (plan: PlanType) => void;
  setActiveTab: (tab: Tab) => void;
  aiDesignsUsed: number;
  setAiDesignsUsed: (count: number | ((prev: number) => number)) => void;
  visualizationsUsed: number;
  setVisualizationsUsed: (count: number | ((prev: number) => number)) => void;
  projectsUsed: number;
  setProjectsUsed: (count: number | ((prev: number) => number)) => void;
  region: Region | null;
  setRegion: (region: Region) => void;
  setShowContacts: (show: boolean) => void;
  favorites: any[];
  setFavorites: (favs: any[] | ((prev: any[]) => any[])) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
}>({ 
  plan: 'standard', 
  setPlan: () => {}, 
  setActiveTab: () => {},
  aiDesignsUsed: 0,
  setAiDesignsUsed: () => {},
  visualizationsUsed: 0,
  setVisualizationsUsed: () => {},
  projectsUsed: 0,
  setProjectsUsed: () => {},
  region: null,
  setRegion: () => {},
  setShowContacts: () => {},
  favorites: [],
  setFavorites: () => {},
  showFavorites: false,
  setShowFavorites: () => {}
});

type Tab = 'home' | 'browse' | '3d-generator' | 'interior-designer';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(false);
  const [plan, setPlan] = useState<PlanType>('standard');
  const [aiDesignsUsed, setAiDesignsUsed] = useState(0);
  const [visualizationsUsed, setVisualizationsUsed] = useState(0);
  const [projectsUsed, setProjectsUsed] = useState(0);
  const [region, setRegion] = useState<Region | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const savedRegion = localStorage.getItem('user-region') as Region;
    if (savedRegion) {
      setRegion(savedRegion);
    } else {
      // Try to detect location gracefully
      if ("geolocation" in navigator && navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
          if (result.state === 'granted') {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (tz.includes('Europe')) handleSetRegion('EU');
                else if (tz.includes('London') || tz.includes('GB')) handleSetRegion('UK');
                else if (tz.includes('Calcutta') || tz.includes('India')) handleSetRegion('IN');
                else handleSetRegion('US');
              }
            );
          } else if (result.state === 'prompt') {
            // Wait for user to trigger it later or show modal
            setShowLocationModal(true);
          } else {
            setShowLocationModal(true);
          }
        });
      } else {
        setShowLocationModal(true);
      }
    }
  }, []);

  useEffect(() => {
    const lastLogin = localStorage.getItem('last-login');
    const now = Date.now();
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;

    const timer = setTimeout(() => {
      if (lastLogin && now - parseInt(lastLogin) > twoWeeks) {
        // Force re-login
        localStorage.removeItem('user-data');
        setShowLoginModal(true);
      } else if (!user) {
        setShowLoginModal(true);
      }
      localStorage.setItem('last-login', now.toString());
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [user]);

  const handleSetRegion = (r: Region) => {
    setRegion(r);
    localStorage.setItem('user-region', r);
    setShowLocationModal(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthLoading(false);
    }, (error) => {
      console.error("Auth error:", error);
      setAuthError(error.message);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
      localStorage.setItem('last-login', Date.now().toString());
      setShowLoginModal(false);
    } catch (error: any) {
      console.error("Login failed", error);
      setAuthError(error.message);
    }
  };

  const handleSetPlan = (newPlan: PlanType) => {
    setPlan(newPlan);
  };

  return (
    <PlanContext.Provider value={{ 
      plan, 
      setPlan: handleSetPlan, 
      setActiveTab, 
      aiDesignsUsed, 
      setAiDesignsUsed, 
      visualizationsUsed,
      setVisualizationsUsed,
      projectsUsed,
      setProjectsUsed,
      region, 
      setRegion: handleSetRegion,
      setShowContacts,
      favorites,
      setFavorites,
      showFavorites,
      setShowFavorites
    }}>
      <div className="flex flex-col h-screen bg-app-bg font-sans text-app-text overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="h-16 bg-app-surface border-b border-app-border flex items-center justify-between px-6 shrink-0 z-20 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center relative group-hover:scale-105 transition-transform",
            isDark ? "bg-[#8a9a5b]" : "bg-[#3b82f6]"
          )}>
            {/* Dashed Circle */}
            <div className="absolute inset-1 border-2 border-white/30 border-dashed rounded-full" />
            <span className="font-script text-2xl text-white font-bold -rotate-6">Draft</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-app-text">DRAFT</h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-app-bg/50 p-1 rounded-xl border border-app-border">
          <button
            onClick={() => setActiveTab('home')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'home' 
              ? "bg-brand text-white shadow-sm" 
              : "text-app-text/60 hover:text-app-text hover:bg-app-surface"
            )}
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveTab('browse');
              setShowFavorites(false);
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeTab === 'browse' 
              ? "bg-brand text-white shadow-sm" 
              : "text-app-text/60 hover:text-app-text hover:bg-app-surface"
            )}
          >
            <Search className="w-4 h-4" />
            Browse
          </button>
          <button
            onClick={() => setActiveTab('3d-generator')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeTab === '3d-generator' 
              ? "bg-brand text-white shadow-sm" 
              : "text-app-text/60 hover:text-app-text hover:bg-app-surface"
            )}
          >
            <Home className="w-4 h-4" />
            3D Layout
          </button>
          <button
            onClick={() => setActiveTab('interior-designer')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeTab === 'interior-designer' 
              ? "bg-brand text-white shadow-sm" 
              : "text-app-text/60 hover:text-app-text hover:bg-app-surface"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Interior AI
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {/* Mobile Theme & Profile */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-app-text/40 hover:text-app-text transition-colors bg-app-bg/50 rounded-lg border border-app-border"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-brand/30" />
            ) : (
              <button onClick={handleLogin} className="p-2 text-brand">
                <LogIn className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-app-text/40 hover:text-app-text transition-colors bg-app-bg/50 rounded-lg border border-app-border"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-app-bg/50 border border-app-border rounded-lg text-xs font-bold text-app-text/60 transition-all">
              <Search className="w-3.5 h-3.5 text-brand" />
              {region || 'Detecting...'}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-app-text truncate max-w-[100px]">{user.displayName}</span>
                  <button onClick={logout} className="text-[10px] text-brand hover:underline font-bold uppercase">Sign Out</button>
                </div>
                <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-brand/30" />
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-app-bg">
        {/* Auth Service Diagnostic */}
        <AnimatePresence>
          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 min-w-[320px] max-w-[90vw]"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-[11px] flex-1">
                <p className="font-bold mb-0.5 leading-none">Security Access Blocked</p>
                <p className="opacity-90 leading-tight">
                  {authError.includes('auth/unauthorized-domain') 
                    ? "Login domain missing from Firebase list. Click the 🔒 icon in address bar -> 'Reset Permissions' and try again." 
                    : authError}
                </p>
              </div>
              <button onClick={() => setAuthError(null)} className="p-1 hover:bg-white/10 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <Chatbot />
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <HomePage onNavigate={setActiveTab} />
            </motion.div>
          )}
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="absolute inset-0"
            >
              <BrowseIdeas />
            </motion.div>
          )}
          {activeTab === '3d-generator' && (
            <motion.div
              key="3d"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="absolute inset-0"
            >
              <HouseGenerator />
            </motion.div>
          )}
          {activeTab === 'interior-designer' && (
            <motion.div
              key="interior"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="absolute inset-0"
            >
              <InteriorDesigner />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation (Bottom) */}
      <div className="md:hidden h-16 bg-app-surface border-t border-app-border flex items-center justify-around px-6 shrink-0 z-20 transition-colors duration-300">
        <button
          onClick={() => setActiveTab('home')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'home' ? "text-brand" : "text-app-text/40"
          )}
        >
          <Layout className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('browse');
            setShowFavorites(false);
          }}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'browse' ? "text-brand" : "text-app-text/40"
          )}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Browse</span>
        </button>
        <button
          onClick={() => setActiveTab('3d-generator')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === '3d-generator' ? "text-brand" : "text-app-text/40"
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">3D Layout</span>
        </button>
        <button
          onClick={() => setActiveTab('interior-designer')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'interior-designer' ? "text-brand" : "text-app-text/40"
          )}
        >
          <Sparkles className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Interior AI</span>
        </button>
      </div>
      {/* Modals */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-app-surface border border-app-border rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-brand/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-brand" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-4">Welcome to Draft</h2>
                <p className="text-app-text/60 mb-10 text-lg">Please select your region to see local pricing and features.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'US', label: 'United States', sub: 'USA', icon: '🇺🇸' },
                    { id: 'EU', label: 'Europe', sub: 'EU', icon: '🇪🇺' },
                    { id: 'UK', label: 'United Kingdom', sub: 'UK', icon: '🇬🇧' },
                    { id: 'IN', label: 'India', sub: 'India', icon: '🇮🇳' },
                    { id: 'OTHER', label: 'Other Regions', sub: 'Global', icon: '🌐' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSetRegion(r.id as Region)}
                      className="p-6 rounded-3xl bg-app-bg border border-app-border hover:border-brand hover:scale-[1.02] transition-all group text-left"
                    >
                      <span className="text-3xl mb-3 block">{r.icon}</span>
                      <p className="font-bold text-app-text group-hover:text-brand transition-colors">{r.label}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-app-text/40">{r.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showContacts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-app-surface border border-app-border rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-app-text mb-2">Contact Us</h3>
              <p className="text-sm text-app-text/60 mb-6">Feel free to email your feedbacks</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-app-bg rounded-2xl border border-app-border">
                  <Mail className="w-6 h-6 text-brand" />
                  <div>
                    <p className="text-xs font-bold text-brand uppercase">Email Address</p>
                    <p className="text-sm text-app-text">draft.create1@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-app-bg rounded-2xl border border-app-border">
                  <Phone className="w-6 h-6 text-brand" />
                  <div>
                    <p className="text-xs font-bold text-brand uppercase">Phone Number</p>
                    <p className="text-sm text-app-text">470-983-1281</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowContacts(false)}
                className="w-full mt-6 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}

        {showLoginModal && !user && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-app-surface border border-app-border rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10 text-center">
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 relative",
                  isDark ? "bg-slate-800" : "bg-[#3b82f6]"
                )}>
                  <div className="absolute inset-1 border-2 border-white/30 border-dashed rounded-2xl" />
                  <span className="font-script text-3xl text-white font-bold -rotate-6">Draft</span>
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-2">Join the Future of Design</h2>
                <p className="text-app-text/60 mb-8">Sign up to save your projects and unlock premium AI features.</p>
                
                <button
                  onClick={handleLogin}
                  className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all shadow-xl"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>
                
                <p className="mt-6 text-[10px] text-app-text/40 uppercase tracking-widest">
                  By joining, you agree to our Terms & Privacy Policy
                </p>

                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="mt-8 text-sm font-bold text-app-text/40 hover:text-app-text transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </PlanContext.Provider>
  );
}

