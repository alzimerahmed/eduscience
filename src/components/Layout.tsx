// src/components/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Notebook, Home, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './Auth/AuthModal';
import LoadingSpinner from './LoadingSpinner';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [searchQuery, setSearchQuery] = useState('');

  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { label: 'Study Resources', path: '/resources', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'AI Hub', path: '/ai-hub', icon: <Brain className="h-5 w-5" /> },
    { label: 'Workspace', path: '/workspace', icon: <Notebook className="h-5 w-5" /> },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleProfileClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-[#0A0C22] text-[#F2F2FF]' : 'bg-[#F5F7FD] text-[#121638]'}`}>
      <header className={`fixed top-0 w-full z-50 backdrop-blur-md shadow ${isDarkMode ? 'bg-[#121638]/90' : 'bg-white/90'}`}>
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-[#8494FF] to-[#E68A49] p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:inline">EduScience</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block max-w-md flex-1 mx-4 relative">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode ? 'bg-[#2A2F5E] border-[#3D4380] text-white' : 'bg-gray-100 border-gray-200 text-black'
              } focus:outline-none focus:ring-2 focus:ring-[#8494FF]`}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-3">
            {navItems.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1 ${
                  location.pathname === path
                    ? isDarkMode
                      ? 'bg-[#2A2F5E] text-[#8494FF]'
                      : 'bg-gray-100 text-[#121638]'
                    : isDarkMode
                      ? 'text-[#F2F2FF]/80 hover:text-white hover:bg-[#2A2F5E]'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#2A2F5E] text-white' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Auth Avatar / Login */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleProfileClick}
                  className="w-8 h-8 bg-[#8494FF] text-white font-semibold rounded-full hover:bg-[#96A4FF]"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </button>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-red-500 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAuthClick('login')}
                className="px-4 py-2 bg-[#8494FF] text-white rounded-lg hover:bg-[#96A4FF]"
              >
                Login
              </button>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg">
              {isDarkMode ? <Sun className="text-white h-5 w-5" /> : <Moon className="text-gray-700 h-5 w-5" />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-16">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" className="text-[#8494FF]" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-6">
            <Outlet />
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className={`py-8 text-center text-sm ${isDarkMode ? 'bg-[#121638] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
        <p>© 2025 EduScience. All rights reserved.</p>
        <p className="mt-2">An AI-powered educational platform for science students</p>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authModalMode} />
    </div>
  );
};

export default Layout;
