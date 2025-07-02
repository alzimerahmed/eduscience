import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Brain, MinusCircle, Sparkles, ChevronUp, ChevronDown, Lightbulb } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const initialSuggestions = [
  "Help me solve this equation: 2x² + 5x - 3 = 0",
  "Explain the concept of photosynthesis",
  "What are Newton's laws of motion?",
  "How do I calculate the area of a circle?"
];

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    
    // Simulate AI thinking and generate new suggestions based on user query
    setTimeout(() => {
      let aiResponse = '';
      
      if (message.includes('equation')) {
        aiResponse = "To solve the quadratic equation 2x² + 5x - 3 = 0, we can use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a, where a=2, b=5, and c=-3.\n\nStep 1: Calculate the discriminant: b² - 4ac = 25 - 4(2)(-3) = 25 + 24 = 49\nStep 2: Apply the formula: x = (-5 ± √49) / 4 = (-5 ± 7) / 4\nStep 3: Simplify: x = (-5 + 7) / 4 = 2/4 = 0.5 or x = (-5 - 7) / 4 = -12/4 = -3\n\nTherefore, the solutions are x = 0.5 and x = -3.";
      } else if (message.includes('photosynthesis')) {
        aiResponse = "Photosynthesis is the process by which plants convert light energy into chemical energy. The basic equation is:\n\n6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\nThis process occurs primarily in the chloroplasts of plant cells and involves two main stages:\n\n1. Light-dependent reactions: Capture light energy to produce ATP and NADPH\n2. Light-independent reactions (Calvin cycle): Use ATP and NADPH to convert CO₂ into glucose";
      } else if (message.includes('newton')) {
        aiResponse = "Newton's Three Laws of Motion:\n\n1. First Law (Law of Inertia): An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force.\n\n2. Second Law: The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. F = ma\n\n3. Third Law: For every action, there is an equal and opposite reaction.";
      } else if (message.includes('circle')) {
        aiResponse = "The area of a circle is calculated using the formula:\n\nA = πr²\n\nWhere:\n- A is the area\n- r is the radius of the circle\n- π (pi) is approximately 3.14159\n\nIf you have the diameter (d) instead of the radius, remember that r = d/2, so the formula becomes:\n\nA = π(d/2)² = πd²/4";
      } else {
        aiResponse = "I'm here to help with your questions about math, science, and other subjects. Could you please provide more details about what you'd like to learn?";
      }
      
      // Generate new contextual suggestions
      const newSuggestions = [
        "Can you explain this in simpler terms?",
        "Show me a practical example of this concept",
        "What's the history behind this discovery?",
        "How is this applied in the real world?"
      ];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, aiMessage]);
      setSuggestions(newSuggestions);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat bubble button */}
      <motion.button
        className={`fixed z-50 flex items-center justify-center rounded-full shadow-lg ${
          isOpen ? 'right-[376px] bottom-6 bg-[#F6B17A] text-[#2D3250]' : 'right-6 bottom-6 bg-[#7077A1] text-[#F7E6C4]'
        } w-14 h-14 hover:scale-110 transition-all duration-300`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chatbot panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, height: isMinimized ? 60 : 600 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              height: isMinimized ? 60 : 600,
              width: 360
            }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-40 right-6 bottom-6 w-[360px] rounded-2xl shadow-xl overflow-hidden flex flex-col bg-gradient-to-br from-[#7077A1] to-[#2D3250]"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#F7E6C4]/10 flex items-center justify-between bg-[#2D3250]">
              <div className="flex items-center">
                <div className="bg-[#F6B17A] rounded-full p-1.5 mr-3">
                  <Brain size={18} className="text-[#2D3250]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F7E6C4]">AI Study Assistant</h3>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    <span className="text-xs text-[#F7E6C4]/70">Online</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-full hover:bg-[#F7E6C4]/10 text-[#F7E6C4]/80 hover:text-[#F7E6C4] transition-colors"
                >
                  {isMinimized ? <ChevronUp size={18} /> : <MinusCircle size={18} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#F7E6C4]/10 text-[#F7E6C4]/80 hover:text-[#F7E6C4] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="bg-[#F6B17A] rounded-full p-3 mb-4">
                          <Sparkles size={28} className="text-[#2D3250]" />
                        </div>
                        <h3 className="text-[#F7E6C4] font-semibold text-lg mb-2">AI Study Assistant</h3>
                        <p className="text-[#F7E6C4]/70 mb-6">
                          Ask any question about your studies, and I'll help you understand the concepts.
                        </p>
                        <div className="grid grid-cols-2 gap-2 w-full">
                          {initialSuggestions.slice(0, 4).map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="bg-[#F7E6C4]/10 hover:bg-[#F7E6C4]/20 text-[#F7E6C4] rounded-lg p-2 text-sm text-left transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.sender === 'user'
                              ? 'bg-[#F6B17A] text-[#2D3250]'
                              : 'bg-[#F7E6C4]/10 text-[#F7E6C4]'
                          }`}
                        >
                          {msg.sender === 'ai' && (
                            <div className="flex items-center mb-1">
                              <Brain size={14} className="text-[#F6B17A] mr-1" />
                              <span className="text-xs font-medium text-[#F6B17A]">AI Assistant</span>
                            </div>
                          )}
                          <div className="whitespace-pre-line text-sm">
                            {msg.text}
                          </div>
                          <div className="text-xs opacity-50 mt-1 text-right">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* AI Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-[#F7E6C4]/10 rounded-2xl px-4 py-3 text-[#F7E6C4]">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-[#F6B17A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-[#F6B17A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-[#F6B17A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Suggestions */}
                  {messages.length > 0 && (
                    <div className="px-4 py-3 border-t border-[#F7E6C4]/10">
                      <div className="flex items-center mb-2">
                        <Lightbulb size={14} className="text-[#F6B17A] mr-1" />
                        <span className="text-xs font-medium text-[#F7E6C4]/70">Suggested questions</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="bg-[#F7E6C4]/10 hover:bg-[#F7E6C4]/20 text-[#F7E6C4] rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Input */}
                  <div className="p-4 border-t border-[#F7E6C4]/10">
                    <div className="relative">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="w-full bg-[#F7E6C4]/10 text-[#F7E6C4] rounded-xl pl-4 pr-12 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#F6B17A]/50 placeholder-[#F7E6C4]/50"
                        rows={1}
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                      ></textarea>
                      <motion.button
                        className="absolute right-2 bottom-2 bg-[#F6B17A] text-[#2D3250] rounded-lg p-2"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Send size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;