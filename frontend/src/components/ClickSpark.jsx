import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClickSpark() {
  const [clicks, setClicks] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const newClick = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      setClicks((prev) => [...prev.slice(-5), newClick]); // Keep last 5 for performance
      
      setTimeout(() => {
        setClicks((prev) => prev.filter(c => c.id !== newClick.id));
      }, 1000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {clicks.map((click) => (
          <React.Fragment key={click.id}>
            {/* Main Pulse Ring */}
            <motion.div
              initial={{ opacity: 1, scale: 0, border: '2px solid #00cfff' }}
              animate={{ opacity: 0, scale: 4, border: '0px solid #00cfff' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                position: 'absolute',
                left: click.x - 20,
                top: click.y - 20,
                width: 40,
                height: 40,
                borderRadius: '50%',
                boxShadow: '0 0 20px rgba(0, 207, 255, 0.5)',
              }}
            />
            {/* Particle Burst */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{ 
                  opacity: 0, 
                  x: Math.cos(i * 60 * (Math.PI / 180)) * 60, 
                  y: Math.sin(i * 60 * (Math.PI / 180)) * 60,
                  scale: 0 
                }}
                transition={{ duration: 0.6, ease: "backOut" }}
                style={{
                  position: 'absolute',
                  left: click.x - 3,
                  top: click.y - 3,
                  width: 6,
                  height: 6,
                  background: '#00cfff',
                  borderRadius: '2px',
                  boxShadow: '0 0 10px #00cfff',
                  rotate: i * 45
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
}
