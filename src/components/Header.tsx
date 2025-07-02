import React, { useState } from 'react';
import { Search, BookOpen, Star, Download, FlaskConical, Brain, BarChart3, User, Zap, Moon, Sun, Globe, Upload, Settings, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import AuthModal from './Auth/AuthModal';
import { useAuth, UserProfile } from '../contexts/AuthContext';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAuthClick?: (mode: 'login' | 'register') => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange, onAuthClick }) => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    if (onAuthClick) {
      onAuthClick(mode);
    }
  };
  
  // Mock user data - in real app this would come from context/state
  const userXP = user?.stats.totalXP || 0;
  const userLevel = user?.stats.level || 1;
  const xpProgress = ((userXP % 250) / 250) * 100; // Assuming 250 XP per level

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' }
  ];

  const userMenuItems = [
    { icon: BarChart3, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: Upload, label: t('nav.upload'), path: '/upload' },
    { icon: Settings, label: t('nav.settings'), path: '/settings' },
    { icon: CreditCard, label: t('nav.pricing'), path: '/pricing' },
    { icon: HelpCircle, label: t('nav.guide'), path: '/guide' },
  ];

  if (user?.role === 'admin') {
    userMenuItems.splice(2, 0, { icon: Settings, label: t('nav.admin'), path: '/admin/exam-settings' });
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('header.title')}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('header.subtitle')}</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            {location.pathname === '/' && (
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder={t('header.search')}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            )}
            
            {/* XP Display - Only for logged in users */}
            {user && (
              <div className="hidden md:flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 transition-colors">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('header.level')} {userLevel}</span>
                </div>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{userXP} XP</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              {/* Language Selector */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {languages.find(l => l.code === language)?.flag}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        language === lang.code 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              
              {/* User Menu or Auth Buttons */}
              {user && profile ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">{profile.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">{profile.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">{profile.subscription} Plan</p>
                    </div>
                    
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={signOut}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-b-lg"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('header.login')}
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    {t('header.register')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
    </header>
  );
};

export default Header;