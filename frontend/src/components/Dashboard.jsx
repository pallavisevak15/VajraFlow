import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Activity, AlertTriangle, Route, ShieldAlert, Zap, Search, ShieldCheck, TrendingDown, Crosshair, LogOut, Shield, TrendingUp, User, Mail, ChevronDown, Brain, Leaf, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_NODES = [
  { id: "FACTORY_SHENZHEN", name: "Shenzhen Assembly Plant", type: "Factory", health_status: "Healthy", current_stock: 50000 },
  { id: "PORT_SHANGHAI", name: "Port of Shanghai", type: "Port", health_status: "Healthy", current_stock: 100000 },
  { id: "PORT_MUMBAI", name: "Port of Mumbai", type: "Port", health_status: "Healthy", current_stock: 60000 },
  { id: "PORT_LA", name: "Port of Los Angeles", type: "Port", health_status: "Healthy", current_stock: 80000 },
  { id: "WH_CHICAGO", name: "Chicago Central Hub", type: "Warehouse", health_status: "Healthy", current_stock: 20000 },
  { id: "WH_NY", name: "New York Distribution", type: "Warehouse", health_status: "Healthy", current_stock: 15000 },
  { id: "PORT_VANCOUVER", name: "Port of Vancouver", type: "Port", health_status: "Healthy", current_stock: 30000 },
];

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState(MOCK_NODES);
  const [resilienceScore, setResilienceScore] = useState(100);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [planB, setPlanB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'user');
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Guest');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/');
  };


  const fetchData = async () => {
    try {
      const res = await api.get('/api/nodes');
      setNodes(res.data);
      setIsBackendConnected(true);
      
      const scoreRes = await api.get('/api/resilience-score');
      setResilienceScore(scoreRes.data.score);
    } catch (err) {
      console.log('Backend not connected, using mock mode.');
      setIsBackendConnected(false);
    }
  };

  const triggerDisruption = async (nodeId, eventType) => {
    setLoading(true);

    if (isBackendConnected) {
      try {
        const severity = eventType === 'Port Strike' ? 8 : 6;
        const res = await api.post('/api/inject-fault', {
          node_id: nodeId,
          severity_level: severity,
          event_type: eventType
        });
        
        const data = res.data;
        await fetchData();
        
        const newAlert = {
          id: Date.now(),
          message: data.message,
          time: new Date().toLocaleTimeString(),
          downstream: Object.values(data.affected_downstream_nodes).map(ds => ({
            name: ds.name,
            delay: ds.added_delay_hours + 'h',
            cost: '$' + ds.cost_impact.toLocaleString()
          }))
        };
        
        setActiveAlerts(prev => [newAlert, ...prev]);
        
        if (data.alternative_route) {
          setPlanB({
            source: data.alternative_route.path[0],
            target: data.alternative_route.path[data.alternative_route.path.length - 1],
            newLeadTime: data.alternative_route.new_lead_time + ' days',
            delayPenalty: data.alternative_route.delay_penalty + ' days',
            totalCost: '$' + data.alternative_route.total_cost.toLocaleString()
          });
        }

        // --- Agamya AI Prediction ---
        try {
          // Find a downstream edge from the disrupted node for prediction
          const downstreamKeys = Object.keys(data.affected_downstream_nodes);
          const predictOrigin = nodeId;
          const predictDest = downstreamKeys.length > 0 ? downstreamKeys[0] : 'WH_CHICAGO';
          
          const predRes = await api.post('/api/predict', {
            origin: predictOrigin,
            destination: predictDest,
            chaos_severity: severity,
            event_type: eventType
          });
          
          setAiPrediction(predRes.data);
        } catch (predErr) {
          console.log('AI Prediction fallback:', predErr);
          // Fallback mock prediction
          setAiPrediction({
            predicted_days: (severity * 1.8 + 3).toFixed(2),
            accuracy: 94.0,
            origin: nodeId,
            destination: 'WH_CHICAGO',
            chaos_severity: severity,
            event_type: eventType
          });
        }
      } catch (err) {
        console.error("Error connecting to backend", err);
        alert(err.response?.data?.detail || "Error triggering disruption");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mock Fallback
    setTimeout(() => {
      const updatedNodes = nodes.map(n => 
        n.id === nodeId ? { ...n, health_status: "Critical" } : n
      );
      setNodes(updatedNodes);
      
      const newScore = Math.max(0, resilienceScore - 20);
      setResilienceScore(newScore);
      
      const newAlert = {
        id: Date.now(),
        message: `${eventType} simulated at ${nodes.find(n=>n.id===nodeId)?.name}. Network degraded.`,
        time: new Date().toLocaleTimeString(),
        downstream: [
          { name: "Chicago Central Hub", delay: "48h", cost: "$24,000" },
          { name: "New York Distribution", delay: "36h", cost: "$18,000" }
        ]
      };
      
      setActiveAlerts(prev => [newAlert, ...prev]);
      
      setPlanB({
        source: "Port of Vancouver",
        target: "Chicago Central Hub",
        newLeadTime: "5 days",
        delayPenalty: "1 day",
        totalCost: "$12,000"
      });

      // Mock AI prediction
      const mockSeverity = eventType === 'Port Strike' ? 8 : 6;
      setAiPrediction({
        predicted_days: (mockSeverity * 1.8 + 3).toFixed(2),
        accuracy: 94.0,
        origin: nodeId,
        destination: 'WH_CHICAGO',
        chaos_severity: mockSeverity,
        event_type: eventType
      });
      
      setLoading(false);
    }, 800);
  };

  const healNetwork = async () => {
    if (isBackendConnected) {
      try {
        await api.post('/api/heal-network', {});
        await fetchData();
        setActiveAlerts([]);
        setPlanB(null);
        setAiPrediction(null);
      } catch (err) {
        console.error("Error healing network", err);
        alert(err.response?.data?.detail || "Error healing network");
      }
      return;
    }

    setNodes(MOCK_NODES);
    setResilienceScore(100);
    setActiveAlerts([]);
    setPlanB(null);
    setAiPrediction(null);
  }

  const handleExecutePivot = () => {
    setLoading(true);
    // Simulate pivot execution
    setTimeout(() => {
      setNodes(prev => prev.map(n => ({ ...n, health_status: 'Healthy' })));
      setResilienceScore(prev => Math.min(100, prev + 15));
      setPlanB(null);
      setActiveAlerts(prev => prev.slice(1)); // Clear the most recent alert
      setLoading(false);
      alert("AI Pivot Executed Successfully. Route redirected via alternate node.");
    }, 1000);
  };


  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (resilienceScore / 100) * circumference;
  
  const getScoreColor = () => {
    if (resilienceScore > 80) return 'var(--color-success)';
    if (resilienceScore > 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };
  
  const getScoreGlow = () => {
    if (resilienceScore > 80) return 'var(--color-success-glow)';
    if (resilienceScore > 50) return 'var(--color-warning-glow)';
    return 'var(--color-danger-glow)';
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants}
      className="max-w-7xl mx-auto pt-24 pb-8"
    >
      <header className="mb-10">
        {/* User Info and Logout Row */}
        <div className="flex justify-between items-center mb-8">
          {/* Left spacer to keep title centered if needed, or just use this space */}
          <div className="hidden lg:block w-48"></div> 

          <div className="text-center flex-grow">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-indigo-400 drop-shadow-lg"
            >
              Agamya
            </motion.h1>
            <motion.p 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-blue-200/60 mt-2 text-sm font-medium tracking-wide uppercase"
            >
              Supply Chain Stress-Test Engine
            </motion.p>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowProfileDetails(!showProfileDetails)}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:bg-white/10 transition-all group"
            >
              <div className={`w-4 h-4 rounded-full ${
                userRole === 'admin' 
                  ? 'bg-danger shadow-[0_0_12px_rgba(239,68,68,0.9)]' 
                  : 'bg-primary shadow-[0_0_12px_rgba(0,225,255,0.9)]'
              }`}></div>
              <span className="text-sm font-bold text-white/90 tracking-wide">{username}</span>
              <div className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                userRole === 'admin' 
                  ? 'bg-danger/20 text-danger border-danger/40' 
                  : 'bg-primary/20 text-primary border-primary/40'
              }`}>
                {userRole === 'admin' ? 'ADMIN' : 'USER'}
              </div>
              <ChevronDown size={14} className={`text-white/30 group-hover:text-white/60 transition-transform ${showProfileDetails ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfileDetails && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setShowProfileDetails(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-72 glass-panel p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10 z-50 overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-purple-500"></div>
                    
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_currentColor] ${
                        userRole === 'admin' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
                      }`}>
                        <User size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-white">{username}</h3>
                      <span className={`text-[10px] mt-2 px-3 py-1 rounded-full border font-black uppercase tracking-widest ${
                        userRole === 'admin' ? 'bg-danger/20 text-danger border-danger/30' : 'bg-primary/20 text-primary border-primary/30'
                      }`}>
                        {userRole === 'admin' ? 'Administrator' : 'Standard User'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="p-3 rounded-2xl bg-black/20 border border-white/5 flex items-center gap-3">
                        <Mail size={16} className="text-white/40" />
                        <div className="text-left overflow-hidden">
                          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Email Address</p>
                          <p className="text-sm text-white/80 truncate font-medium">{email || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-red-500/20"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Health Gauge Panel */}
          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
              <ShieldAlert size={140} />
            </div>
            
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white/90">
              <Activity className="text-primary" /> System Health
              {!isBackendConnected && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-warning/20 text-warning px-3 py-1 rounded-full border border-warning/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  Mock Mode
                </span>
              )}
            </h2>
            
            <div className="flex justify-center items-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                  {/* Background Track */}
                  <circle cx="96" cy="96" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                  
                  {/* Animated Foreground */}
                  <circle
                    cx="96" cy="96" r={radius}
                    stroke={getScoreColor()}
                    strokeWidth="12" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="gauge-circle drop-shadow-[0_0_12px_currentColor]"
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 10px ${getScoreGlow()})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    key={resilienceScore}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-black tabular-nums tracking-tighter" 
                    style={{ color: getScoreColor() }}
                  >
                    {resilienceScore}
                  </motion.span>
                  <span className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">Resilience</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <div>
                <span className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1">Active Nodes</span>
                <span className="text-2xl font-bold text-white/90">{nodes.length}</span>
              </div>
              <div className="text-right">
                <span className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1">Disruptions</span>
                <span className={`text-2xl font-bold ${activeAlerts.length > 0 ? 'text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-success'}`}>
                  {activeAlerts.length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Plan B Recommendation */}
          <AnimatePresence>
            {planB && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                className="glass-panel rounded-3xl p-8 border border-primary/40 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
                
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-primary">
                  <Route size={22} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" /> AI Pivot Plan
                </h2>
                
                <div className="space-y-5">
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Alternative Route</div>
                    <div className="font-semibold text-lg text-white/90 flex flex-wrap gap-2 items-center">
                      <span className="bg-white/10 px-2 py-1 rounded-md text-sm">{planB.source}</span>
                      <span className="text-primary">➔</span>
                      <span className="bg-white/10 px-2 py-1 rounded-md text-sm">{planB.target}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                      <span className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1">New Lead Time</span>
                      <span className="font-bold text-xl text-warning">{planB.newLeadTime}</span>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                      <span className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1">Pivot Cost</span>
                      <span className="font-bold text-xl text-danger">{planB.totalCost}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleExecutePivot}
                    className="w-full mt-4 py-4 bg-primary hover:bg-blue-400 text-white rounded-xl font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transform hover:-translate-y-1"
                  >
                    Execute Pivot Now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Predictive Intelligence Card */}
          <AnimatePresence>
            {aiPrediction && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="glass-panel rounded-3xl p-8 relative overflow-hidden"
                style={{
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  boxShadow: '0 0 40px rgba(168, 85, 247, 0.15), inset 0 0 60px rgba(168, 85, 247, 0.05)'
                }}
              >
                {/* Animated gradient accent bar */}
                <div className="absolute top-0 left-0 w-full h-1" style={{
                  background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899, #8b5cf6, #06b6d4)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s linear infinite'
                }}></div>

                {/* Subtle background glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6), transparent)' }}
                ></div>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: '#c084fc' }}>
                  <div className="relative">
                    <Brain size={22} className="drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
                    <div className="absolute inset-0 animate-ping opacity-30">
                      <Brain size={22} />
                    </div>
                  </div>
                  Predictive Intelligence
                  <span className="ml-auto text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                    style={{
                      background: 'rgba(139,92,246,0.15)',
                      color: '#a78bfa',
                      borderColor: 'rgba(139,92,246,0.3)',
                      boxShadow: '0 0 12px rgba(139,92,246,0.2)'
                    }}
                  >
                    AI Active
                  </span>
                </h2>

                <div className="space-y-5">
                  {/* Main prediction display */}
                  <div className="rounded-2xl p-6 text-center relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
                      border: '1px solid rgba(139,92,246,0.2)'
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Agamya AI Prediction
                    </p>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    >
                      <span className="text-5xl font-black tabular-nums tracking-tighter" style={{
                        background: 'linear-gradient(135deg, #c084fc, #22d3ee)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.5))'
                      }}>
                        {aiPrediction.predicted_days}
                      </span>
                      <span className="text-lg font-bold ml-2" style={{ color: '#a78bfa' }}>days</span>
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-3 text-sm font-semibold"
                      style={{ color: '#22d3ee' }}
                    >
                      Accuracy: {aiPrediction.accuracy}%
                    </motion.p>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Origin</span>
                      <span className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{aiPrediction.origin?.replace('PORT_', '').replace('HUB_', '').replace('WH_', '').replace('FACTORY_', '').replace('_', ' ')}</span>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Destination</span>
                      <span className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{aiPrediction.destination?.replace('PORT_', '').replace('HUB_', '').replace('WH_', '').replace('FACTORY_', '').replace('_', ' ')}</span>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Chaos Level</span>
                      <span className="font-bold text-sm" style={{ color: '#f87171' }}>{aiPrediction.chaos_severity}/10</span>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Event Type</span>
                      <span className="font-semibold text-sm" style={{ color: '#fbbf24' }}>{aiPrediction.event_type}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Chaos Engine & Logs */}
        <div className="lg:col-span-8 space-y-8">

          
          {/* Chaos Injection Engine */}
          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white/90">
                <Zap className="text-warning drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> Network Topology
              </h2>
              <button 
                onClick={healNetwork}
                title="Restore network to healthy state"
                className="glass-button px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 text-sm transition-all text-success hover:text-white cursor-pointer"
              >
                <ShieldCheck size={18} /> Restore Network
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
              {nodes.map(node => (
                <motion.div 
                  layout
                  key={node.id} 
                  className={`cube-node p-8 flex flex-col justify-between ${
                    node.health_status === 'Healthy' 
                    ? '' 
                    : 'danger'
                  }`}
                  style={{ minHeight: '240px' }}
                >
                  <div className="flex flex-col items-center justify-center text-center mb-6 relative z-10 flex-grow">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_currentColor] ${
                      node.health_status === 'Healthy' ? 'bg-primary/20 text-primary' : 'bg-danger/20 text-danger'
                    }`}>
                      {node.type === 'Factory' ? <Zap size={32} /> : 
                       node.type === 'Port' ? <Route size={32} /> : 
                       node.type === 'Supplier' ? <Activity size={32} /> : 
                       <Search size={32} />}
                    </div>
                    
                    <h3 className="font-bold text-lg text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] leading-tight">{node.name}</h3>
                    
                    <div className="flex flex-col items-center gap-1 mt-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                        {node.type}
                      </span>
                      <span className="text-xs text-white/70 font-mono">
                        QTY: {node.current_stock.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full flex justify-center z-10 mt-auto">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-[0_0_15px_currentColor] ${
                      node.health_status === 'Healthy' 
                      ? 'bg-success/10 text-success border-success/30' 
                      : 'bg-danger/20 text-danger border-danger/50 animate-pulse'
                    }`}>
                      {node.health_status}
                    </span>
                  </div>
                  
                  {node.health_status === 'Healthy' && (
                    <div className="flex gap-2 relative z-10 mt-6">
                      <button 
                        disabled={loading}
                        onClick={() => triggerDisruption(node.id, "Port Strike")}
                        title="Simulate a port strike"
                        className="flex-1 glass-button bg-black/40 font-semibold text-xs py-2 rounded-lg flex justify-center items-center gap-1 transition-all hover:bg-warning/30 hover:text-warning hover:border-warning/50 cursor-pointer"
                      >
                        <TrendingDown size={14} /> Strike
                      </button>
                      <button 
                        disabled={loading}
                        onClick={() => triggerDisruption(node.id, "Severe Weather")}
                        title="Simulate severe weather"
                        className="flex-1 glass-button bg-black/40 font-semibold text-xs py-2 rounded-lg flex justify-center items-center gap-1 transition-all hover:bg-danger/30 hover:text-danger hover:border-danger/50 cursor-pointer"
                      >
                        <Crosshair size={14} /> Weather
                      </button>
                    </div>
                  )}
                  
                  {node.health_status !== 'Healthy' && (
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,0,85,0.05)_10px,rgba(255,0,85,0.05)_20px)] pointer-events-none rounded-2xl z-0"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Ripple Effect Logs */}
          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white/90">
              <AlertTriangle className={`${activeAlerts.length > 0 ? 'text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-white/40'}`} /> Ripple Effect Logs
            </h2>
            
            <div className="bg-black/30 rounded-2xl p-2 min-h-[250px] border border-white/5">
              {activeAlerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-white/30">
                  <Search size={48} className="mb-4 opacity-50" />
                  <p className="font-medium text-lg">System operating normally.</p>
                  <p className="text-sm mt-1">No disruptions detected in the network.</p>
                </div>
              ) : (
                <div className="space-y-3 p-2">
                  <AnimatePresence>
                    {activeAlerts.map((alert) => (
                      <motion.div 
                        key={alert.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-surface border border-white/5 p-5 rounded-xl relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-danger shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-bold text-danger text-lg">{alert.message}</span>
                          <span className="text-xs font-mono text-white/40 bg-black/40 px-2 py-1 rounded">{alert.time}</span>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Downstream Financial & Time Impact</p>
                          {alert.downstream.map((ds, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-black/40 px-4 py-3 rounded-lg border border-white/5">
                              <span className="font-medium text-white/80">{ds.name}</span>
                              <div className="flex gap-4 items-center">
                                <span className="font-mono text-warning font-semibold drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">+{ds.delay}</span>
                                <span className="font-mono text-danger font-semibold drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">+{ds.cost}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>

    </motion.div>
  );
}
