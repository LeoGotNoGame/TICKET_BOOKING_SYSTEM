import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentFeed from './pages/StudentFeed';
import OrganizerDashboard from './pages/OrganizerDashboard';
import { LogOut, LayoutDashboard, Ticket } from 'lucide-react';
import api from './services/api';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      navigate('/login');
    } catch (e) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center font-bold text-white shadow-lg">
              T
            </div>
            <span className="font-bold text-xl tracking-tight">TicketFlow</span>
          </div>
          <div className="flex items-center gap-6">
            {user?.role === 'student' && (
              <Link to="/student" className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                <Ticket size={16} /> Feed
              </Link>
            )}
            {user?.role === 'organizer' && (
              <Link to="/organizer" className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}
            <div className="h-6 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">{user?.name}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; role: 'student' | 'organizer' }> = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== role) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/student" element={<ProtectedRoute role="student"><StudentFeed /></ProtectedRoute>} />
            <Route path="/organizer" element={<ProtectedRoute role="organizer"><OrganizerDashboard /></ProtectedRoute>} />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
