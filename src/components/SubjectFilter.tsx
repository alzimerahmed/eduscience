import React from 'react';
import { subjects } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import * as Icons from 'lucide-react';

interface SubjectFilterProps {
  selectedSubjects: string[];
  onSubjectToggle: (subject: string) => void;
}

const SubjectFilter: React.FC<SubjectFilterProps> = ({ selectedSubjects, onSubjectToggle }) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter by Subject</h3>
      <div className="space-y-2">
        {subjects.map((subject) => {
          const IconComponent = Icons[subject.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
          const isSelected = selectedSubjects.includes(subject.name);
          
          return (
            <button
              key={subject.id}
              onClick={() => onSubjectToggle(subject.name)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${subject.color} bg-opacity-10 dark:bg-opacity-20`}>
                  <IconComponent className={`h-4 w-4 text-${subject.color.split('-')[1]}-600 dark:text-${subject.color.split('-')[1]}-400`} />
                </div>
                <span className="font-medium">{t(`subject.${subject.name.toLowerCase()}`)}</span>
              </div>
              <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                {subject.paperCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectFilter;