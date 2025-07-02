import React, { useState } from 'react';
import { Search, BookOpen, Star, Download, FlaskConical, Brain, BarChart3, User, Zap, Moon, Sun, Globe, Upload, Settings, CreditCard, HelpCircle, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './Auth/AuthModal';

interface EnhancedHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAuthClick?: (mode: 'login' | 'register') => void;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ searchTerm, onSearchChange, onAuthClick }) => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    if (onAuthClick) {
      onAuthClick(mode);
    }
  };
  
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' }
  ];

  const userMenuItems = [
    { icon: BarChart3, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: Upload, label: t('nav.upload'), path: '/upload' },
    { icon: Settings, label: t('nav.settings'), path: '/settings' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: CreditCard, label: t('nav.pricing'), path: '/pricing' },
    { icon: HelpCircle, label: t('nav.guide'), path: '/guide' },
  ];

  if (profile?.role === 'admin') {
    userMenuItems.splice(2, 0, { icon: Settings, label: t('nav.admin'), path: '/admin/exam-settings' });
  }

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <FlaskConical className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t('header.title')}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('header.subtitle')}</p>
              </div>
            </Link>
          </motion.div>
          
          {/* Search Bar */}
          {location.pathname === '/' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:block relative max-w-md flex-1 mx-8"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder={t('header.search')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </motion.div>
          )}
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* XP Display - Only for logged in users */}
            {profile && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl px-3 py-2 border border-yellow-200/50 dark:border-yellow-700/50"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('header.level')} {profile.level}
                  </span>
                </div>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((profile.total_xp % 250) / 250) * 100}%` }}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{profile.total_xp} XP</span>
              </motion.div>
            )}
            
            {/* Language Selector */}
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  {languages.find(l => l.code === language)?.flag}
                </span>
              </motion.button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    whileHover={{ x: 4 }}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      language === lang.code 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </motion.button>
            
            {/* User Menu or Auth Buttons */}
            {user && profile ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">{profile.name}</span>
                </motion.button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-gray-900 dark:text-white">{profile.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                          {profile.subscription} Plan
                        </p>
                      </div>
                      
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-b-lg"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAuthClick('login')}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                >
                  {t('header.login')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAuthClick('register')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg"
                >
                  {t('header.register')}
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4"
            >
              {/* Mobile Search */}
              {location.pathname === '/' && (
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder={t('header.search')}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {/* Mobile Navigation Items */}
              <div className="space-y-2">
                {user && profile ? (
                  <>
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">{profile.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
                    </div>
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleAuthClick('login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                    >
                      {t('header.login')}
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick('register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg transition-colors text-left"
                    >
                      {t('header.register')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
    </motion.header>
  );
};

export default EnhancedHeader;