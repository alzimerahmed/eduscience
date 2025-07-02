import React from 'react';
import { Download, Star, Calendar, FileText, Tag, Brain, BookOpen, Target, Zap, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PastPaper } from '../types';
import { getSubjectByName, subjects } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import * as Icons from 'lucide-react';

interface PaperCardProps {
  paper: PastPaper;
  onToggleFavorite: (paperId: string) => void;
  onDownload: (paperId: string) => void;
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, onToggleFavorite, onDownload }) => {
  const { t } = useLanguage();
  const subject = getSubjectByName(paper.subject);
  
  // Find the icon or fall back to FileText
  const findIcon = () => {
    if (subject && subject.icon) {
      return Icons[subject.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    }
    
    // Try to find it by name
    for (const subj of subjects) {
      if (subj.name.toLowerCase() === paper.subject.toLowerCase()) {
        return Icons[subj.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
      }
    }
    
    return FileText;
  };
  
  const IconComponent = findIcon();
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'hard': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getExamTypeColor = (examType: string) => {
    if (examType.includes('1st-year')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
    if (examType.includes('2nd-year')) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700';
    if (examType === 'practical') return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700';
    if (examType === 'past-paper') return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700';
    if (examType === 'model-paper') return 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-700';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  };

  const getXPReward = (difficulty: string, examType: string) => {
    let baseXP = 20;
    if (difficulty === 'medium') baseXP = 35;
    if (difficulty === 'hard') baseXP = 50;
    if (examType.includes('2nd-year')) baseXP += 15;
    if (examType === 'practical') baseXP += 10;
    return baseXP;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${subject?.color || 'bg-gray-500'} bg-opacity-10 dark:bg-opacity-20 border border-opacity-20 dark:border-opacity-30`}>
              <IconComponent className={`h-6 w-6 text-${subject?.color.split('-')[1] || 'gray'}-600 dark:text-${subject?.color.split('-')[1] || 'gray'}-400`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {paper.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t(`subject.${paper.subject.toLowerCase()}`)}</p>
            </div>
          </div>
          
          <button
            onClick={() => onToggleFavorite(paper.id)}
            className={`p-2 rounded-lg transition-colors ${
              paper.isFavorite
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-yellow-600 dark:hover:text-yellow-400'
            }`}
          >
            <Star className={`h-5 w-5 ${paper.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{paper.year}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>{paper.downloadCount.toLocaleString()}</span>
          </div>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span>{paper.fileSize}</span>
        </div>

        <div className="flex items-center flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(paper.difficulty)}`}>
            {t(`difficulty.${paper.difficulty}`)}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getExamTypeColor(paper.examType)}`}>
            {t(`examType.${paper.examType}`)}
          </span>
          {paper.hasAnswers && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
              ✓ {t('paper.solutions')}
            </span>
          )}
          {paper.hasAnswerScheme && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700">
              ✓ {t('paper.answerScheme')}
            </span>
          )}
        </div>

        {/* XP Reward Display */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{t('paper.reward')}</span>
          </div>
          <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
            +{getXPReward(paper.difficulty, paper.examType)} XP
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {paper.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md border border-gray-200 dark:border-gray-600"
            >
              <Tag className="h-3 w-3" />
              <span>{tag}</span>
            </span>
          ))}
          {paper.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md border border-gray-200 dark:border-gray-600">
              +{paper.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Link
            to={`/paper/${paper.id}`}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
          >
            <BookOpen className="h-4 w-4" />
            <span>{t('paper.startLearning')}</span>
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onDownload(paper.id)}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm font-medium border border-gray-200 dark:border-gray-600"
            >
              <Download className="h-4 w-4" />
              <span>{t('paper.download')}</span>
            </button>
            
            {paper.hasAnswerScheme && (
              <button
                onClick={() => console.log('Download answer scheme for:', paper.id)}
                className="bg-cyan-100 dark:bg-cyan-900/30 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm font-medium border border-cyan-200 dark:border-cyan-700"
              >
                <FileCheck className="h-4 w-4" />
                <span>{t('paper.answerScheme')}</span>
              </button>
            )}
          </div>
          
          {paper.hasAITutor && (
            <Link
              to={`/tutor/${paper.id}/1`}
              className="w-full bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm font-medium border border-violet-200 dark:border-violet-700"
            >
              <Brain className="h-4 w-4" />
              <span>{t('paper.aiTutor')}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperCard;