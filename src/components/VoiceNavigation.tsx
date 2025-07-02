import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Voice recognition hook
const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setTranscript('');
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: !!recognition
  };
};

// Text-to-speech hook
const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Stop any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // Find appropriate voice
      const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices[0];
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return {
    speak,
    stop,
    isSpeaking,
    isSupported: 'speechSynthesis' in window
  };
};

interface VoiceNavigationProps {
  onCommand?: (command: string) => void;
}

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({ onCommand }) => {
  const navigate = useNavigate();
  const { isListening, transcript, startListening, stopListening, isSupported: voiceSupported } = useVoiceRecognition();
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();
  const [lastCommand, setLastCommand] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  // Voice command processing
  useEffect(() => {
    if (transcript) {
      processVoiceCommand(transcript.toLowerCase());
      setLastCommand(transcript);
      setShowTranscript(true);
      setTimeout(() => setShowTranscript(false), 3000);
    }
  }, [transcript]);

  const processVoiceCommand = (command: string) => {
    console.log('Processing command:', command);
    
    // Navigation commands
    if (command.includes('go to dashboard') || command.includes('show dashboard')) {
      navigate('/dashboard');
      speak('Navigating to dashboard');
    } else if (command.includes('go home') || command.includes('show papers')) {
      navigate('/');
      speak('Going to home page');
    } else if (command.includes('chemistry papers') || command.includes('show chemistry')) {
      navigate('/');
      speak('Showing chemistry papers');
      onCommand?.('filter:chemistry');
    } else if (command.includes('physics papers') || command.includes('show physics')) {
      navigate('/');
      speak('Showing physics papers');
      onCommand?.('filter:physics');
    } else if (command.includes('biology papers') || command.includes('show biology')) {
      navigate('/');
      speak('Showing biology papers');
      onCommand?.('filter:biology');
    } else if (command.includes('search for')) {
      const searchTerm = command.replace('search for', '').trim();
      speak(`Searching for ${searchTerm}`);
      onCommand?.(`search:${searchTerm}`);
    } else if (command.includes('help') || command.includes('what can you do')) {
      const helpText = `I can help you navigate the app. Try saying: Go to dashboard, Show chemistry papers, Search for organic chemistry, or Help me with this question.`;
      speak(helpText);
    } else if (command.includes('stop talking') || command.includes('be quiet')) {
      stop();
    } else {
      // Generic acknowledgment for unrecognized commands
      speak('I heard you, but I\'m not sure how to help with that. Try saying Help to learn what I can do.');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak('Voice assistant is ready. Try saying: Go to dashboard, Show chemistry papers, or Help.');
    }
  };

  if (!voiceSupported && !ttsSupported) {
    return null; // Don't render if no voice support
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Voice Command Transcript */}
      <AnimatePresence>
        {showTranscript && lastCommand && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 max-w-xs"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Mic className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">You said:</span>
            </div>
            <p className="text-sm text-gray-900 dark:text-white">{lastCommand}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Controls */}
      <div className="flex flex-col space-y-3">
        {/* Text-to-Speech Toggle */}
        {ttsSupported && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSpeaking}
            className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
              isSpeaking
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}
            title={isSpeaking ? 'Stop speaking' : 'Test voice assistant'}
          >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </motion.button>
        )}

        {/* Voice Recognition Toggle */}
        {voiceSupported && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            className={`p-4 rounded-full shadow-lg transition-all duration-200 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice commands'}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </motion.button>
        )}
      </div>

      {/* Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
          >
            🎤 Listening...
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceNavigation;