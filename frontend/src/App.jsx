import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import Auth from './components/Auth'
import Agent from './components/Agent'
import Sustainability from './components/Sustainability'
import ClickSpark from './components/ClickSpark'
import AgamyaAgentNav from './components/AgamyaAgentNav'

// ── Global Logistics Orbital Background with Falling Sparkles ──────────────────
function OrbitalEarthBackground() {
  const canvasRef = useRef(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let t = 0;

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const SPARKLES = Array.from({ length: 45 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.15 + Math.random() * 0.35,
      size: 1 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.4
    }));

    const TRAFFIC = Array.from({ length: 15 }, (_, i) => ({
      type: i % 2 === 0 ? 'SHIP' : 'PLANE',
      radius: 1.4 + Math.random() * 0.8,
      angle: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      tilt: (Math.random() - 0.5) * 0.4
    }));

    const EARTH_POINTS = Array.from({ length: 450 }, () => {
      const isContinent = Math.random() > 0.35;
      return {
        theta: isContinent ? (Math.random() * 1.8 + (Math.random() > 0.5 ? 0 : 3.2)) : Math.random() * Math.PI * 2,
        phi: (Math.random() * 0.7 + 0.15) * Math.PI,
        size: isContinent ? 1.4 : 0.6,
        alpha: isContinent ? 0.9 : 0.15
      };
    });

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t += 0.006;

      const scrollOffset = scrollYRef.current * 0.25;
      const cx = W / 2;
      const baseCy = (H / 2) - (scrollOffset % H); 
      const R = Math.min(W, H) * 0.26;

      const bgGrad = ctx.createRadialGradient(cx, baseCy, 0, cx, baseCy, W);
      bgGrad.addColorStop(0, '#000d26');
      bgGrad.addColorStop(0.5, '#00050d');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      SPARKLES.forEach(s => {
        const currentSpeed = s.speed + (scrollYRef.current * 0.001);
        s.y += currentSpeed;
        if (s.y > 110) s.y = -10;
        const sx = (s.x / 100) * W;
        const sy = (s.y / 100) * H;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 207, 255, ${s.opacity})`;
        ctx.fill();
      });

      TRAFFIC.forEach(item => {
        const currentAngle = item.angle + t * item.speed;
        ctx.save();
        ctx.translate(cx, baseCy);
        ctx.rotate(item.tilt);
        ctx.scale(1, 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, R * item.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 207, 255, 0.04)';
        ctx.stroke();
        ctx.restore();
        const projX = cx + (R * item.radius) * Math.cos(currentAngle) * Math.cos(item.tilt);
        const projY = baseCy + (R * item.radius) * Math.sin(currentAngle) * 0.3 + (R * item.radius) * Math.cos(currentAngle) * Math.sin(item.tilt);
        ctx.fillStyle = '#fff';
        if (item.type === 'PLANE') {
          ctx.beginPath(); ctx.moveTo(projX, projY - 4); ctx.lineTo(projX + 4, projY + 4); ctx.lineTo(projX - 4, projY + 4); ctx.fill();
        } else {
          ctx.fillRect(projX - 3, projY - 2, 6, 4);
        }
      });

      const bodyGrad = ctx.createRadialGradient(cx - R*0.3, baseCy - R*0.3, R*0.1, cx, baseCy, R);
      bodyGrad.addColorStop(0, '#00cfff');
      bodyGrad.addColorStop(1, '#000a1f');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.arc(cx, baseCy, R, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, baseCy, R, 0, Math.PI * 2); ctx.clip();
      EARTH_POINTS.forEach((p, i) => {
        const rotTheta = p.theta + t * 0.4;
        const x = cx + R * Math.sin(p.phi) * Math.cos(rotTheta);
        const y = baseCy + R * Math.cos(p.phi);
        const z = Math.sin(p.phi) * Math.sin(rotTheta);
        if (z > 0) {
          ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 207, 255, ${p.alpha * z})`;
          ctx.fill();
        }
      });
      ctx.restore();
      animFrame = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }} />;
}

// ── Main App ────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <ClickSpark />
      <AgamyaAgentNav />
      <OrbitalEarthBackground />

      <div className="relative z-10 min-h-screen text-white">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={
            <>
              <Navbar />
              <main className="relative z-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/agent" element={<Agent />} />
                  <Route path="/sustainability" element={<Sustainability />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
