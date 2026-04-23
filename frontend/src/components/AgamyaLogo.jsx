import React from 'react';
import { motion } from 'framer-motion';

export default function AgamyaLogo({ size = 44, detailed = true }) {
  return (
    <motion.div 
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
    >
      {/* Outer Glow Ring */}
      <motion.div 
        className="absolute inset-0 rounded-full border border-cyan-400/20 shadow-[0_0_15px_rgba(0,207,255,0.3)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Hexagonal Nodes (Visualized on left) */}
      {detailed && (
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 border border-cyan-400 rounded-sm"
              style={{ 
                left: '15%', 
                top: `${30 + i * 20}%`,
                transform: 'rotate(45deg)',
                boxShadow: '0 0 5px #00cfff'
              }}
            />
          ))}
        </div>
      )}

      {/* High-Fidelity SVG Logo */}
      <svg viewBox="0 0 100 100" className="w-full h-full p-1 relative z-10 drop-shadow-[0_0_12px_rgba(0,207,255,0.6)]">
        <defs>
          <linearGradient id="logo-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2ff" />
            <stop offset="100%" stopColor="#0077ff" />
          </linearGradient>
          <linearGradient id="logo-grad-gold" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffcc00" />
            <stop offset="100%" stopColor="#ff8800" />
          </linearGradient>
        </defs>

        {/* The "A" and Arrow Path */}
        <motion.path
          d="M50 10 L85 85 L65 85 L50 50 L35 85 L15 85 Z"
          fill="url(#logo-grad-cyan)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Integrated Upward Arrow */}
        <motion.path
          d="M50 45 L90 20 L75 15 M90 20 L85 35"
          stroke="url(#logo-grad-gold)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ 
            opacity: [0.7, 1, 0.7],
            pathOffset: [0, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Connection Wave Bar */}
        <motion.path
          d="M25 70 Q50 45 75 70"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Floating Data Node Sparkle */}
        <motion.circle
          cx="80" cy="30" r="3"
          fill="#fff"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>

      {/* Orbital Path Line */}
      <motion.div 
        className="absolute inset-[-4px] border-t-2 border-cyan-400/40 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}
