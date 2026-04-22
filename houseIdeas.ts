import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { Home, Sparkles, Search, ArrowRight, Users, Facebook, Instagram, Pin, MessageSquare, Linkedin } from 'lucide-react';
import { PlanContext } from '../App';
import { PricingSection } from './PricingPage';

interface HomePageProps {
  onNavigate: (tab: 'browse' | '3d-generator' | 'interior-designer') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { region } = useContext(PlanContext);
  const isGBP = region === 'UK';

  return (
    <div className="flex flex-col h-full bg-app-bg text-app-text overflow-y-auto transition-colors duration-300">
      {/* Hero Section */}
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight">
            Instantly <span className="text-brand">visualize.</span><br />
            Design. <span className="text-brand">Transform.</span>
          </h1>
          
          <p className="text-base text-app-text/60 max-w-xl mx-auto font-light leading-relaxed">
            Draft uses advanced AI to turn your words into 3D models and your room photos into professional interior designs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              onClick={() => onNavigate('3d-generator')}
              className="px-6 py-3 bg-brand text-white rounded-2xl font-bold text-base hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 flex items-center gap-2 group"
            >
              <Home className="w-5 h-5" />
              Start 3D Layout
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('browse')}
              className="px-6 py-3 bg-app-surface border border-app-border text-app-text rounded-2xl font-bold text-base hover:bg-app-bg hover:border-app-text/20 transition-all shadow-sm flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Browse Ideas
            </button>
          </div>
        </motion.div>
      </div>

      {/* Plans Section */}
      <div className="border-y border-app-border bg-app-surface/30">
        <PricingSection showHeader={true} />
      </div>

      {/* Contact Section */}
      {!isGBP && (
        <div className="py-24 px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-app-text/60 mb-12">Have questions about our plans or custom solutions? We're here to help.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <a 
                href="mailto:draft.create1@gmail.com"
                className="p-8 bg-app-surface rounded-3xl border border-app-border hover:border-brand/30 transition-all group"
              >
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6 text-brand -rotate-45" />
                </div>
                <h3 className="font-bold mb-1">Email Us</h3>
                <p className="text-sm text-app-text/60">draft.create1@gmail.com</p>
              </a>
              <a 
                href="tel:470-983-1281"
                className="p-8 bg-app-surface rounded-3xl border border-app-border hover:border-brand/30 transition-all group"
              >
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6 text-brand -rotate-45" />
                </div>
                <h3 className="font-bold mb-1">Call Us</h3>
                <p className="text-sm text-app-text/60">470-983-1281</p>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-app-border bg-app-surface">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
              <span className="font-script text-white font-bold -rotate-6">D</span>
            </div>
            <span className="font-black tracking-tighter text-xl">DRAFT</span>
          </div>
          
          <div className="flex gap-6">
            <a 
              href="https://www.reddit.com/user/Draf_tofficial/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-app-text/40 hover:text-brand transition-colors"
              title="Reddit"
            >
              <MessageSquare className="w-5 h-5" />
            </a>
            <a 
              href="https://pin.it/bGrrkARpq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-app-text/40 hover:text-brand transition-colors"
              title="Pinterest"
            >
              <Pin className="w-5 h-5" />
            </a>
            <a 
              href="https://www.instagram.com/DRAF_TOFFICIAL/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-app-text/40 hover:text-brand transition-colors"
              title="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-app-text/40 hover:text-brand transition-colors"
              title="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-xs text-app-text/40 font-medium">
            © 2026 Draft AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
