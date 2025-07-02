import React, { useState } from 'react';
import { BookOpen, Play, CheckCircle, ArrowRight, Search, Upload, Brain, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

const UserGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { t } = useLanguage();

  const sections = [
    {
      id: 'getting-started',
      title: t('guide.gettingStarted.title'),
      icon: Play,
      steps: [
        {
          id: 'register',
          title: t('guide.gettingStarted.register.title'),
          description: t('guide.gettingStarted.register.description'),
          video: '/videos/register.mp4',
          duration: '2 min'
        },
        {
          id: 'browse-papers',
          title: t('guide.gettingStarted.browse.title'),
          description: t('guide.gettingStarted.browse.description'),
          video: '/videos/browse.mp4',
          duration: '3 min'
        },
        {
          id: 'start-exam',
          title: t('guide.gettingStarted.exam.title'),
          description: t('guide.gettingStarted.exam.description'),
          video: '/videos/exam.mp4',
          duration: '5 min'
        }
      ]
    },
    {
      id: 'ai-features',
      title: t('guide.aiFeatures.title'),
      icon: Brain,
      steps: [
        {
          id: 'ai-tutor',
          title: t('guide.aiFeatures.tutor.title'),
          description: t('guide.aiFeatures.tutor.description'),
          video: '/videos/ai-tutor.mp4',
          duration: '4 min'
        },
        {
          id: 'tamil-support',
          title: t('guide.aiFeatures.tamil.title'),
          description: t('guide.aiFeatures.tamil.description'),
          video: '/videos/tamil-ai.mp4',
          duration: '3 min'
        },
        {
          id: 'voice-navigation',
          title: t('guide.aiFeatures.voice.title'),
          description: t('guide.aiFeatures.voice.description'),
          video: '/videos/voice.mp4',
          duration: '2 min'
        }
      ]
    },
    {
      id: 'uploading',
      title: t('guide.uploading.title'),
      icon: Upload,
      steps: [
        {
          id: 'upload-papers',
          title: t('guide.uploading.papers.title'),
          description: t('guide.uploading.papers.description'),
          video: '/videos/upload.mp4',
          duration: '4 min'
        },
        {
          id: 'tamil-content',
          title: t('guide.uploading.tamil.title'),
          description: t('guide.uploading.tamil.description'),
          video: '/videos/tamil-upload.mp4',
          duration: '3 min'
        },
        {
          id: 'admin-approval',
          title: t('guide.uploading.approval.title'),
          description: t('guide.uploading.approval.description'),
          video: '/videos/approval.mp4',
          duration: '2 min'
        }
      ]
    },
    {
      id: 'advanced',
      title: t('guide.advanced.title'),
      icon: Settings,
      steps: [
        {
          id: 'exam-settings',
          title: t('guide.advanced.examSettings.title'),
          description: t('guide.advanced.examSettings.description'),
          video: '/videos/exam-settings.mp4',
          duration: '5 min'
        },
        {
          id: 'analytics',
          title: t('guide.advanced.analytics.title'),
          description: t('guide.advanced.analytics.description'),
          video: '/videos/analytics.mp4',
          duration: '4 min'
        },
        {
          id: 'collaboration',
          title: t('guide.advanced.collaboration.title'),
          description: t('guide.advanced.collaboration.description'),
          video: '/videos/collaboration.mp4',
          duration: '6 min'
        }
      ]
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const getProgressPercentage = () => {
    const totalSteps = sections.reduce((acc, section) => acc + section.steps.length, 0);
    return (completedSteps.length / totalSteps) * 100;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('guide.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('guide.subtitle')}
        </p>
        
        {/* Progress Bar */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {completedSteps.length} of {sections.reduce((acc, s) => acc + s.steps.length, 0)} steps completed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('guide.sections')}
            </h2>
            <nav className="space-y-2">
              {sections.map((section) => {
                const IconComponent = section.icon;
                const completedInSection = section.steps.filter(step => 
                  completedSteps.includes(step.id)
                ).length;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <div className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                      {completedInSection}/{section.steps.length}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {currentSection && (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <currentSection.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentSection.title}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {currentSection.steps.map((step, index) => {
                      const isCompleted = completedSteps.includes(step.id);
                      
                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`border-2 rounded-xl p-6 transition-all ${
                            isCompleted
                              ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                  {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                  {step.description}
                                </p>
                                
                                {/* Video Placeholder */}
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center mb-4">
                                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Video Tutorial ({step.duration})
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Duration: {step.duration}
                            </span>
                            
                            {!isCompleted && (
                              <button
                                onClick={() => markStepComplete(step.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <span>Mark Complete</span>
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Search */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {t('guide.search.title')}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { question: t('guide.search.q1'), answer: t('guide.search.a1') },
            { question: t('guide.search.q2'), answer: t('guide.search.a2') },
            { question: t('guide.search.q3'), answer: t('guide.search.a3') }
          ].map((faq, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {faq.question}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserGuide;