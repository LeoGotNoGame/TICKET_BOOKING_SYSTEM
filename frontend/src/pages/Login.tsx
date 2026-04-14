import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data.user;
      login(userData);
      
      // Role-based redirection
      if (userData.role === 'organizer') {
        navigate('/organizer');
      } else {
        navigate('/student');
      }
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#0f172a] p-6">
      <form onSubmit={handleLogin} className="glass w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center font-bold text-white shadow-lg text-2xl">
            T
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Welcome Back</h2>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 mt-8 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30">
          Sign In
        </button>
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">Create one</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
