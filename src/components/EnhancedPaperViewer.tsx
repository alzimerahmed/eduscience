import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Brain, CheckCircle, Clock, Target, BookOpen, Eye, Calculator, TestTube } from 'lucide-react';
import { pastPapers } from '../data/mockData';
import { Question } from '../types';
import MolecularViewer from './MolecularViewer';
import EquationRenderer from './EquationRenderer';
import ARPreview from './ARPreview';
import VoiceNavigation from './VoiceNavigation';

const EnhancedPaperViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const paper = pastPapers.find(p => p.id === id);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'molecular' | 'equations' | 'ar'>('questions');

  if (!paper) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Paper not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            ← Back to papers
          </Link>
        </div>
      </div>
    );
  }

  // Enhanced mock questions with more detailed content
  const mockQuestions: Question[] = [
    {
      id: '1',
      paperId: paper.id,
      questionNumber: 1,
      questionText: 'Explain the mechanism of SN2 reaction with suitable examples. Discuss the factors affecting the rate of SN2 reactions. Include molecular orbital diagrams and 3D representations.',
      questionType: 'essay',
      marks: 10,
      topic: 'Organic Reaction Mechanisms',
      difficulty: 'medium',
      correctAnswer: 'SN2 reaction is a bimolecular nucleophilic substitution reaction...',
      explanation: 'The SN2 mechanism involves a single concerted step where the nucleophile attacks the substrate from the backside...',
      commonMistakes: ['Confusing SN1 and SN2 mechanisms', 'Not mentioning stereochemistry'],
      hints: ['Consider the stereochemistry', 'Think about the transition state'],
      relatedConcepts: ['Nucleophilicity', 'Leaving groups', 'Stereochemistry'],
      markingScheme: [
        { criterion: 'Mechanism explanation', maxMarks: 4, description: 'Clear explanation of the SN2 mechanism' },
        { criterion: 'Examples provided', maxMarks: 3, description: 'Suitable examples with structures' },
        { criterion: 'Factors discussion', maxMarks: 3, description: 'Discussion of factors affecting rate' }
      ]
    },
    {
      id: '2',
      paperId: paper.id,
      questionNumber: 2,
      questionText: 'Calculate the pH of a 0.1 M solution of acetic acid (Ka = 1.8 × 10⁻⁵). Show all mathematical steps and explain the chemical equilibrium involved.',
      questionType: 'calculation',
      marks: 8,
      topic: 'Acid-Base Equilibrium',
      difficulty: 'medium',
      correctAnswer: 'pH = 2.87',
      explanation: 'For a weak acid, use the formula pH = -log√(Ka × C)...',
      commonMistakes: ['Using strong acid formula', 'Calculation errors'],
      hints: ['This is a weak acid', 'Use the Ka expression'],
      relatedConcepts: ['Weak acids', 'pH calculations', 'Equilibrium constants'],
      markingScheme: [
        { criterion: 'Correct formula', maxMarks: 2, description: 'Using appropriate weak acid formula' },
        { criterion: 'Substitution', maxMarks: 3, description: 'Correct substitution of values' },
        { criterion: 'Final answer', maxMarks: 3, description: 'Correct final pH value' }
      ]
    },
    {
      id: '3',
      paperId: paper.id,
      questionNumber: 3,
      questionText: 'Draw the molecular structure of benzene and explain its aromatic properties. Include resonance structures and molecular orbital theory.',
      questionType: 'diagram',
      marks: 12,
      topic: 'Aromatic Chemistry',
      difficulty: 'hard',
      correctAnswer: 'Benzene has a planar hexagonal structure with delocalized π electrons...',
      explanation: 'Benzene exhibits aromaticity due to its cyclic, planar structure with 4n+2 π electrons...',
      commonMistakes: ['Drawing localized double bonds', 'Ignoring planarity'],
      hints: ['Consider electron delocalization', 'Think about Hückel\'s rule'],
      relatedConcepts: ['Aromaticity', 'Resonance', 'Molecular orbitals'],
      markingScheme: [
        { criterion: 'Structure drawing', maxMarks: 4, description: 'Correct benzene structure' },
        { criterion: 'Resonance explanation', maxMarks: 4, description: 'Proper resonance structures' },
        { criterion: 'Aromatic properties', maxMarks: 4, description: 'Explanation of aromaticity' }
      ]
    }
  ];

  const handleVoiceCommand = (command: string) => {
    if (command.startsWith('search:')) {
      // Handle search commands
      console.log('Voice search:', command.replace('search:', ''));
    } else if (command.includes('molecular')) {
      setActiveTab('molecular');
    } else if (command.includes('equation')) {
      setActiveTab('equations');
    } else if (command.includes('ar') || command.includes('augmented reality')) {
      setActiveTab('ar');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to papers</span>
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{paper.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span>{paper.subject}</span>
            <span>•</span>
            <span>{paper.year}</span>
            <span>•</span>
            <span>{paper.examType.charAt(0).toUpperCase() + paper.examType.slice(1)}</span>
            <span>•</span>
            <span>{paper.difficulty.charAt(0).toUpperCase() + paper.difficulty.slice(1)}</span>
          </div>
          
          {/* Enhanced Features Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'questions'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Questions</span>
            </button>
            
            {paper.subject === 'Chemistry' && (
              <button
                onClick={() => setActiveTab('molecular')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'molecular'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <TestTube className="h-4 w-4" />
                <span>3D Molecules</span>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('equations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'equations'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>Live Equations</span>
            </button>
            
            <button
              onClick={() => setActiveTab('ar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'ar'
                  ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>AR Preview</span>
            </button>
          </div>
          
          {paper.hasAITutor && (
            <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-200 dark:border-violet-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                <div>
                  <h3 className="font-semibold text-violet-900 dark:text-violet-100">AI Tutor Available</h3>
                  <p className="text-sm text-violet-700 dark:text-violet-300">Get personalized help and instant feedback on your answers</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'questions' && (
          <>
            {/* Questions List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Questions</h2>
                <div className="space-y-3">
                  {mockQuestions.map((question) => (
                    <button
                      key={question.id}
                      onClick={() => setSelectedQuestion(question)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedQuestion?.id === question.id
                          ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Question {question.questionNumber}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{question.marks} marks</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {question.questionText}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{question.topic}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Details */}
            <div className="lg:col-span-2">
              {selectedQuestion ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Question {selectedQuestion.questionNumber}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm font-medium">
                        {selectedQuestion.marks} marks
                      </span>
                      <Link
                        to={`/tutor/${paper.id}/${selectedQuestion.id}`}
                        className="bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm font-medium"
                      >
                        <Brain className="h-4 w-4" />
                        <span>AI Tutor</span>
                      </Link>
                    </div>
                  </div>

                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{selectedQuestion.questionText}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Topic</span>
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedQuestion.topic}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Question Type</span>
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {selectedQuestion.questionType.replace('-', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Marking Scheme</h4>
                    <div className="space-y-2">
                      {selectedQuestion.markingScheme.map((criteria, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{criteria.criterion}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">{criteria.description}</p>
                          </div>
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200 ml-2">
                            {criteria.maxMarks} marks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      to={`/tutor/${paper.id}/${selectedQuestion.id}`}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                    >
                      <Brain className="h-5 w-5" />
                      <span>Start AI Tutoring Session</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Question</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose a question from the list to view details and start learning</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'molecular' && paper.subject === 'Chemistry' && (
          <div className="lg:col-span-3">
            <MolecularViewer moleculeName="benzene" />
          </div>
        )}

        {activeTab === 'equations' && (
          <div className="lg:col-span-3">
            <EquationRenderer
              equation="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
              title="Quadratic Formula"
              interactive={true}
              steps={[
                {
                  equation: "ax^2 + bx + c = 0",
                  explanation: "Start with the standard quadratic equation"
                },
                {
                  equation: "ax^2 + bx = -c",
                  explanation: "Move the constant term to the right side"
                },
                {
                  equation: "x^2 + \\frac{b}{a}x = -\\frac{c}{a}",
                  explanation: "Divide all terms by coefficient 'a'"
                },
                {
                  equation: "x^2 + \\frac{b}{a}x + \\left(\\frac{b}{2a}\\right)^2 = -\\frac{c}{a} + \\left(\\frac{b}{2a}\\right)^2",
                  explanation: "Complete the square by adding (b/2a)² to both sides"
                },
                {
                  equation: "\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}",
                  explanation: "Simplify the left side and combine terms on the right"
                },
                {
                  equation: "x + \\frac{b}{2a} = \\pm\\frac{\\sqrt{b^2 - 4ac}}{2a}",
                  explanation: "Take the square root of both sides"
                },
                {
                  equation: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
                  explanation: "Solve for x to get the quadratic formula",
                  highlight: true
                }
              ]}
            />
          </div>
        )}

        {activeTab === 'ar' && (
          <div className="lg:col-span-3">
            <ARPreview paperId={paper.id} paperTitle={paper.title} />
          </div>
        )}
      </div>

      {/* Voice Navigation */}
      <VoiceNavigation onCommand={handleVoiceCommand} />
    </div>
  );
};

export default EnhancedPaperViewer;