import React, { useState, useEffect } from 'react';
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExamTimerProps {
  timeLimit: number; // in minutes
  onTimeUp: () => void;
  allowPause: boolean;
  showTimer: boolean;
  autoSubmit: boolean;
}

const ExamTimer: React.FC<ExamTimerProps> = ({
  timeLimit,
  onTimeUp,
  allowPause,
  showTimer,
  autoSubmit
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // convert to seconds
  const [isPaused, setIsPaused] = useState(false);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0) {
      if (autoSubmit) {
        onTimeUp();
      }
      return;
    }

    // Warning when 10% time remaining
    if (timeRemaining <= (timeLimit * 60 * 0.1)) {
      setIsWarning(true);
    }

    if (!isPaused) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (autoSubmit) {
              onTimeUp();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isPaused, timeLimit, autoSubmit, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((timeLimit * 60 - timeRemaining) / (timeLimit * 60)) * 100;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 0) return 'text-red-600 dark:text-red-400';
    if (isWarning) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-900 dark:text-white';
  };

  const getProgressColor = () => {
    if (timeRemaining <= 0) return 'bg-red-500';
    if (isWarning) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  if (!showTimer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 p-4 min-w-[200px] ${
        isWarning ? 'border-orange-300 dark:border-orange-600' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className={`h-5 w-5 ${getTimeColor()}`} />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Time Remaining
          </span>
        </div>
        
        {allowPause && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isPaused ? (
              <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <Pause className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
          </button>
        )}
      </div>

      <div className={`text-2xl font-bold mb-3 ${getTimeColor()}`}>
        {formatTime(timeRemaining)}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${getProgressPercentage()}%` }}
          className={`h-2 rounded-full transition-colors ${getProgressColor()}`}
        />
      </div>

      {/* Status Messages */}
      {isPaused && (
        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
          <Pause className="h-4 w-4" />
          <span>Exam Paused</span>
        </div>
      )}

      {isWarning && !isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Time Running Low!</span>
        </motion.div>
      )}

      {timeRemaining <= 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Time's Up!</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ExamTimer;