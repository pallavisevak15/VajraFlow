import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Mic, 
  Settings, 
  Activity, 
  Globe, 
  Shield, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react';

export default function AgamyaAgentNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('chat');

  const navItems = [
    { id: 'chat', icon: <MessageSquare size={20} />, label: 'Neural Chat', action: 'show' },
    { id: 'voice', icon: <Mic size={20} />, label: 'Voice Link', action: 'voice' },
    { id: 'network', icon: <Activity size={20} />, label: 'Network Pulse', path: '/dashboard' },
    { id: 'green', icon: <Zap size={20} />, label: 'Eco-Routes', path: '/sustainability' },
  ];

  const handleAction = (item) => {
    setActiveMode(item.id);
    if (item.action) {
      window.postMessage({ action: item.action }, '*');
    }
    if (item.path) {
      window.location.href = item.path;
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] flex items-center gap-4">
      {/* --- Expand/Collapse Toggle --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-24 glass-panel rounded-full flex items-center justify-center text-[#00cfff] hover:bg-[#00cfff]/10 transition-all border-white/10"
      >
        {isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* --- Main Navigation Panel --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="glass-panel p-4 rounded-[32px] border-[#00cfff]/20 shadow-[0_0_50px_rgba(0,207,255,0.15)] flex flex-col gap-4"
          >
            <div className="flex flex-col items-center gap-2 mb-4 border-b border-white/5 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00cfff]/20 to-[#0044cc]/20 flex items-center justify-center border border-[#00cfff]/30 animate-pulse">
                <Bot className="text-[#00cfff]" size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00cfff]">Agamya AI</span>
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAction(item)}
                className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  activeMode === item.id 
                    ? 'bg-[#00cfff] text-[#000814] shadow-[0_0_20px_rgba(0,207,255,0.6)]' 
                    : 'bg-white/5 text-white/40 hover:text-[#00cfff] hover:bg-[#00cfff]/10 border border-white/5 hover:border-[#00cfff]/30'
                }`}
              >
                {item.icon}
                
                {/* Tooltip */}
                <div className="absolute right-full mr-4 px-3 py-1.5 rounded-lg bg-[#000814] border border-[#00cfff]/30 text-[#00cfff] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-[0_0_15px_rgba(0,207,255,0.2)]">
                  {item.label}
                </div>

                {/* Active Indicator Dot */}
                {activeMode === item.id && (
                  <motion.div 
                    layoutId="activeDot"
                    className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#00cfff] shadow-[0_0_10px_#00cfff]"
                  />
                )}
              </button>
            ))}

            <div className="mt-4 pt-4 border-t border-white/5">
              <button className="w-12 h-12 rounded-xl bg-white/5 text-white/20 hover:text-white/60 flex items-center justify-center transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
