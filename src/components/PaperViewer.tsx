import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Brain, CheckCircle, Clock, Target, BookOpen } from 'lucide-react';
import { pastPapers } from '../data/mockData';
import { Question } from '../types';

const PaperViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const paper = pastPapers.find(p => p.id === id);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

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

  // Mock questions for demonstration
  const mockQuestions: Question[] = [
    {
      id: '1',
      paperId: paper.id,
      questionNumber: 1,
      questionText: 'Explain the mechanism of SN2 reaction with suitable examples. Discuss the factors affecting the rate of SN2 reactions.',
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
      questionText: 'Calculate the pH of a 0.1 M solution of acetic acid (Ka = 1.8 × 10⁻⁵)',
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
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to papers</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{paper.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <span>{paper.subject}</span>
            <span>•</span>
            <span>{paper.year}</span>
            <span>•</span>
            <span>{paper.examType.charAt(0).toUpperCase() + paper.examType.slice(1)}</span>
            <span>•</span>
            <span>{paper.difficulty.charAt(0).toUpperCase() + paper.difficulty.slice(1)}</span>
          </div>
          
          {paper.hasAITutor && (
            <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-violet-600" />
                <div>
                  <h3 className="font-semibold text-violet-900">AI Tutor Available</h3>
                  <p className="text-sm text-violet-700">Get personalized help and instant feedback on your answers</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions</h2>
            <div className="space-y-3">
              {mockQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => setSelectedQuestion(question)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedQuestion?.id === question.id
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      Question {question.questionNumber}
                    </span>
                    <span className="text-sm text-gray-500">{question.marks} marks</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {question.questionText}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{question.topic}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Details */}
        <div className="lg:col-span-2">
          {selectedQuestion ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Question {selectedQuestion.questionNumber}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {selectedQuestion.marks} marks
                  </span>
                  <Link
                    to={`/tutor/${paper.id}/${selectedQuestion.id}`}
                    className="bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm font-medium"
                  >
                    <Brain className="h-4 w-4" />
                    <span>AI Tutor</span>
                  </Link>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-800 leading-relaxed">{selectedQuestion.questionText}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Topic</span>
                  </h4>
                  <p className="text-sm text-gray-600">{selectedQuestion.topic}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Question Type</span>
                  </h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedQuestion.questionType.replace('-', ' ')}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Marking Scheme</h4>
                <div className="space-y-2">
                  {selectedQuestion.markingScheme.map((criteria, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">{criteria.criterion}</p>
                        <p className="text-xs text-blue-600">{criteria.description}</p>
                      </div>
                      <span className="text-sm font-medium text-blue-800 ml-2">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Question</h3>
              <p className="text-gray-600">Choose a question from the list to view details and start learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperViewer;