import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Brain, Lightbulb, CheckCircle, AlertCircle, BookOpen, Target, Zap, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pastPapers } from '../data/mockData';
import { TutorMessage, AIGrading } from '../types';

const AITutor: React.FC = () => {
  const { paperId, questionId } = useParams<{ paperId: string; questionId: string }>();
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [showGrading, setShowGrading] = useState(false);
  const [aiGrading, setAiGrading] = useState<AIGrading | null>(null);
  const [sessionXP, setSessionXP] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const paper = pastPapers.find(p => p.id === paperId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: TutorMessage = {
      id: '1',
      sender: 'ai',
      message: `Welcome to your AI tutoring session! 🎓

I'm here to help you master this ${paper?.subject} question. Together, we'll:
• Break down complex concepts
• Provide personalized hints
• Give detailed feedback on your answers
• Help you earn XP as you learn

Let's start by reading the question carefully. Would you like me to explain what this question is asking, or are you ready to attempt an answer?`,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, [paper?.subject]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: TutorMessage = {
      id: Date.now().toString(),
      sender: 'student',
      message: inputMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Award XP for engagement
    setSessionXP(prev => prev + 5);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage: TutorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: aiResponse.message,
        timestamp: new Date().toISOString(),
        type: aiResponse.type
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('hint') || lowerInput.includes('help')) {
      setSessionXP(prev => prev + 10);
      return {
        message: `Great question! Here's a helpful hint: 💡

🔍 **Key Concept**: For SN2 reactions, remember that they proceed through a single concerted step with backside attack.

💡 **Think about**: 
- What happens to the stereochemistry?
- Which factors affect the reaction rate?
- What makes a good nucleophile?

**Study Tip**: Try to structure your answer around the mechanism first, then discuss the factors.

*+10 XP for asking for help - smart learning strategy!*

Would you like to attempt the answer now?`,
        type: 'hint' as const
      };
    }
    
    if (lowerInput.includes('mechanism') || lowerInput.includes('sn2')) {
      setSessionXP(prev => prev + 15);
      return {
        message: `Excellent! You're thinking about the mechanism. Let me guide you: 📚

**SN2 Mechanism Overview**:
1. The nucleophile approaches from the backside (opposite to the leaving group)
2. Bond formation and bond breaking occur simultaneously
3. This results in inversion of configuration

🎯 **What to include in your answer**:
- Draw or describe the transition state
- Mention the stereochemical outcome
- Discuss factors like nucleophile strength, substrate structure, and solvent effects

*+15 XP for demonstrating conceptual understanding!*

Would you like to write your complete answer now? I'll provide detailed feedback!`,
        type: 'explanation' as const
      };
    }

    return {
      message: `I understand you're working on this question. Let me help you approach it systematically: 🎯

**Question Analysis**: This question asks you to explain the SN2 mechanism and discuss factors affecting the reaction rate.

📝 **Suggested Structure**:
1. Define what SN2 means
2. Describe the mechanism step-by-step
3. Provide examples with structures
4. Discuss factors (nucleophile, substrate, leaving group, solvent)

*+5 XP for active participation!*

Would you like me to provide hints for any specific part, or are you ready to attempt your full answer?`,
      type: 'explanation' as const
    };
  };

  const handleSubmitAnswer = () => {
    if (!studentAnswer.trim()) return;

    // Calculate XP based on answer quality (mock calculation)
    const answerXP = Math.floor(Math.random() * 30) + 20; // 20-50 XP
    setSessionXP(prev => prev + answerXP);

    // Simulate AI grading
    const mockGrading: AIGrading = {
      totalMarks: 7,
      maxMarks: 10,
      percentage: 70,
      grade: 'B',
      feedback: `Good attempt! You've demonstrated a solid understanding of the SN2 mechanism. Your explanation of the backside attack and inversion of stereochemistry is correct.`,
      strengths: [
        'Correctly identified the concerted nature of SN2 reactions',
        'Mentioned stereochemical inversion',
        'Provided relevant examples'
      ],
      improvements: [
        'Could elaborate more on the factors affecting reaction rate',
        'Missing discussion of solvent effects',
        'Transition state description could be more detailed'
      ],
      detailedBreakdown: [
        { criterion: 'Mechanism explanation', marksAwarded: 3, maxMarks: 4, feedback: 'Good explanation but could be more detailed about the transition state' },
        { criterion: 'Examples provided', marksAwarded: 2, maxMarks: 3, feedback: 'Examples are correct but structures would enhance the answer' },
        { criterion: 'Factors discussion', marksAwarded: 2, maxMarks: 3, feedback: 'Mentioned some factors but missed solvent effects and detailed rate discussion' }
      ],
      suggestedResources: [
        'Review transition state theory',
        'Practice drawing SN2 mechanisms',
        'Study solvent effects on nucleophilic substitution'
      ]
    };

    setAiGrading(mockGrading);
    setShowGrading(true);
  };

  if (!paper) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Paper not found</h2>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">
            ← Back to papers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to={`/paper/${paperId}`}
          className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to paper</span>
        </Link>
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-bold">AI Tutor Session</h1>
                <p className="text-indigo-100">{paper.title} - Question {questionId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="font-bold">+{sessionXP} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-96">
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                <span>AI Learning Assistant</span>
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.sender === 'student'
                        ? 'bg-indigo-600 text-white'
                        : message.type === 'hint'
                        ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                        : message.type === 'explanation'
                        ? 'bg-violet-50 border border-violet-200 text-violet-800'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {message.sender === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2">
                          {message.type === 'hint' && <Lightbulb className="h-4 w-4" />}
                          {message.type === 'explanation' && <BookOpen className="h-4 w-4" />}
                          {message.type === 'text' && <Brain className="h-4 w-4" />}
                          <span className="text-xs font-medium">AI Tutor</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap text-sm">{message.message}</div>
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
                  <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span className="text-xs font-medium">AI Tutor is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask for help, hints, or explanations..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Submission */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Your Answer</span>
            </h3>
            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Write your complete answer here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!studentAnswer.trim()}
              className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Submit for AI Grading</span>
            </button>
          </div>

          {/* AI Grading Results */}
          {showGrading && aiGrading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>AI Grading Results</span>
                </h3>
                <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">+35 XP</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    {aiGrading.totalMarks}/{aiGrading.maxMarks}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    aiGrading.percentage >= 80 ? 'bg-green-100 text-green-800' :
                    aiGrading.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Grade: {aiGrading.grade} ({aiGrading.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${aiGrading.percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Overall Feedback</h4>
                  <p className="text-sm text-gray-600">{aiGrading.feedback}</p>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-2 flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Strengths</span>
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {aiGrading.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-orange-800 mb-2 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>Areas for Improvement</span>
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {aiGrading.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITutor;