import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Filter, Calendar, ChevronRight, Download, Printer, Clock, BookOpen, FileText, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import SubjectFilter from '../components/SubjectFilter';
import FilterBar from '../components/FilterBar';
import { pastPapers } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';

const StudyResourcesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<'papers' | 'questions' | 'notes'>('papers');
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle filter changes
  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulty(prev => 
      prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]
    );
  };

  const handleExamTypeToggle = (examType: string) => {
    setSelectedExamType(prev => 
      prev.includes(examType) ? prev.filter(e => e !== examType) : [...prev, examType]
    );
  };

  const handleClearFilters = () => {
    setSelectedSubjects([]);
    setSelectedDifficulty([]);
    setSelectedExamType([]);
    setSearchTerm('');
  };

  // Filter papers based on selected filters
  const filteredPapers = pastPapers.filter(paper => {
    const matchesSearch = searchTerm === '' || 
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(paper.subject);
    const matchesDifficulty = selectedDifficulty.length === 0 || selectedDifficulty.includes(paper.difficulty);
    const matchesExamType = selectedExamType.length === 0 || selectedExamType.includes(paper.examType);
    
    return matchesSearch && matchesSubject && matchesDifficulty && matchesExamType;
  });

  // Group papers by year (for past papers category)
  const papersByYear = filteredPapers.reduce((acc, paper) => {
    acc[paper.year] = [...(acc[paper.year] || []), paper];
    return acc;
  }, {} as Record<number, typeof pastPapers>);

  // Get years sorted in descending order
  const sortedYears = Object.keys(papersByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const categories = [
    { id: 'papers', label: 'Past Papers', icon: BookOpen },
    { id: 'questions', label: 'Model Questions', icon: FileText },
    { id: 'notes', label: 'Study Notes', icon: BrainCircuit }
  ];

  // Render breadcrumb path based on current location
  const renderBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900 dark:text-white">Study Resources</span>
        {currentCategory && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {categories.find(c => c.id === currentCategory)?.label}
            </span>
          </>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-16 h-16 border-4 border-[#E68A49] border-t-[#8494FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      {renderBreadcrumbs()}

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Study Resources</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore past papers, model questions, and study notes for science subjects
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search papers, questions, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setCurrentCategory(category.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                currentCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <CategoryIcon className="h-5 w-5" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <SubjectFilter 
            selectedSubjects={selectedSubjects} 
            onSubjectToggle={handleSubjectToggle} 
          />
          
          <FilterBar
            selectedSubjects={selectedSubjects}
            selectedDifficulty={selectedDifficulty}
            selectedExamType={selectedExamType}
            onDifficultyToggle={handleDifficultyToggle}
            onExamTypeToggle={handleExamTypeToggle}
            onClearFilters={handleClearFilters}
            totalResults={filteredPapers.length}
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {currentCategory === 'papers' && (
            <div className="space-y-8">
              {sortedYears.map(year => (
                <div key={year} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{year}</h2>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                      {papersByYear[year].length} papers
                    </span>
                  </div>

                  <div className="space-y-4">
                    {papersByYear[year].map(paper => (
                      <motion.div
                        key={paper.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                              {paper.title}
                            </h3>
                            <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 space-x-3 mb-2">
                              <span>{paper.subject}</span>
                              <span>•</span>
                              <span className="capitalize">{paper.examType.replace(/-/g, ' ')}</span>
                              <span>•</span>
                              <span className="capitalize">{paper.difficulty}</span>
                              <span>•</span>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{new Date(paper.dateAdded).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {paper.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentCategory === 'questions' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Model Question Bank
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Our model question bank is being updated with the latest content. Check back soon!
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Get Notified
                </button>
              </div>
            </div>
          )}

          {currentCategory === 'notes' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center py-12">
                <BrainCircuit className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Study Notes Repository
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Our curated study notes will be available soon. We're working with top educators to bring you quality content.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Subscribe for Updates
                </button>
              </div>
            </div>
          )}

          {/* "No Results" state */}
          {currentCategory === 'papers' && filteredPapers.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No matching resources found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
              <button 
                onClick={handleClearFilters} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyResourcesPage;