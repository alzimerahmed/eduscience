import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon, BookOpen, Brain, Notebook, Home, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from './LoadingSpinner';
import AuthModal from './Auth/AuthModal';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Close menu when location changes
    setIsMenuOpen(false);
    
    // Simulate content loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location]);

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/resources", label: "Study Resources", icon: <BookOpen className="h-5 w-5" /> },
    { path: "/ai-hub", label: "AI Hub", icon: <Brain className="h-5 w-5" /> },
    { path: "/workspace", label: "Workspace", icon: <Notebook className="h-5 w-5" /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      handleAuthClick('login');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0A0C22] text-[#F2F2FF]' : 'bg-[#F5F7FD] text-[#121638]'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 ${isDarkMode ? 'bg-[#121638]/80' : 'bg-white/80'} backdrop-blur-lg shadow-sm transition-colors duration-300`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-[#8494FF] to-[#E68A49] p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:inline">EduScience</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-[#2A2F5E] text-[#F2F2FF] border-[#3D4380]' : 'bg-gray-100 text-gray-900 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-[#8494FF] transition-colors`}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1 transition-colors ${
                    location.pathname === item.path
                      ? isDarkMode 
                        ? 'bg-[#2A2F5E] text-[#8494FF]' 
                        : 'bg-gray-100 text-[#121638]'
                      : isDarkMode
                        ? 'text-[#F2F2FF]/80 hover:text-[#F2F2FF] hover:bg-[#2A2F5E]/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-[#2A2F5E] text-[#F2F2FF]' 
                    : 'bg-gray-100 text-gray-600'
                } hover:bg-opacity-80 transition-colors`}
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg mr-2 ${
                  isDarkMode 
                    ? 'bg-[#2A2F5E] text-[#F2F2FF]' 
                    : 'bg-gray-100 text-gray-600'
                } hover:bg-opacity-80 transition-colors`}
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-[#2A2F5E] text-[#F2F2FF]' 
                    : 'bg-gray-100 text-gray-600'
                } hover:bg-opacity-80 transition-colors`}
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transform transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      <div
        className={`fixed top-16 right-0 bottom-0 w-64 z-40 ${
          isDarkMode ? 'bg-[#121638] text-[#F2F2FF]' : 'bg-white text-[#121638]'
        } transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-[#2A2F5E] text-[#F2F2FF] border-[#3D4380]' : 'bg-gray-100 text-gray-900 border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-[#8494FF] transition-colors`}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </form>
          
          {/* Mobile Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-3 rounded-lg font-medium flex items-center space-x-3 transition-colors ${
                  location.pathname === item.path
                    ? isDarkMode 
                      ? 'bg-[#2A2F5E] text-[#8494FF]' 
                      : 'bg-gray-100 text-[#121638]'
                    : isDarkMode
                      ? 'text-[#F2F2FF]/80 hover:text-[#F2F2FF] hover:bg-[#2A2F5E]/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Auth Button */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              {user ? (
                <button 
                  onClick={handleProfileClick}
                  className="p-2 bg-[#8494FF] rounded-full text-[#121638] hover:bg-[#96A4FF] transition-all"
                >
                  <span className="font-semibold text-sm">{user.email?.charAt(0).toUpperCase()}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleAuthClick('login')}
                  className="px-3 py-1 bg-[#8494FF] rounded-lg text-[#121638] hover:bg-[#96A4FF] transition-all text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 min-h-screen">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <LoadingSpinner size="lg" className="text-[#8494FF]" />
          </div>
        ) : (
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="container mx-auto px-4 py-6 sm:px-6 lg:px-8"
          >
            <Outlet />
          </motion.main>
        )}
      </div>

      {/* Footer */}
      <footer className={`py-8 ${isDarkMode ? 'bg-[#121638] text-[#F2F2FF]/70' : 'bg-gray-100 text-gray-600'} transition-colors`}>
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2025 EduScience. All rights reserved.</p>
          <p className="mt-2">An AI-powered educational platform for science students</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
    </div>
  );
};

export default Layout;