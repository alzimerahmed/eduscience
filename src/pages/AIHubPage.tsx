import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Cpu, BookOpen, Target, Zap, MessageSquare, School, ChevronRight, Activity, Calculator, TestTube } from 'lucide-react';
import AdvancedChatbot from '../components/AdvancedChatbot';
import AIRecommendations from '../components/AIRecommendations';
import AdvancedAnalytics from '../components/AdvancedAnalytics';

const AIHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chatbot' | 'analytics' | 'recommendations'>('overview');

  const aiFeatures = [
    {
      title: 'AI Study Assistant',
      description: 'Get instant answers to your questions with our advanced AI chat assistant. Supports multiple languages including Tamil and Sinhala.',
      icon: <MessageSquare className="h-10 w-10 text-violet-500" />,
      action: () => setActiveTab('chatbot')
    },
    {
      title: 'Personalized Recommendations',
      description: 'Receive AI-powered content recommendations based on your learning patterns, strengths, and areas for improvement.',
      icon: <Target className="h-10 w-10 text-blue-500" />,
      action: () => setActiveTab('recommendations')
    },
    {
      title: 'Advanced Learning Analytics',
      description: 'Gain deep insights into your learning journey with quantum-powered analytics that visualize your progress patterns.',
      icon: <Activity className="h-10 w-10 text-orange-500" />,
      action: () => setActiveTab('analytics')
    },
    {
      title: 'Smart Problem Solver',
      description: 'Step-by-step solutions to complex math and science problems with detailed explanations and visual aids.',
      icon: <Calculator className="h-10 w-10 text-green-500" />
    },
    {
      title: 'AI Tutor Sessions',
      description: 'One-on-one tutoring with our AI to master difficult concepts and prepare for exams with personalized feedback.',
      icon: <School className="h-10 w-10 text-pink-500" />
    },
    {
      title: '3D Molecular Visualization',
      description: 'Interactive 3D models of molecules and complex structures that respond to voice commands.',
      icon: <TestTube className="h-10 w-10 text-cyan-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0C22] via-[#121638] to-[#2A2F5E] text-[#F2F2FF] py-8 px-4 sm:px-6 lg:px-8">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#8494FF]/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              className="bg-gradient-to-r from-[#8494FF] to-[#E68A49] p-5 rounded-full mr-4"
            >
              <Brain className="h-12 w-12 text-[#121638]" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8494FF] to-[#E68A49]">
              AI Learning Hub
            </h1>
          </div>
          <p className="text-xl text-[#F2F2FF]/80 max-w-3xl mx-auto">
            Explore our suite of advanced AI-powered learning tools designed to enhance your science education experience.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        {activeTab !== 'overview' && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-[#121638]/50 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 text-[#F2F2FF]/70 hover:text-[#F2F2FF] rounded-md flex items-center space-x-1"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>Back to overview</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#121638]/80 backdrop-blur-sm p-6 rounded-xl border border-[#8494FF]/20 hover:border-[#8494FF]/50 shadow-lg group cursor-pointer"
                onClick={feature.action}
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(132, 148, 255, 0.2)" }}
              >
                <div className="bg-gradient-to-br from-[#121638] to-[#2A2F5E] w-16 h-16 rounded-lg flex items-center justify-center mb-5 group-hover:shadow-[0_0_15px_rgba(132,148,255,0.5)] transition-all duration-300">
                  {feature.icon}
                </div>
                
                <h2 className="text-xl font-bold mb-2 text-[#F2F2FF] group-hover:text-[#8494FF] transition-colors">
                  {feature.title}
                </h2>
                
                <p className="text-[#F2F2FF]/70 mb-4">
                  {feature.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-xs text-[#8494FF]">
                    <Sparkles className="h-3 w-3 mr-1" />
                    <span>AI Enhanced</span>
                  </div>
                  
                  <motion.div
                    className="flex items-center text-sm font-medium text-[#E68A49]"
                    whileHover={{ x: 5 }}
                  >
                    <span>Explore</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </motion.div>
                </div>

                {/* 3D lighting effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none z-0">
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 via-purple-500/0 to-orange-500/30 rounded-xl blur-sm"
                    animate={{
                      background: [
                        "radial-gradient(circle at 50% 50%, rgba(132, 148, 255, 0.3) 0%, rgba(18, 22, 56, 0) 70%)",
                        "radial-gradient(circle at 60% 60%, rgba(132, 148, 255, 0.3) 0%, rgba(18, 22, 56, 0) 70%)",
                        "radial-gradient(circle at 40% 40%, rgba(132, 148, 255, 0.3) 0%, rgba(18, 22, 56, 0) 70%)",
                        "radial-gradient(circle at 50% 50%, rgba(132, 148, 255, 0.3) 0%, rgba(18, 22, 56, 0) 70%)"
                      ]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : activeTab === 'chatbot' ? (
          <AdvancedChatbot />
        ) : activeTab === 'analytics' ? (
          <AdvancedAnalytics />
        ) : (
          <AIRecommendations />
        )}

        {/* Bottom CTAs */}
        <div className="mt-16 flex justify-center gap-4 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#8494FF] to-[#8494FF] px-6 py-3 rounded-lg text-[#121638] font-bold shadow-lg flex items-center space-x-2"
          >
            <Brain className="h-5 w-5" />
            <span>Try AI Tutor</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#E68A49] to-[#E68A49] px-6 py-3 rounded-lg text-[#121638] font-bold shadow-lg flex items-center space-x-2"
          >
            <BookOpen className="h-5 w-5" />
            <span>Explore Study Resources</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#121638] border border-[#8494FF]/50 px-6 py-3 rounded-lg text-[#F2F2FF] font-bold shadow-lg flex items-center space-x-2"
          >
            <Zap className="h-5 w-5 text-[#8494FF]" />
            <span>View Demo</span>
          </motion.button>
        </div>

        {/* Tech Badge */}
        <div className="mt-20 text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1 }}
            className="inline-flex items-center space-x-2 bg-[#121638]/80 border border-[#8494FF]/20 px-4 py-2 rounded-full"
          >
            <Cpu className="h-4 w-4 text-[#8494FF]" />
            <span className="text-xs text-[#F2F2FF]/70">Powered by Quantum Neural Networks</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIHubPage;