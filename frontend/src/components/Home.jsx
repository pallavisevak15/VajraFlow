import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Activity, Network, Globe, Satellite } from 'lucide-react';

export default function Home() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center">

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="text-center max-w-4xl mx-auto mb-24"
      >
        {/* Badge */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 10px rgba(0,207,255,0.3)',
              '0 0 25px rgba(0,207,255,0.6)',
              '0 0 10px rgba(0,207,255,0.3)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00cfff]/10 border border-[#00cfff]/30 text-[#00cfff] text-xs font-bold uppercase tracking-widest mb-8"
        >
          <Activity size={13} className="animate-pulse" />
          Chaos Engineering Platform · Global Network Intelligence
        </motion.div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00cfff] via-[#60b8ff] to-[#0066ff] glow-text-blue">
            Uncover the Hidden
          </span>
          <br />
          <span className="text-white glow-text-white">
            Fragility of Global Trade.
          </span>
        </h1>

        <p className="text-xl text-white/55 leading-relaxed mb-12 max-w-3xl mx-auto">
          Welcome to{' '}
          <span className="text-[#00cfff] font-bold">Agamya</span>. We simulate devastating supply chain
          disruptions—from port strikes to geopolitical conflicts—so you can build resilience before disaster strikes.
        </p>

        {/* CTA Button */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold tracking-wide text-lg text-[#000814] transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #00cfff 0%, #0077ff 100%)',
              boxShadow: '0 0 40px rgba(0,180,255,0.45), 0 0 80px rgba(0,100,255,0.2)',
            }}
          >
            <Globe size={22} />
            Enter War Room
            <ArrowRight size={22} />
          </Link>
        </motion.div>

        {/* Stat pills */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {[
            { label: 'Global Nodes', value: '12+' },
            { label: 'Routes Analyzed', value: '10K+' },
            { label: 'Disruptions Simulated', value: '∞' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-panel px-5 py-2 rounded-full flex items-center gap-3"
            >
              <span className="text-[#00cfff] font-black text-lg">{stat.value}</span>
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl"
      >
        {/* Card 1 */}
        <div className="cube-node scan-panel p-10 rounded-3xl relative group overflow-hidden">
          <div className="absolute -top-12 -right-12 opacity-5 group-hover:opacity-10 transition-opacity duration-700 text-[#00cfff]">
            <Network size={220} />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#00cfff]/15 border border-[#00cfff]/30 flex items-center justify-center">
              <Network size={20} className="text-[#00cfff]" />
            </div>
            <h3 className="text-2xl font-bold text-white glow-text-white">The Vulnerability</h3>
          </div>
          <p className="text-white/70 leading-relaxed font-medium">
            Modern global supply chains are heavily optimized for efficiency, but deeply fragile to unexpected shocks.
            A single disruption at a key node can trigger catastrophic{' '}
            <strong className="text-[#00cfff]">ripple effects</strong>,
            propagating delays and skyrocketing costs across downstream networks like dominoes.
          </p>
        </div>

        {/* Card 2 */}
        <div
          className="cube-node scan-panel p-10 rounded-3xl relative group overflow-hidden"
          style={{ borderColor: 'rgba(250,204,21,0.3)' }}
        >
          <div className="absolute -bottom-12 -right-12 opacity-5 group-hover:opacity-10 transition-opacity duration-700 text-yellow-400">
            <ShieldAlert size={220} />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center">
              <Satellite size={20} className="text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-yellow-300" style={{ textShadow: '0 0 20px rgba(250,204,21,0.5)' }}>
              The Solution
            </h3>
          </div>
          <p className="text-white/70 leading-relaxed font-medium">
            <strong className="text-white">Agamya</strong> utilizes <em>Chaos Engineering</em> principles (Fault Injection) to
            actively stress-test network topology. By purposefully breaking routes, we expose hidden fragilities and calculate
            AI-driven "Plan B" pivot routes in real-time, quantifying the exact cost of disruption.
          </p>
        </div>
      </motion.div>

    </div>
  );
}
