import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Home, LogOut, User, Bot, Mail, ChevronDown, Leaf, Sparkles } from 'lucide-react';
import AgamyaLogo from './AgamyaLogo';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authData, setAuthData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    if (token && username) {
      setAuthData({ username, role, email });
    } else {
      setAuthData(null);
    }
  }, [location]); // Re-run when route changes to catch login/logout events

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setAuthData(null);
    navigate('/');
  };

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50 rounded-none">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-4 group">
          <AgamyaLogo size={44} />
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white group-hover:text-[#00cfff] transition-all glow-text-white">AGAMYA</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#00cfff] font-black opacity-80">Intelligent Foreknower</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                isActive('/')
                  ? 'bg-white/10 text-white border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home size={16} /> Home
            </Link>
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-[#00cfff]/15 text-[#00cfff] border border-[#00cfff]/30 shadow-[0_0_15px_rgba(0,207,255,0.2)]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={16} /> War Room
            </Link>
            <Link
              to="/sustainability"
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                isActive('/sustainability')
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'text-white/50 hover:text-emerald-400 hover:bg-emerald-500/5'
              }`}
            >
              <Leaf size={16} className={isActive('/sustainability') ? '' : 'animate-pulse'} /> Greenest Route
            </Link>
            {authData && (
              <button
                onClick={() => {
                  window.postMessage({ action: 'show' }, '*');
                  navigate('/agent');
                }}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-black transition-all ${
                  isActive('/agent')
                    ? 'bg-[#00cfff] text-[#000814] shadow-[0_0_30px_rgba(0,207,255,0.8)] border border-[#00cfff]/50'
                    : 'bg-[#00cfff]/5 text-white/70 hover:text-[#00cfff] hover:bg-[#00cfff]/10 border border-[#00cfff]/20'
                }`}
              >
                <Sparkles size={18} className={isActive('/agent') ? 'text-[#000814]' : 'text-[#00cfff] animate-pulse'} /> Agamya Agent
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-white/10 mx-1" />

          {authData ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 hover:bg-[#00cfff]/5 p-1.5 rounded-2xl transition-all border border-transparent hover:border-[#00cfff]/15"
              >
                <motion.div
                  animate={{ boxShadow: ['0 0 6px rgba(0,207,255,0.3)', '0 0 14px rgba(0,207,255,0.7)', '0 0 6px rgba(0,207,255,0.3)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00cfff]/20 to-[#0044cc]/20 flex items-center justify-center border border-[#00cfff]/30"
                >
                  <User size={16} className="text-[#00cfff]" />
                </motion.div>
                <div className="hidden sm:block text-left">
                  <p className="text-white font-bold leading-none tracking-tight text-sm">{authData.username}</p>
                  <p className="text-[10px] text-[#00cfff] uppercase tracking-widest font-black mt-0.5">{authData.role}</p>
                </div>
                <ChevronDown size={14} className={`text-white/30 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-72 glass-panel p-5 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(0,207,255,0.08)] z-50 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00cfff] to-transparent" />
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#00cfff]/10 flex items-center justify-center border border-[#00cfff]/25 shadow-[0_0_15px_rgba(0,207,255,0.2)]">
                          <User size={28} className="text-[#00cfff]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{authData.username}</h3>
                          <span className="text-[10px] bg-[#00cfff]/15 text-[#00cfff] px-2 py-0.5 rounded-md border border-[#00cfff]/25 font-black uppercase tracking-widest">
                            {authData.role}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                          <Mail size={16} className="text-white/40" />
                          <div className="overflow-hidden">
                            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Email Address</p>
                            <p className="text-sm text-white/80 truncate font-medium">{authData.email || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-red-500/20"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-5 py-2 bg-[#00cfff]/10 hover:bg-[#00cfff]/20 text-[#00cfff] rounded-lg text-sm font-medium transition-all border border-[#00cfff]/25 shadow-[0_0_10px_rgba(0,207,255,0.1)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
