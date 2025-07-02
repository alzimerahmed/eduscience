import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Book, BookOpen, Notebook, Brain, Star, User, 
  Settings, LogOut, ChevronLeft, ChevronRight, BarChart3, 
  Award, Calendar, Clock, ChevronDown
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  children?: NavItem[];
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('subjects'); 
  const { isDarkMode } = useTheme();
  
  const navItems: NavItem[] = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/' },
    { 
      icon: <BookOpen size={20} />, 
      label: 'Subjects',
      children: [
        { icon: <Book size={16} />, label: 'Mathematics', href: '/subjects/math' },
        { icon: <Book size={16} />, label: 'Physics', href: '/subjects/physics' },
        { icon: <Book size={16} />, label: 'Chemistry', href: '/subjects/chemistry' },
        { icon: <Book size={16} />, label: 'Biology', href: '/subjects/biology' }
      ]
    },
    { icon: <Notebook size={20} />, label: 'Notebook', href: '/notebook' },
    { 
      icon: <Brain size={20} />, 
      label: 'AI Tools',
      children: [
        { icon: <Brain size={16} />, label: 'Smart Tutor', href: '/ai/tutor' },
        { icon: <Brain size={16} />, label: 'Problem Solver', href: '/ai/solver' },
        { icon: <Brain size={16} />, label: 'Study Plans', href: '/ai/study-plans' },
      ]
    },
    { icon: <Star size={20} />, label: 'Favorites', href: '/favorites' },
    { icon: <User size={20} />, label: 'Profile', href: '/profile' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
  ];

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <motion.div
      className={`fixed top-0 left-0 h-screen ${isDarkMode ? 'bg-[#0A0C22] text-[#F2F2FF]' : 'bg-[#121638] text-[#F2F2FF]'} z-50 flex flex-col transition-all duration-300 ease-in-out`}
      animate={{ width: isCollapsed ? '80px' : '240px' }}
      initial={{ width: '240px' }}
    >
      {/* Logo & Toggle Button */}
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-[#2A2F5E]/50' : 'border-[#2A2F5E]/50'}`}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <div className="bg-[#E68A49] rounded-lg w-8 h-8 flex items-center justify-center mr-3">
              <Brain className="h-5 w-5 text-[#121638]" />
            </div>
            <span className="font-bold text-xl">EduAI</span>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="mx-auto bg-[#E68A49] rounded-lg w-10 h-10 flex items-center justify-center">
            <Brain className="h-6 w-6 text-[#121638]" />
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#F2F2FF]/70 hover:text-[#F2F2FF] transition-colors duration-300"
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={index}>
              {item.children ? (
                <div>
                  <motion.button
                    className={`flex items-center justify-between w-full p-3 rounded-lg text-left transition-all duration-300 ${
                      expandedSection === item.label.toLowerCase() 
                        ? 'bg-[#2A2F5E] text-[#F2F2FF]'
                        : 'text-[#F2F2FF]/70 hover:bg-[#2A2F5E]/60 hover:text-[#F2F2FF]'
                    }`}
                    onClick={() => !isCollapsed && toggleSection(item.label.toLowerCase())}
                    whileHover={{ x: isCollapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-4 flex items-center justify-center">
                        {item.icon}
                      </div>
                      {!isCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown size={16} className={`transform transition-transform duration-300 ${
                        expandedSection === item.label.toLowerCase() ? 'rotate-180' : 'rotate-0'
                      }`} />
                    )}
                  </motion.button>
                  
                  <AnimatePresence>
                    {!isCollapsed && expandedSection === item.label.toLowerCase() && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-1 ml-9 space-y-1"
                      >
                        {item.children.map((child, childIndex) => (
                          <motion.li key={childIndex}>
                            <a
                              href={child.href}
                              className="flex items-center p-2 text-[#F2F2FF]/70 hover:text-[#F2F2FF] hover:bg-[#8494FF]/20 rounded-lg transition-all duration-300"
                              whileHover={{ x: 3 }}
                            >
                              <div className="w-4 h-4 mr-3 flex items-center justify-center">
                                {child.icon}
                              </div>
                              <span className="text-sm">{child.label}</span>
                            </a>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.a
                  href={item.href}
                  className="flex items-center p-3 rounded-lg text-[#F2F2FF]/70 hover:bg-[#2A2F5E]/60 hover:text-[#F2F2FF] transition-all duration-300"
                  whileHover={{ x: isCollapsed ? 0 : 3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-5 h-5 mr-4 flex items-center justify-center">
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </motion.a>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* User Progress */}
      <div className={`p-4 bg-[#2A2F5E] border-t border-[#121638] ${isCollapsed ? 'items-center' : ''}`}>
        {!isCollapsed && (
          <>
            <h3 className="text-sm font-semibold mb-3 text-[#F2F2FF]/80">Your Progress</h3>
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Daily Streak</span>
                  <span className="font-medium">7 days</span>
                </div>
                <div className="w-full h-2 bg-[#121638] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E68A49] rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Weekly Goal</span>
                  <span className="font-medium">5/7 hours</span>
                </div>
                <div className="w-full h-2 bg-[#121638] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8494FF] rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="flex flex-col items-center justify-center bg-[#121638] rounded-lg p-2">
                <Calendar size={16} className="text-[#E68A49] mb-1" />
                <span className="text-xs">Today</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#121638] rounded-lg p-2">
                <Clock size={16} className="text-[#8494FF] mb-1" />
                <span className="text-xs">45 min</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#121638] rounded-lg p-2">
                <Award size={16} className="text-[#E68A49] mb-1" />
                <span className="text-xs">3 tasks</span>
              </div>
            </div>
          </>
        )}
        
        <div className="flex items-center space-x-3">
          {isCollapsed ? (
            <div className="mx-auto w-10 h-10 rounded-full bg-[#E68A49] flex items-center justify-center text-[#121638] font-bold">
              JS
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-[#E68A49] flex items-center justify-center text-[#121638] font-bold">
                JS
              </div>
              <div className="flex-1">
                <div className="font-medium">John Smith</div>
                <div className="text-xs text-[#F2F2FF]/70">Level 7 Scholar</div>
              </div>
              <button className="text-[#F2F2FF]/70 hover:text-[#F2F2FF]">
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;