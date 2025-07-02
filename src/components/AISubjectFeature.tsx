import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Calculator, Atom, Microscope, Beaker, Brain, Lightbulb, Zap, ChevronRight, Plus, ArrowRight, Globe, BookOpen, Sparkles, Maximize } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  aiSuggestions: string[];
}

const subjects: Subject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: <Calculator className="h-8 w-8" />,
    color: 'from-blue-500 to-indigo-600',
    description: 'Explore algebra, calculus, geometry and more with interactive exercises',
    aiSuggestions: [
      'Try our new quadratic equation solver',
      'Practice calculus with step-by-step guidance',
      'Visualize geometric concepts in 3D'
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: <Atom className="h-8 w-8" />,
    color: 'from-purple-500 to-indigo-600',
    description: 'Discover the fundamental laws that govern our universe',
    aiSuggestions: [
      'Interactive simulations for Newton\'s laws',
      'Quantum mechanics explanations with visual aids',
      'Solve complex physics problems with AI guidance'
    ]
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: <Microscope className="h-8 w-8" />,
    color: 'from-emerald-500 to-green-600',
    description: 'Understand living organisms from cellular level to ecosystems',
    aiSuggestions: [
      'Explore 3D models of cell structures',
      'Interactive genetic inheritance simulations',
      'Visual guides to biological processes'
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: <Beaker className="h-8 w-8" />,
    color: 'from-orange-400 to-pink-600',
    description: 'Learn about elements, compounds, and chemical reactions',
    aiSuggestions: [
      'Interactive periodic table with detailed insights',
      'Molecular structure visualization tools',
      'Balance chemical equations with AI assistance'
    ]
  }
];

// 3D Card component with parallax effect
const Card3D: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate rotation based on mouse position
    const rotateYValue = ((mouseX - centerX) / (rect.width / 2)) * 5;
    const rotateXValue = ((mouseY - centerY) / (rect.height / 2)) * 5;
    
    setRotateX(-rotateXValue);
    setRotateY(rotateYValue);
    setScale(1.02);
  };
  
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative perspective-1000 ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transition: "transform 0.1s ease-out"
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {/* Glassmorphism effect overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
      {/* Edge lighting effect */}
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-blue-500/30 via-purple-500/0 to-orange-500/30 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"></div>
    </motion.div>
  );
};

// Floating particles component
const FloatingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(30)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 rounded-full bg-blue-500/20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 1.5 + 0.5,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 30 + 20,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};

