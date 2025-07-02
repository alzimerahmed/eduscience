import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Brain, Lightbulb, BookOpen, Calculator, TestTube, Atom, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  language?: string;
  confidence?: number;
  sources?: string[];
  suggestions?: string[];
}

interface ChatbotCapability {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  examples: string[];
}

const AdvancedChatbot: React.FC = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const capabilities: ChatbotCapability[] = [
    {
      id: 'explain',
      name: 'Concept Explanation',
      icon: Brain,
      description: 'Get detailed explanations of scientific concepts',
      examples: ['Explain photosynthesis', 'What is quantum entanglement?', 'How does DNA replication work?']
    },
    {
      id: 'solve',
      name: 'Problem Solving',
      icon: Calculator,
      description: 'Step-by-step solutions to problems',
      examples: ['Solve this equation: x² + 5x + 6 = 0', 'Calculate the pH of 0.1M HCl', 'Find the velocity of a falling object']
    },
    {
      id: 'chemistry',
      name: 'Chemistry Helper',
      icon: TestTube,
      description: 'Chemical reactions, mechanisms, and properties',
      examples: ['Balance this equation: C₆H₁₂O₆ + O₂ → CO₂ + H₂O', 'Explain SN2 mechanism', 'What is the molecular geometry of SF₆?']
    },
    {
      id: 'physics',
      name: 'Physics Assistant',
      icon: Atom,
      description: 'Physics concepts, formulas, and calculations',
      examples: ['Explain Newtons laws', 'Calculate kinetic energy', 'What is wave-particle duality?']
    },
    {
      id: 'translate',
      name: 'Multi-language Support',
      icon: Star,
      description: 'Explanations in Tamil and Sinhala',
      examples: ['Explain in Tamil', 'සිංහලෙන් පැහැදිලි කරන්න', 'தமிழில் விளக்கவும்']
    }
  ];

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      content: getWelcomeMessage(),
      timestamp: new Date().toISOString(),
      language: language,
      confidence: 1.0
    };
    setMessages([welcomeMessage]);
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getWelcomeMessage = () => {
    switch (language) {
      case 'ta':
        return 'வணக்கம்! நான் உங்கள் AI அறிவியல் உதவியாளர். வேதியியல், இயற்பியல் மற்றும் உயிரியல் கேள்விகளில் உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன். எனக்கு எந்த கேள்வியும் கேளுங்கள்!';
      case 'si':
        return 'ආයුබෝවන්! මම ඔබේ AI විද්‍යා සහායකයා. රසායන විද්‍යාව, භෞතික විද්‍යාව සහ ජීව විද්‍යාව පිළිබඳ ප්‍රශ්නවලට උදව් කිරීමට මම මෙහි සිටිමි. මට ඕනෑම ප්‍රශ්නයක් අසන්න!';
      default:
        return 'Hello! I\'m your AI Science Assistant. I\'m here to help you with chemistry, physics, and biology questions. I can explain concepts, solve problems, and provide step-by-step solutions in multiple languages. Ask me anything!';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBotResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let sources: string[] = [];
    let suggestions: string[] = [];

    // Advanced AI response generation based on content
    if (lowerMessage.includes('photosynthesis') || lowerMessage.includes('ஒளிச்சேர்க்கை') || lowerMessage.includes('ප්‍රභාසංශ්ලේෂණය')) {
      response = language === 'ta' 
        ? 'ஒளிச்சேர்க்கை என்பது தாவரங்கள் சூரிய ஒளியைப் பயன்படுத்தி கார்பன் டை ஆக்சைடு மற்றும் நீரிலிருந்து குளுக்கோஸ் தயாரிக்கும் செயல்முறையாகும். இதன் சமன்பாடு: 6CO₂ + 6H₂O + ஒளி ஆற்றல் → C₆H₁₂O₆ + 6O₂'
        : language === 'si'
        ? 'ප්‍රභාසංශ්ලේෂණය යනු ශාක සූර්ය ආලෝකය භාවිතා කරමින් කාබන් ඩයොක්සයිඩ් සහ ජලයෙන් ග්ලූකෝස් නිපදවන ක්‍රියාවලියයි. සමීකරණය: 6CO₂ + 6H₂O + ආලෝක ශක්තිය → C₆H₁₂O₆ + 6O₂'
        : 'Photosynthesis is the process by which plants use sunlight to convert carbon dioxide and water into glucose. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This occurs in two stages: light-dependent reactions (in thylakoids) and light-independent reactions (Calvin cycle in stroma).';
      
      sources = ['Campbell Biology', 'Khan Academy', 'Nature Education'];
      suggestions = ['Explain chloroplast structure', 'What is the Calvin cycle?', 'How do C3, C4, and CAM plants differ?'];
    } else if (lowerMessage.includes('quantum') || lowerMessage.includes('குவாண்டம்') || lowerMessage.includes('ක්වොන්ටම්')) {
      response = language === 'ta'
        ? 'குவாண்டம் இயக்கவியல் என்பது அணு மற்றும் துணை அணு துகள்களின் நடத்தையை விவரிக்கும் இயற்பியல் கோட்பாடாகும். இதில் துகள்கள் அலை மற்றும் துகள் பண்புகளை ஒரே நேரத்தில் காட்டுகின்றன.'
        : language === 'si'
        ? 'ක්වොන්ටම් යාන්ත්‍රික විද්‍යාව යනු පරමාණු සහ උප-පරමාණු අංශුවල හැසිරීම විස්තර කරන භෞතික විද්‍යා න්‍යායකි. මෙහිදී අංශු එකම වේලාවේ තරංග සහ අංශු ගුණ පෙන්වයි.'
        : 'Quantum mechanics is the physics theory that describes the behavior of atoms and subatomic particles. Key principles include wave-particle duality, uncertainty principle, and quantum superposition. Particles can exist in multiple states simultaneously until observed.';
      
      sources = ['Griffiths Quantum Mechanics', 'MIT OpenCourseWare', 'Feynman Lectures'];
      suggestions = ['Explain wave-particle duality', 'What is Schrödinger\'s equation?', 'How does quantum entanglement work?'];
    } else if (lowerMessage.includes('dna') || lowerMessage.includes('டிஎன்ஏ') || lowerMessage.includes('ඩීඑන්ඒ')) {
      response = language === 'ta'
        ? 'டிஎன்ஏ (டீஆக்ஸிரைபோநியூக்ளிக் அமிலம்) என்பது அனைத்து உயிரினங்களின் மரபணு தகவல்களைக் கொண்டிருக்கும் மூலக்கூறாகும். இது இரட்டை சுருள் அமைப்பைக் கொண்டுள்ளது மற்றும் A, T, G, C என்ற நான்கு அடிப்படைகளால் ஆனது.'
        : language === 'si'
        ? 'ඩීඑන්ඒ (ඩීඔක්සිරයිබෝනියුක්ලීක් අම්ලය) යනු සියලුම ජීවීන්ගේ ප්‍රවේණික තොරතුරු අඩංගු අණුවකි. එය ද්විත්ව හෙලික්ස් ව්‍යුහයක් ඇති අතර A, T, G, C යන මූලික හතරකින් සමන්විතයි.'
        : 'DNA (Deoxyribonucleic acid) is the molecule that contains genetic information in all living organisms. It has a double helix structure with four bases: Adenine (A), Thymine (T), Guanine (G), and Cytosine (C). Base pairing follows A-T and G-C rules.';
      
      sources = ['Molecular Biology of the Cell', 'NCBI Genetics Home Reference', 'Nature Reviews Genetics'];
      suggestions = ['How does DNA replication work?', 'What is the genetic code?', 'Explain transcription and translation'];
    } else {
      response = language === 'ta'
        ? 'மன்னிக்கவும், அந்த கேள்வியை நான் முழுமையாக புரிந்து கொள்ளவில்லை. தயவுசெய்து மேலும் குறிப்பிட்ட அறிவியல் கேள்வி கேளுங்கள் அல்லது கீழே உள்ள பரிந்துரைகளில் ஒன்றைத் தேர்ந்தெடுக்கவும்.'
        : language === 'si'
        ? 'සමාවන්න, මට එම ප්‍රශ්නය සම්පූර්ණයෙන් තේරුම් ගත නොහැකි විය. කරුණාකර වඩාත් නිශ්චිත විද්‍යා ප්‍රශ්නයක් අසන්න හෝ පහත යෝජනාවලින් එකක් තෝරන්න.'
        : 'I\'m sorry, I didn\'t fully understand that question. Please ask a more specific science question or choose from the suggestions below. I can help with chemistry, physics, biology, and mathematics problems.';
      
      suggestions = ['Explain photosynthesis', 'What is quantum mechanics?', 'How does DNA work?', 'Solve a chemistry equation'];
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: response,
      timestamp: new Date().toISOString(),
      language: language,
      confidence: 0.95,
      sources,
      suggestions
    };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleCapabilityClick = (capability: ChatbotCapability) => {
    setSelectedCapability(capability.id);
    const example = capability.examples[Math.floor(Math.random() * capability.examples.length)];
    setInputMessage(example);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real app, this would start/stop speech recognition
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Advanced AI Science Assistant</h3>
              <p className="text-blue-100 text-sm">Powered by GPT-4 • Multi-language • Real-time</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">AI Capabilities</h4>
        <div className="flex flex-wrap gap-2">
          {capabilities.map((capability) => {
            const IconComponent = capability.icon;
            return (
              <button
                key={capability.id}
                onClick={() => handleCapabilityClick(capability)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedCapability === capability.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                    : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{capability.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
              }`}>
                {message.type === 'bot' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">AI Assistant</span>
                    {message.confidence && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(message.confidence * 100)}% confident
                      </span>
                    )}
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sources:</div>
                    <div className="flex flex-wrap gap-1">
                      {message.sources.map((source, index) => (
                        <span key={index} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Related questions:</div>
                    <div className="space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                        >
                          • {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">AI Assistant is thinking</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={language === 'ta' ? 'உங்கள் அறிவியல் கேள்வியை கேளுங்கள்...' : 
                        language === 'si' ? 'ඔබේ විද්‍යා ප්‍රශ්නය අසන්න...' : 
                        'Ask your science question...'}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          AI responses are generated and may contain errors. Always verify important information.
        </div>
      </div>
    </div>
  );
};

export default AdvancedChatbot;