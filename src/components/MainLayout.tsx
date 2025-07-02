import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import AIChatbot from './AIChatbot';
import { useTheme } from '../contexts/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Simulate content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 
      'bg-gradient-to-br from-[#0A0C22] via-[#121638] to-[#2A2F5E]' : 
      'bg-gradient-to-br from-[#121638] via-[#2A2F5E] to-[#3D4380]'}`}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-60' : 'ml-20'}`}>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#E68A49] border-t-[#8494FF] rounded-full animate-spin"></div>
               <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 bg-[#8494FF] rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#E68A49] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </div>
      
      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default MainLayout;