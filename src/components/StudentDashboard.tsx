import React, { useState } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Brain, BookOpen, Award, Calendar, Zap, Trophy, Star, CheckCircle, Users, Globe, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import AdvancedAnalytics from './AdvancedAnalytics';
import BlockchainIntegration from './BlockchainIntegration';
import RealTimeCollaboration from './RealTimeCollaboration';
import AdvancedChatbot from './AdvancedChatbot';

const StudentDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'analytics' | 'blockchain' | 'collaboration' | 'chatbot'>('overview');

  // Mock user data - in real app this would come from context/state
  const userStats = {
    level: 12,
    currentXP: 2847,
    xpToNextLevel: 3000,
    totalQuestions: 145,
    averageScore: 78,
    timeSpent: 42.5,
    streak: 7,
    completedPapers: 23,
    aiSessions: 67,
    achievements: 8,
    blockchainScore: 94.7,
    collaborationHours: 15.3,
    aiInteractions: 234
  };

  const xpProgress = ((userStats.currentXP % 250) / 250) * 100;

  const recentActivity = [
    { 
      id: 1, 
      type: 'paper', 
      title: 'Organic Chemistry - Reaction Mechanisms', 
      score: 85, 
      xpGained: 45,
      date: '2024-01-20',
      subject: 'Chemistry'
    },
    { 
      id: 2, 
      type: 'tutor', 
      title: 'AI Tutoring: Quantum Mechanics', 
      xpGained: 25,
      date: '2024-01-19',
      subject: 'Physics'
    },
    { 
      id: 3, 
      type: 'collaboration', 
      title: 'Study Group: Cell Biology', 
      xpGained: 35,
      date: '2024-01-18',
      subject: 'Biology'
    },
    { 
      id: 4, 
      type: 'blockchain', 
      title: 'NFT Certificate Minted: Chemistry Mastery', 
      xpGained: 100,
      date: '2024-01-17',
      subject: 'Achievement'
    }
  ];

  const subjectProgress = [
    { subject: 'Chemistry', completed: 12, total: 15, level: 8, xp: 1240 },
    { subject: 'Physics', completed: 8, total: 12, level: 6, xp: 890 },
    { subject: 'Biology', completed: 10, total: 14, level: 7, xp: 1050 }
  ];

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Complete your first paper', unlocked: true, xp: 50 },
    { id: 2, title: 'Chemistry Novice', description: 'Complete 5 Chemistry papers', unlocked: true, xp: 100 },
    { id: 3, title: 'Perfect Score', description: 'Get 100% on any paper', unlocked: true, xp: 150 },
    { id: 4, title: 'Study Streak', description: 'Study for 7 consecutive days', unlocked: true, xp: 200 },
    { id: 5, title: 'AI Collaborator', description: 'Complete 10 AI tutoring sessions', unlocked: false, xp: 250 },
    { id: 6, title: 'Blockchain Pioneer', description: 'Mint your first NFT certificate', unlocked: true, xp: 300 },
    { id: 7, title: 'Team Player', description: 'Participate in 5 collaboration sessions', unlocked: false, xp: 350 },
    { id: 8, title: 'Subject Master', description: 'Reach level 10 in any subject', unlocked: false, xp: 500 }
  ];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'analytics', label: 'Advanced Analytics', icon: Cpu },
    { key: 'blockchain', label: 'Blockchain', icon: Award },
    { key: 'collaboration', label: 'Collaboration', icon: Users },
    { key: 'chatbot', label: 'AI Assistant', icon: Brain }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Advanced Learning Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">AI-powered insights, blockchain credentials, and collaborative learning</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Level {userStats.level}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{userStats.currentXP} / {userStats.xpToNextLevel} XP</div>
          </div>
        </div>

        {/* Enhanced XP Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Experience Points</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {userStats.xpToNextLevel - userStats.currentXP} XP to Level {userStats.level + 1}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-3 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              selectedTab === key
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-8">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Questions</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.totalQuestions}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Avg Score</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.averageScore}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Hours</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.timeSpent}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Streak</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.streak} days</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Papers</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.completedPapers}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-lg">
                  <Trophy className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Achievements</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.achievements}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subject Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Subject Mastery</span>
              </h3>
              
              <div className="space-y-6">
                {subjectProgress.map((subject, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900 dark:text-white">{subject.subject}</span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs font-medium">
                          Level {subject.level}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {subject.completed}/{subject.total} papers
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(subject.completed / subject.total) * 100}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className={`h-2 rounded-full ${
                            subject.subject === 'Chemistry' ? 'bg-green-500' :
                            subject.subject === 'Physics' ? 'bg-blue-500' :
                            'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {subject.xp} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Activity</span>
              </h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'paper' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                      activity.type === 'tutor' ? 'bg-violet-100 dark:bg-violet-900/30' :
                      activity.type === 'collaboration' ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      {activity.type === 'paper' ? (
                        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : activity.type === 'tutor' ? (
                        <Brain className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      ) : activity.type === 'collaboration' ? (
                        <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">{activity.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{activity.date}</span>
                        <span>•</span>
                        <span>{activity.subject}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activity.score && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.score >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          activity.score >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {activity.score}%
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                        <Zap className="h-3 w-3" />
                        <span>+{activity.xpGained}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Achievements</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      achievement.unlocked ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      {achievement.unlocked ? (
                        <CheckCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <Trophy className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        achievement.unlocked ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {achievement.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${
                          achievement.unlocked ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          +{achievement.xp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm ${
                    achievement.unlocked ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {selectedTab === 'analytics' && <AdvancedAnalytics />}
      {selectedTab === 'blockchain' && <BlockchainIntegration />}
      {selectedTab === 'collaboration' && <RealTimeCollaboration paperId="demo-paper" />}
      {selectedTab === 'chatbot' && <AdvancedChatbot />}
    </div>
  );
};

export default StudentDashboard;