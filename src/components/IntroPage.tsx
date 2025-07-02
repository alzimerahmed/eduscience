import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Notebook, Sparkles, ArrowRight, Atom, TestTube, Calculator, BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface IntroPageProps {
  onStartLearning?: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onStartLearning }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const handleStartLearning = () => {
    if (onStartLearning) {
      onStartLearning();
    } else {
      navigate('/resources');
    }
  };
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 
      'bg-gradient-to-br from-[#0A0C22] via-[#121638] to-[#2A2F5E] text-[#F2F2FF]' : 
      'bg-gradient-to-br from-[#121638] via-[#2A2F5E] to-[#3D4380] text-[#F2F2FF]'}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#8494FF]/10"
            style={{
              width: Math.random() * 100 + 20,
              height: Math.random() * 100 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 relative z-10 mt-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-10">
          <motion.div 
            className="md:w-1/2 mb-12 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Science <span className="text-[#E68A49]">Reimagined</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8 text-[#F2F2FF]/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Discover a new way to learn with our AI-powered platform. 
              AI-powered study tools for Chemistry, Physics, Mathematics, and Biology
              with personalized feedback and 3D visualization.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.button 
                className="bg-[#8494FF] hover:bg-[#96A4FF] text-[#121638] font-bold py-3 px-8 rounded-lg shadow-lg flex items-center group transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartLearning}
              >
                Start Learning Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Decorative elements */}
              <motion.div 
                className="absolute inset-0 bg-[#8494FF] rounded-full opacity-20"
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              
              <motion.div 
                className="absolute inset-4 bg-[#E68A49] rounded-full opacity-20"
                animate={{ 
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.5
                }}
              />
              
              <motion.div 
                className="absolute inset-8 bg-[#F2F2FF] rounded-full opacity-30"
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1
                }}
              />
              
              {/* Central icon */}
              <motion.div 
                className="absolute inset-16 md:inset-24 bg-[#121638] rounded-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Brain className="w-20 h-20 md:w-24 md:h-24 text-[#E68A49]" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Feature Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-28"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.div 
            className="bg-[#121638]/80 backdrop-blur-sm p-8 rounded-xl border border-[#8494FF]/20 hover:border-[#8494FF]/40"
            whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(132, 148, 255, 0.3)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-[#8494FF] to-[#6A78DB] w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Atom className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">3D Visualization</h3>
            <p className="text-[#F2F2FF]/80">
              Explore complex molecules, physics concepts and biological
              structures in interactive 3D with our cutting-edge visualization tools.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-[#121638]/80 backdrop-blur-sm p-8 rounded-xl border border-[#8494FF]/20 hover:border-[#8494FF]/40"
            whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(132, 148, 255, 0.3)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-[#E68A49] to-[#DD6B2D] w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">AI-Powered Insights</h3>
            <p className="text-[#F2F2FF]/80">
              Our quantum-enhanced neural networks analyze your learning patterns
              to provide personalized recommendations and advanced insights.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-[#121638]/80 backdrop-blur-sm p-8 rounded-xl border border-[#8494FF]/20 hover:border-[#8494FF]/40"
            whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(132, 148, 255, 0.3)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-[#8494FF] to-[#6A78DB] w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <TestTube className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">Virtual Laboratory</h3>
            <p className="text-[#F2F2FF]/80">
              Conduct virtual experiments and simulations in our immersive 
              laboratory environment with real-time feedback and guidance.
            </p>
          </motion.div>

          <motion.div 
            className="bg-[#121638]/80 backdrop-blur-sm p-8 rounded-xl border border-[#8494FF]/20 hover:border-[#8494FF]/40"
            whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(132, 148, 255, 0.3)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-[#E68A49] to-[#DD6B2D] w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">Advanced Analytics</h3>
            <p className="text-[#F2F2FF]/80">
              Track your learning journey with quantum-powered analytics that 
              provide deep insights into your cognitive patterns and learning efficiency.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-3 rounded-full shadow-lg ${isDarkMode ? 'bg-[#E68A49] text-[#121638]' : 'bg-[#121638] text-[#E68A49]'}`}
          onClick={toggleDarkMode}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </motion.button>
      </div>
    </div>
  );
};

export default IntroPage;