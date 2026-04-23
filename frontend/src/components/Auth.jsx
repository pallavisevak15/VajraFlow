import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, UserPlus, LogIn, AlertCircle, Lock } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    const payload = {
      username,
      password,
      ...(isLogin ? {} : { role, email }) // Include role and email for signup
    };

    try {
      const response = await axios.post(url, payload);

      // Save token and user info
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', response.data.role);
      if (response.data.email) {
        localStorage.setItem('email', response.data.email);
      }

      // Redirect to home using React Router
      navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-10 rounded-3xl w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] mx-auto mb-4"
          >
            <Shield className="text-white" size={32} />
          </motion.div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-white/50 mt-2">
            {isLogin ? 'Enter your credentials to access the supply chain engine' : 'Register to simulate and analyze supply chain disruptions'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
            {error === 'Network Error' && (
              <div className="pt-2 border-t border-red-500/20">
                <p className="text-xs text-white/50 mb-3">Ensure your FastAPI backend is running on <code className="bg-black/40 px-1 rounded">127.0.0.1:8000</code>.</p>
                <button 
                  type="button"
                  onClick={() => {
                    localStorage.setItem('token', 'mock_token');
                    localStorage.setItem('username', 'Demo Admin');
                    localStorage.setItem('role', 'admin');
                    navigate('/');
                  }}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/10 text-white/70"
                >
                  Skip to Dashboard (Mock Mode)
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-1">Username</label>
            <input 
              id="username"
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-white/30"
              placeholder="john_doe"
              minLength="3"
            />
            <p className="text-xs text-white/40 mt-1">Minimum 3 characters</p>
          </div>

          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">Email Address</label>
              <input 
                id="email"
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-white/30"
                placeholder="john@example.com"
              />
            </motion.div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1 flex items-center gap-2">
              <Lock size={14} />
              Password
            </label>
            <input 
              id="password"
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-white/30"
              placeholder="••••••••"
              minLength={isLogin ? "1" : "6"}
            />
            <p className="text-xs text-white/40 mt-1">
              {isLogin ? 'Enter your password' : 'Minimum 6 characters'}
            </p>
          </div>

          {!isLogin && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="role" className="block text-sm font-medium text-white/70">Role</label>
                <button
                  type="button"
                  onClick={() => setShowRoleInfo(!showRoleInfo)}
                  className="text-xs text-primary hover:text-blue-400 transition-colors"
                >
                  What's the difference?
                </button>
              </div>
              
              {showRoleInfo && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2 text-xs text-blue-100/70">
                  <p><strong className="text-blue-300">Standard User:</strong> View network and historical data</p>
                  <p><strong className="text-blue-300">Administrator:</strong> Full control + can trigger disruptions</p>
                </div>
              )}

              <select 
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
              >
                <option value="user">📊 Standard User</option>
                <option value="admin">🔐 Administrator</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                {isLogin ? (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Account
                  </>
                )}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-white/50 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setShowRoleInfo(false);
              }}
              className="text-primary hover:text-blue-400 font-semibold transition-colors"
            >
              {isLogin ? 'Sign Up Here' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