const AISubjectFeature: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  // Reference for the 3D orbit
  const orbitRef = useRef<HTMLDivElement>(null);
  const [orbiting, setOrbiting] = useState(true);

  useEffect(() => {
    if (selectedSubject) {
      const randomSuggestion = selectedSubject.aiSuggestions[
        Math.floor(Math.random() * selectedSubject.aiSuggestions.length)
      ];
      
      setIsTyping(true);
      setAiSuggestion('');
      
      let index = 0;
      const interval = setInterval(() => {
        setAiSuggestion(randomSuggestion.substring(0, index));
        index++;
        
        if (index > randomSuggestion.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [selectedSubject]);

  // Animation for orbital subjects
  useEffect(() => {
    if (!orbitRef.current || !orbiting) return;
    
    const interval = setInterval(() => {
      // Rotate the orbit
      if (orbitRef.current) {
        const currentRotation = orbitRef.current.style.transform || 'rotate(0deg)';
        const currentDegrees = parseInt(currentRotation.replace(/[^0-9-]/g, '') || '0');
        orbitRef.current.style.transform = `rotate(${currentDegrees + 1}deg)`;
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [orbiting, orbitRef]);
  
  const bgClass = isDarkMode 
    ? 'from-[#0A0C22] via-[#121638] to-[#2A2F5E]' 
    : 'from-[#121638] via-[#2A2F5E] to-[#3D4380]';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgClass} text-[#F2F2FF] relative overflow-hidden py-8`}>
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      <div className="container mx-auto px-6 z-10 relative mt-12">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-4xl font-bold mb-4 text-[#F2F2FF] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore Subjects with <span className="text-[#8494FF]">AI Guidance</span>
          </motion.h2>
          <motion.p 
            className="text-lg text-[#F2F2FF]/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Select a subject to discover interactive learning materials and receive 
            personalized AI recommendations based on your interests.
          </motion.p>
        </motion.div>

        {/* 3D Orbital Subject Selection */}
        {!selectedSubject ? (
          <div className="relative h-[600px] max-w-4xl mx-auto">
            {/* Central Brain Icon */}
            <motion.div 
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-[#121638] to-[#2A2F5E] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(132,148,255,0.5)]">
                <Brain className="w-16 h-16 text-[#E68A49]" />
              </div>
              
              {/* Pulsing rings */}
              <motion.div 
                className="absolute -inset-4 rounded-full border-2 border-[#8494FF]/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -inset-8 rounded-full border-2 border-[#8494FF]/10"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>
            
            {/* Orbital Circle */}
            <div ref={orbitRef} className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full">
              {subjects.map((subject, index) => {
                // Position each subject at a different point in the orbit
                const angle = (index * (360 / subjects.length)) * (Math.PI / 180);
                const radius = 250; // Half of the width/height of the orbit
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                
                return (
                  <motion.div 
                    key={subject.id}
                    className="absolute"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                  >
                    <Card3D 
                      className="w-[200px] h-[260px] bg-[#121638]/90 rounded-xl shadow-xl border border-[#8494FF]/20 hover:border-[#8494FF]/50 group cursor-pointer overflow-hidden"
                      onClick={() => {
                        setOrbiting(false);
                        setSelectedSubject(subject);
                      }}
                    >
                      <div className="p-6 h-full flex flex-col">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${subject.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-[0_0_15px_rgba(132,148,255,0.6)]`}>
                          {subject.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-[#F2F2FF] group-hover:text-[#8494FF]">{subject.name}</h3>
                        <p className="text-sm text-[#F2F2FF]/70 flex-grow">{subject.description}</p>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <Brain className="h-4 w-4 text-[#8494FF] mr-1" />
                            <span className="text-xs text-[#8494FF]">AI enhanced</span>
                          </div>
                          <motion.div 
                            className="flex items-center text-xs font-medium text-[#E68A49]"
                            whileHover={{ x: 5 }}
                          >
                            <span>Explore</span>
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* 3D hover effect lighting */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                        <div className="absolute -inset-[100px] bg-gradient-to-br from-blue-500/30 via-purple-500/0 to-orange-500/30 blur-3xl" />
                      </div>
                    </Card3D>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Toggle orbit animation */}
            <button 
              className="absolute top-4 right-4 p-2 bg-[#121638] rounded-full"
              onClick={() => setOrbiting(!orbiting)}
            >
              {orbiting ? <Maximize className="h-5 w-5 text-[#8494FF]" /> : <Globe className="h-5 w-5 text-[#8494FF]" />}
            </button>
          </div>
        ) : (
          <motion.div 
            className="bg-gradient-to-r from-[#121638] to-[#2A2F5E] rounded-xl shadow-xl p-8 text-white relative overflow-hidden max-w-5xl mx-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative elements */}
            <motion.div
              className="absolute -top-12 -right-12 w-48 h-48 bg-[#8494FF] rounded-full opacity-10"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-32 h-32 bg-[#E68A49] rounded-full opacity-10"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            />
            
            <div className="flex items-start relative z-10">
              <div className="bg-[#E68A49] p-4 rounded-xl mr-6 shadow-[0_0_15px_rgba(230,138,73,0.6)]">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1 flex items-center">
                  <span>AI Suggestions for {selectedSubject.name}</span>
                  <div className="ml-3 bg-[#8494FF] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    <span>QUANTUM</span>
                  </div>
                </h3>
                
                <div className="h-28">
                  <div className="flex items-start mb-4">
                    <Brain className="h-5 w-5 text-[#8494FF] mr-3 mt-0.5" />
                    <div>
                      <div className="text-lg text-[#F2F2FF] mb-1 min-h-[28px] relative">
                        {aiSuggestion}
                        {isTyping && (
                          <span className="ml-1 inline-block w-2 h-5 bg-[#8494FF] animate-blink"></span>
                        )}
                      </div>
                      <motion.button
                        className="text-sm bg-[#2A2F5E] hover:bg-[#8494FF] text-white hover:text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Try This Activity
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {selectedSubject.aiSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      className="bg-[#2A2F5E]/70 hover:bg-[#2A2F5E] text-left p-3 rounded-lg text-sm transition-colors duration-300 border border-[#8494FF]/20 hover:border-[#8494FF]/50"
                      whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(132, 148, 255, 0.4)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setIsTyping(true);
                        setAiSuggestion('');
                        
                        let index = 0;
                        const interval = setInterval(() => {
                          setAiSuggestion(suggestion.substring(0, index));
                          index++;
                          
                          if (index > suggestion.length) {
                            clearInterval(interval);
                            setIsTyping(false);
                          }
                        }, 30);
                      }}
                    >
                      <div className="flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-[#E68A49]" />
                        <span className="line-clamp-2">{suggestion}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-[#8494FF]/20">
                  <button 
                    className="px-4 py-2 bg-[#121638] text-[#F2F2FF] rounded-lg flex items-center"
                    onClick={() => {
                      setSelectedSubject(null);
                      setOrbiting(true);
                    }}
                  >
                    <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                    Back to subjects
                  </button>
                </div>
              </div>
            </div>

            {/* 3D Element Visualization */}
            <div className="mt-8 bg-[#121638]/70 p-6 rounded-xl border border-[#8494FF]/20">
              <h4 className="text-lg font-medium mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-[#8494FF]" />
                Interactive 3D {selectedSubject.name} Models
              </h4>
              
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                  <Card3D key={index} className="aspect-square bg-[#2A2F5E]/50 rounded-lg overflow-hidden group cursor-pointer">
                    <div className="h-full w-full flex flex-col items-center justify-center p-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8494FF]/30 to-[#8494FF]/10 flex items-center justify-center mb-2">
                        {index === 0 && <Atom className="h-8 w-8 text-[#8494FF]" />}
                        {index === 1 && <Calculator className="h-8 w-8 text-[#E68A49]" />}
                        {index === 2 && <Brain className="h-8 w-8 text-[#8494FF]" />}
                        {index === 3 && <Beaker className="h-8 w-8 text-[#E68A49]" />}
                      </div>
                      <h5 className="text-sm font-medium text-[#F2F2FF] text-center group-hover:text-[#8494FF] transition-colors">
                        {index === 0 && "Molecular Structure"}
                        {index === 1 && "Formula Solver"}
                        {index === 2 && "Neural Models"}
                        {index === 3 && "Chemical Reactions"}
                      </h5>
                      <span className="text-[10px] text-[#F2F2FF]/50 mt-1">Click to explore</span>
                    </div>
                    {/* Animated glow on hover */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none z-0"
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
                  </Card3D>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AISubjectFeature;