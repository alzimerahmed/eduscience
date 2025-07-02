import React from 'react';
import { Filter, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FilterBarProps {
  selectedSubjects: string[];
  selectedDifficulty: string[];
  selectedExamType: string[];
  onDifficultyToggle: (difficulty: string) => void;
  onExamTypeToggle: (examType: string) => void;
  onClearFilters: () => void;
  totalResults: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedSubjects,
  selectedDifficulty,
  selectedExamType,
  onDifficultyToggle,
  onExamTypeToggle,
  onClearFilters,
  totalResults
}) => {
  const { t } = useLanguage();
  
  const difficulties = ['easy', 'medium', 'hard'];
  const examTypes = [
    '1st-year-1st-term', '1st-year-2nd-term', '1st-year-3rd-term',
    '2nd-year-1st-term', '2nd-year-2nd-term', '2nd-year-3rd-term',
    'practical', 'past-paper', 'model-paper'
  ];
  
  const hasActiveFilters = selectedSubjects.length > 0 || selectedDifficulty.length > 0 || selectedExamType.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('filter.title')}</h3>
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
            {totalResults} {totalResults === 1 ? t('filter.result') : t('filter.results')}
          </span>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
            <span>{t('filter.clearAll')}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('filter.difficulty')}</h4>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => onDifficultyToggle(difficulty)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  selectedDifficulty.includes(difficulty)
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {t(`difficulty.${difficulty}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('filter.paperType')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {examTypes.map((examType) => (
              <button
                key={examType}
                onClick={() => onExamTypeToggle(examType)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border text-center ${
                  selectedExamType.includes(examType)
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {t(`examType.${examType}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;