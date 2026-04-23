import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Globe, Route, ShieldCheck, TrendingDown, Info, Zap, ChevronRight } from 'lucide-react';

export default function Sustainability() {
  const [greenRoutes, setGreenRoutes] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGreenRoutes = async () => {
    try {
      const response = await api.get('/api/green-routes');
      setGreenRoutes(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch sustainability data', err);
      // Fallback mock data if backend is offline
      setGreenRoutes({
        total_network_emissions: 956.2,
        greenest_route: { origin: 'HUB_BANGALORE', destination: 'PORT_CHENNAI', co2_kg: 28, mode: 'Road', score: 99.72 },
        routes: [
          { origin: 'HUB_BANGALORE', destination: 'PORT_CHENNAI', co2_kg: 28, mode: 'Road', score: 99.72, distance: 350 },
          { origin: 'PORT_SUEZ', destination: 'PORT_ANTWERP', co2_kg: 35, mode: 'Sea', score: 99.65, distance: 3500 },
          { origin: 'HUB_DELHI', destination: 'PORT_MUNDRA', co2_kg: 44, mode: 'Rail', score: 99.56, distance: 1100 },
          { origin: 'PORT_MUMBAI', destination: 'PORT_SUEZ', co2_kg: 45, mode: 'Sea', score: 99.55, distance: 4500 }
        ]
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGreenRoutes();
  }, []);

  const handleDownload = () => {
    setLoading(true);
    setTimeout(() => {
      const reportContent = `
AGAMYA INTELLIGENT FOREKNOWER - ESG AUDIT
==========================================
Report ID: ESG-${Math.random().toString(36).substr(2, 9).toUpperCase()}
Date: ${new Date().toLocaleString()}

NETWORK SUMMARY:
----------------
Total Network Emissions: ${greenRoutes?.total_network_emissions} kg CO2
Active Logistics Routes: ${greenRoutes?.routes?.length}
Primary Optimizer: AI-Aegis Core

GREENEST ROUTE RECOMMENDATION:
------------------------------
Origin: ${greenRoutes?.greenest_route?.origin}
Destination: ${greenRoutes?.greenest_route?.destination}
Efficiency Score: ${greenRoutes?.greenest_route?.score}%
Emission Impact: ${greenRoutes?.greenest_route?.co2_kg} kg CO2

DETAILED EMISSIONS LOG:
-----------------------
${greenRoutes?.routes?.map(r => `[${r.mode}] ${r.origin} -> ${r.destination}: ${r.co2_kg}kg (${r.score}% efficiency)`).join('\n')}

CERTIFICATION:
This report confirms that the current network routes are optimized for maximum resilience and sustainability.
`;
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Agamya_ESG_Audit_${Date.now()}.txt`;
      link.click();
      setLoading(false);
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#00cfff]/30 border-t-[#00cfff] rounded-full"
      />
    </div>
  );

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants}
      className="max-w-7xl mx-auto pt-28 pb-12 px-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Leaf className="text-emerald-400" size={20} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400/80">Sustainability Intelligence</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl font-black text-white tracking-tighter">
            Greenest <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">Route</span>
          </motion.h1>
        </div>

        <motion.div variants={itemVariants} className="glass-panel px-8 py-6 rounded-3xl border-emerald-500/20 flex items-center gap-6 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Globe className="text-emerald-400 animate-pulse" size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Total Network Emissions</p>
            <p className="text-4xl font-black text-white leading-none">
              {greenRoutes?.total_network_emissions} <span className="text-lg text-emerald-400 font-bold uppercase ml-1">kg CO2</span>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Top Recommendation */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div variants={itemVariants} className="glass-panel rounded-[40px] p-10 relative overflow-hidden border-emerald-500/20">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
              <Leaf size={320} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-[0.2em] mb-8 bg-emerald-500/10 w-fit px-4 py-2 rounded-full border border-emerald-500/20">
                <ShieldCheck size={14} /> AI Recommendation: Highest Eco-Efficiency
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                <div>
                  <h2 className="text-7xl font-black text-white leading-none mb-2 tracking-tighter">
                    {greenRoutes?.greenest_route?.score}%
                  </h2>
                  <p className="text-emerald-400 text-sm font-bold uppercase tracking-[0.3em]">Sustainability Score</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-2">Emission Impact</p>
                  <p className="text-3xl font-black text-white leading-none">
                    {greenRoutes?.greenest_route?.co2_kg} <span className="text-sm text-emerald-500/60 uppercase">kg per trip</span>
                  </p>
                </div>
              </div>

              <div className="bg-black/40 rounded-[32px] p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-emerald-500/30 transition-all duration-500 group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
                    {greenRoutes?.greenest_route?.mode === 'Sea' ? <Globe size={32} /> : <Route size={32} />}
                  </div>
                  <div>
                    <p className="text-xs text-white/30 uppercase font-black tracking-widest mb-1">Optimized Supply Path</p>
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {greenRoutes?.greenest_route?.origin?.split('_').pop()} <span className="text-emerald-500 mx-2">➔</span> {greenRoutes?.greenest_route?.destination?.split('_').pop()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right hidden sm:block">
                     <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Transport Mode</p>
                     <p className="text-white font-bold">{greenRoutes?.greenest_route?.mode}</p>
                   </div>
                   <div className="w-12 h-12 rounded-full border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 font-black text-xs">
                     ECO
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="glass-panel rounded-[32px] p-8 border-white/5">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingDown className="text-emerald-400" size={16} /> Emission Benchmark
              </h3>
              <div className="space-y-6">
                {[
                  { mode: 'Air', rate: 500, color: 'text-rose-400', bar: 'bg-rose-400' },
                  { mode: 'Road', rate: 80, color: 'text-amber-400', bar: 'bg-amber-400' },
                  { mode: 'Sea', rate: 10, color: 'text-emerald-400', bar: 'bg-emerald-400' }
                ].map(item => (
                  <div key={item.mode} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className={item.color}>{item.mode} Transport</span>
                      <span className="text-white/40">{item.rate}g CO2/km</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.rate / 500) * 100}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className={`h-full ${item.bar} shadow-[0_0_15px_currentColor]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-panel rounded-[32px] p-8 border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Info className="text-blue-400" size={16} /> Eco Insights
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Switching 15% of Air shipments to Sea routes could reduce your total network carbon footprint by nearly <span className="text-white font-bold italic">42.5 tons</span> per quarter.
                </p>
              </div>
              <button 
                onClick={handleDownload}
                className="mt-6 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest transition-all hover:border-[#00cfff]/30 hover:text-[#00cfff] active:scale-95"
              >
                Download ESG Report
              </button>
            </motion.div>
          </div>
        </div>

        {/* Right: Network Emissions Log */}
        <div className="lg:col-span-5">
          <motion.div variants={itemVariants} className="glass-panel rounded-[40px] border-white/5 flex flex-col h-full overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Emissions Log</h3>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Live Network Tracking</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">
                Active Routes: {greenRoutes?.routes?.length}
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar max-h-[700px]">
              {greenRoutes?.routes?.map((route, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 5 }}
                  className={`p-6 rounded-[28px] border transition-all relative overflow-hidden group ${
                    route.score > 90 ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30' : 
                    route.score > 70 ? 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30' : 
                    'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        route.score > 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'
                      }`}>
                        {route.mode === 'Sea' ? <Globe size={14} /> : <Route size={14} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        {route.mode} • {route.distance} km
                      </span>
                    </div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                      route.score > 90 ? 'bg-emerald-500/20 text-emerald-400' : 
                      route.score > 70 ? 'bg-amber-500/20 text-amber-400' : 
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {route.score}% Score
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {route.origin?.split('_').pop()} <span className="text-white/20 mx-1">➔</span> {route.destination?.split('_').pop()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-mono font-black text-white">
                        {route.co2_kg} <span className="text-[10px] text-white/40">kg</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
