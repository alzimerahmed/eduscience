import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0C22] via-[#121638] to-[#2A2F5E] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-[#121638]/60 backdrop-blur-lg rounded-2xl p-8 border border-[#8494FF]/30 shadow-xl text-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, 5, 0, -5, 0],
            scale: [1, 1.05, 1, 1.05, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="w-24 h-24 mx-auto mb-6 bg-[#8494FF]/10 rounded-full flex items-center justify-center"
        >
          <FileQuestion className="h-12 w-12 text-[#8494FF]" />
        </motion.div>
        
        <h1 className="text-4xl font-bold mb-2 text-[#F2F2FF]">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-[#F2F2FF]">Page Not Found</h2>
        
        <p className="text-[#F2F2FF]/80 mb-8">
          The page you're looking for doesn't exist or has been moved. Perhaps you can find what you need from our homepage.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 px-6 bg-[#8494FF] hover:bg-[#96A4FF] text-[#121638] rounded-lg font-bold flex items-center justify-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </motion.button>
          </Link>
          
          <Link to="/resources" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 px-6 bg-[#121638] border border-[#8494FF]/50 hover:border-[#8494FF] text-[#F2F2FF] rounded-lg font-bold flex items-center justify-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Search Resources</span>
            </motion.button>
          </Link>
        </div>
        
        <div className="mt-12 pt-4 border-t border-[#8494FF]/20">
          <button
            onClick={() => window.history.back()}
            className="text-[#8494FF] hover:text-[#96A4FF] flex items-center mx-auto space-x-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </motion.div>
      
      {/* Background floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
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
    </div>
  );
};

export default NotFoundPage;