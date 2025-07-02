import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PastPaper } from '../types';
import PaperCard from './PaperCard';

interface YearSectionProps {
  year: number;
  papers: PastPaper[];
  onToggleFavorite: (paperId: string) => void;
  onDownload: (paperId: string) => void;
}

const YearSection: React.FC<YearSectionProps> = ({ year, papers, onToggleFavorite, onDownload }) => {
  const [isExpanded, setIsExpanded] = useState(year >= 2023);

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 mb-4"
      >
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{year}</h2>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
            {papers.length} paper{papers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {isExpanded ? 'Click to collapse' : 'Click to expand'}
        </div>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onToggleFavorite={onToggleFavorite}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default YearSection;