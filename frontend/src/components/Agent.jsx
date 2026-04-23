import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, MessageSquare, TrendingUp, Mic, PhoneCall } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GROWTH_DATA = [
  { month: 'Jan', resilience: 65, efficiency: 40, growth: 20 },
  { month: 'Feb', resilience: 72, efficiency: 45, growth: 25 },
  { month: 'Mar', resilience: 68, efficiency: 55, growth: 35 },
  { month: 'Apr', resilience: 85, efficiency: 60, growth: 45 },
  { month: 'May', resilience: 82, efficiency: 70, growth: 55 },
  { month: 'Jun', resilience: 90, efficiency: 75, growth: 65 },
  { month: 'Jul', resilience: 94, efficiency: 85, growth: 78, isProjection: true },
  { month: 'Aug', resilience: 96, efficiency: 90, growth: 88, isProjection: true },
  { month: 'Sep', resilience: 98, efficiency: 95, growth: 95, isProjection: true },
];

export default function Agent() {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Manual bridge to OmniDimension Widget message API
    window.OmniDimension = {
      startChat: () => {
        window.postMessage({ action: 'show' }, '*');
      },
      startWebCall: () => {
        window.postMessage({ action: 'voice' }, '*');
      },
      call: () => {
        window.location.href = 'tel:+1800AGAMYA'; // Default support line
      },
      user: {
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email'),
        role: localStorage.getItem('role')
      }
    };

    const checkReady = setInterval(() => {
      // The widget script itself doesn't set window.OmniDimension, 
      // but we use its existence in DOM as a readiness signal.
      if (document.getElementById('omnidimension-web-widget-container')) {
        setIsReady(true);
        clearInterval(checkReady);
      }
    }, 500);
    return () => clearInterval(checkReady);
  }, []);

  const handleChat = () => {
    console.log("Triggering Omni Chat...");
    if (window.OmniDimension && typeof window.OmniDimension.startChat === 'function') {
      window.OmniDimension.startChat();
    } else {
      console.warn("OmniDimension.startChat not found or initializing.");
    }
  };

  const handleWebCall = () => {
    console.log("Triggering Omni WebCall...");
    if (window.OmniDimension && typeof window.OmniDimension.startWebCall === 'function') {
      window.OmniDimension.startWebCall();
    } else {
      console.warn("OmniDimension.startWebCall not found or initializing.");
    }
  };

  const handleCall = () => {
    console.log("Triggering Omni Call...");
    if (window.OmniDimension && typeof window.OmniDimension.call === 'function') {
      window.OmniDimension.call();
    } else {
      console.warn("OmniDimension.call not found or initializing.");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617]">
      
      {/* --- DYNAMIC EARTH BACKGROUND --- */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#000814]">
        {/* Deep Background Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,102,255,0.1),_transparent_70%)]" />
        
        {/* Rotating Earth Image */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 180, repeat: Infinity, ease: "linear" },
            scale: { duration: 30, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-0 bg-center bg-no-repeat opacity-40 mix-blend-screen"
          style={{ 
            backgroundImage: 'url("/dynamic_earth_tech_bg.png")',
            backgroundSize: '150% auto'
          }}
        />

        {/* Secondary Counter-Rotating Grid Layer */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Overlay Gradients for Depth and Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_90%)]" />
        
        {/* Moving Tech Particles / Data Nodes */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              opacity: [0, 0.3, 0],
              y: ["0%", "-20%"],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: Math.random() * 15 + 10, 
              repeat: Infinity, 
              delay: Math.random() * 10 
            }}
            className="absolute w-1 h-1 bg-primary rounded-full blur-[2px] shadow-[0_0_10px_#3b82f6]"
          />
        ))}
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-10 px-6 w-full max-w-[1600px] mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Branding & Features */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-panel p-12 md:p-16 rounded-[40px] border-white/5 shadow-[0_0_80px_rgba(0,225,255,0.1)] backdrop-blur-3xl"
          >
            <div className="text-left">
              <motion.div 
                animate={{ 
                  boxShadow: ["0 0 20px rgba(59,130,246,0.4)", "0 0 40px rgba(59,130,246,0.8)", "0 0 20px rgba(59,130,246,0.4)"]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center mb-10"
              >
                <Bot className="text-white" size={48} />
              </motion.div>
              
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-none">
                Agamya <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Assistance</span>
              </h2>
              
              <p className="text-primary font-bold tracking-[0.4em] uppercase text-xs mb-12">Active Intelligence Node</p>
              
              <div className="space-y-6">
                <div 
                  onClick={handleChat}
                  className="cursor-pointer bg-white/5 p-6 rounded-3xl border border-white/5 flex gap-6 hover:bg-white/10 transition-all duration-500 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-white mb-2">Global Optimization</h4>
                    <p className="text-base text-white/40 leading-relaxed italic">Analyzing 10,000+ global routes to find the most resilient path.</p>
                  </div>
                </div>
                <div 
                  onClick={handleChat}
                  className="cursor-pointer bg-white/5 p-6 rounded-3xl border border-white/5 flex gap-6 hover:bg-white/10 transition-all duration-500 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MessageSquare className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-white mb-2">Predictive Awareness</h4>
                    <p className="text-base text-white/40 leading-relaxed italic">Syncing satellite data to anticipate network disruptions.</p>
                  </div>
                </div>

                <div 
                  onClick={handleWebCall}
                  className="cursor-pointer bg-white/5 p-6 rounded-3xl border border-white/5 flex gap-6 hover:bg-white/10 transition-all duration-500 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mic className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-white mb-2">Voice Intelligence</h4>
                    <p className="text-base text-white/40 leading-relaxed italic">Hands-free AI coordination via real-time voice synthesis.</p>
                  </div>
                </div>

                <div 
                  onClick={handleCall}
                  className="cursor-pointer bg-white/5 p-6 rounded-3xl border border-white/5 flex gap-6 hover:bg-white/10 transition-all duration-500 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <PhoneCall className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-white mb-2">Direct Support</h4>
                    <p className="text-base text-white/40 leading-relaxed italic">Instant connection to Agamya command center specialists.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Growth Projection Chart */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel p-10 rounded-[40px] border-white/5 shadow-[0_0_80px_rgba(0,225,255,0.1)] backdrop-blur-3xl h-full flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3 text-white/90">
                  <TrendingUp className="text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" /> Future Growth Projection
                </h2>
                <p className="text-white/40 text-xs mt-1">Network resilience and operational positivity.</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Historical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Projected</span>
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e1ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00e1ff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResilience" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-panel p-4 rounded-2xl border-white/10 shadow-2xl backdrop-blur-2xl">
                            <p className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                              {label} {payload[0].payload.isProjection && <span className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">PROJECTION</span>}
                            </p>
                            <div className="space-y-1">
                              {payload.map((entry, index) => (
                                <div key={index} className="flex justify-between items-center gap-6">
                                  <span className="text-[10px] text-white/50 font-medium capitalize">{entry.name}</span>
                                  <span className="text-xs font-mono font-bold" style={{ color: entry.color }}>
                                    {entry.value}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="growth" 
                    name="Overall Positivity"
                    stroke="#00e1ff" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorGrowth)" 
                    dot={{ r: 3, fill: '#00e1ff', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resilience" 
                    name="System Resilience"
                    stroke="#6366f1" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorResilience)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-sm text-white/60">
                <span className="text-primary font-bold">AI Prediction:</span> Network resilience is expected to hit <span className="text-white font-black">98%</span> by September through optimized pivot routing.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

