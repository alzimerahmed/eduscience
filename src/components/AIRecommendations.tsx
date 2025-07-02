import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, BookOpen, Zap, Star, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PastPaper } from '../types';
import { pastPapers } from '../data/mockData';

// Simple ML-like recommendation engine
class RecommendationEngine {
  private userHistory: string[] = [];
  private subjectWeights: { [key: string]: number } = {};
  private difficultyWeights: { [key: string]: number } = {};
  private topicWeights: { [key: string]: number } = {};

  constructor() {
    this.loadUserData();
  }

  private loadUserData() {
    const saved = localStorage.getItem('userLearningHistory');
    if (saved) {
      const data = JSON.parse(saved);
      this.userHistory = data.history || [];
      this.subjectWeights = data.subjectWeights || {};
      this.difficultyWeights = data.difficultyWeights || {};
      this.topicWeights = data.topicWeights || {};
    }
  }

  private saveUserData() {
    localStorage.setItem('userLearningHistory', JSON.stringify({
      history: this.userHistory,
      subjectWeights: this.subjectWeights,
      difficultyWeights: this.difficultyWeights,
      topicWeights: this.topicWeights
    }));
  }

  addInteraction(paperId: string, interactionType: 'view' | 'complete' | 'favorite' | 'download') {
    const paper = pastPapers.find(p => p.id === paperId);
    if (!paper) return;

    this.userHistory.push(`${paperId}:${interactionType}`);
    
    // Update weights based on interaction
    const weight = interactionType === 'complete' ? 3 : 
                  interactionType === 'favorite' ? 2 : 
                  interactionType === 'download' ? 1.5 : 1;

    this.subjectWeights[paper.subject] = (this.subjectWeights[paper.subject] || 0) + weight;
    this.difficultyWeights[paper.difficulty] = (this.difficultyWeights[paper.difficulty] || 0) + weight;
    
    paper.tags.forEach(tag => {
      this.topicWeights[tag] = (this.topicWeights[tag] || 0) + weight * 0.5;
    });

    this.saveUserData();
  }

  getRecommendations(count: number = 5): PastPaper[] {
    const scores = pastPapers.map(paper => ({
      paper,
      score: this.calculateScore(paper)
    }));

    // Filter out papers user has already interacted with significantly
    const viewedPapers = this.userHistory
      .filter(h => h.includes(':complete') || h.includes(':favorite'))
      .map(h => h.split(':')[0]);

    const filtered = scores.filter(s => !viewedPapers.includes(s.paper.id));
    
    return filtered
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(s => s.paper);
  }

  private calculateScore(paper: PastPaper): number {
    let score = 0;

    // Subject preference
    score += (this.subjectWeights[paper.subject] || 0) * 0.4;

    // Difficulty progression (prefer slightly harder than current level)
    const userDifficultyLevel = this.getCurrentDifficultyLevel();
    if (paper.difficulty === userDifficultyLevel) {
      score += 2;
    } else if (this.isNextDifficultyLevel(paper.difficulty, userDifficultyLevel)) {
      score += 3; // Prefer next level up
    }

    // Topic relevance
    paper.tags.forEach(tag => {
      score += (this.topicWeights[tag] || 0) * 0.2;
    });

    // Popularity boost
    score += Math.log(paper.downloadCount) * 0.1;

    // Recency boost for newer papers
    const paperYear = paper.year;
    const currentYear = new Date().getFullYear();
    score += (paperYear - currentYear + 5) * 0.1;

    // AI tutor availability boost
    if (paper.hasAITutor) score += 1;

    return score;
  }

  private getCurrentDifficultyLevel(): string {
    const recentInteractions = this.userHistory.slice(-10);
    const difficulties = recentInteractions
      .map(h => pastPapers.find(p => p.id === h.split(':')[0])?.difficulty)
      .filter(Boolean);

    if (difficulties.length === 0) return 'easy';

    const counts = difficulties.reduce((acc, diff) => {
      acc[diff!] = (acc[diff!] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0][0];
  }

  private isNextDifficultyLevel(paperDiff: string, userDiff: string): boolean {
    const levels = ['easy', 'medium', 'hard'];
    const userIndex = levels.indexOf(userDiff);
    const paperIndex = levels.indexOf(paperDiff);
    return paperIndex === userIndex + 1;
  }

  getPersonalizedInsights(): {
    favoriteSubject: string;
    strongestTopic: string;
    recommendedDifficulty: string;
    learningStreak: number;
  } {
    const favoriteSubject = Object.entries(this.subjectWeights)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Chemistry';

    const strongestTopic = Object.entries(this.topicWeights)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'basic-concepts';

    const recommendedDifficulty = this.getCurrentDifficultyLevel();
    
    const learningStreak = this.calculateLearningStreak();

    return {
      favoriteSubject,
      strongestTopic,
      recommendedDifficulty,
      learningStreak
    };
  }

  private calculateLearningStreak(): number {
    // Simple streak calculation based on recent activity
    const recentDays = 7;
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < recentDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if user had any activity on this date (simplified)
      const hasActivity = this.userHistory.some(h => h.includes('complete'));
      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

const recommendationEngine = new RecommendationEngine();

interface AIRecommendationsProps {
  className?: string;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ className = '' }) => {
  const [recommendations, setRecommendations] = useState<PastPaper[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate AI processing time
    const timer = setTimeout(() => {
      const recs = recommendationEngine.getRecommendations(4);
      const userInsights = recommendationEngine.getPersonalizedInsights();
      
      setRecommendations(recs);
      setInsights(userInsights);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Simulate user interaction for demo
  useEffect(() => {
    // Add some sample interactions for demo
    if (recommendations.length === 0) {
      recommendationEngine.addInteraction('1', 'complete');
      recommendationEngine.addInteraction('9', 'favorite');
      recommendationEngine.addInteraction('17', 'view');
    }
  }, []);

  const handlePaperInteraction = (paperId: string, type: 'view' | 'favorite') => {
    recommendationEngine.addInteraction(paperId, type);
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-2 rounded-lg">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing your learning patterns...</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered Recommendations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Personalized based on your learning journey</p>
          </div>
        </div>

        {/* Insights */}
        {insights && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{insights.favoriteSubject}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Favorite Subject</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 capitalize">{insights.recommendedDifficulty}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Your Level</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{insights.learningStreak}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {insights.strongestTopic.replace('-', ' ')}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Strong Topic</div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Recommended for You</span>
          </h4>
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Zap className="h-3 w-3" />
            <span>ML-Powered</span>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {recommendations.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {paper.title}
                    </h5>
                    {paper.hasAITutor && (
                      <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded text-xs font-medium">
                        AI Tutor
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                    <span>{paper.subject}</span>
                    <span>•</span>
                    <span className="capitalize">{paper.difficulty}</span>
                    <span>•</span>
                    <span>{paper.downloadCount.toLocaleString()} downloads</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePaperInteraction(paper.id, 'favorite')}
                    className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Star className="h-3 w-3" />
                  </button>
                  
                  <Link
                    to={`/paper/${paper.id}`}
                    onClick={() => handlePaperInteraction(paper.id, 'view')}
                    className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                  >
                    <BookOpen className="h-3 w-3" />
                    <span>Study</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start studying to get personalized recommendations!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIRecommendations;

// Export the recommendation engine for use in other components
export { recommendationEngine };