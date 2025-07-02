export interface PastPaper {
  id: string;
  title: string;
  subject: string;
  year: number;
  examType: '1st-year-1st-term' | '1st-year-2nd-term' | '1st-year-3rd-term' | 
           '2nd-year-1st-term' | '2nd-year-2nd-term' | '2nd-year-3rd-term' |
           'practical' | 'past-paper' | 'model-paper';
  difficulty: 'easy' | 'medium' | 'hard';
  downloadCount: number;
  fileSize: string;
  dateAdded: string;
  tags: string[];
  isFavorite?: boolean;
  filePath?: string;
  hasAnswers: boolean;
  hasAnswerScheme: boolean;
  hasAITutor: boolean;
  questions?: Question[];
}

export interface Question {
  id: string;
  paperId: string;
  questionNumber: number;
  questionText: string;
  questionType: 'multiple-choice' | 'short-answer' | 'essay' | 'calculation' | 'diagram' | 'practical';
  marks: number;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  correctAnswer: string | string[];
  explanation: string;
  commonMistakes: string[];
  hints: string[];
  relatedConcepts: string[];
  markingScheme: MarkingCriteria[];
}

export interface MarkingCriteria {
  criterion: string;
  maxMarks: number;
  description: string;
}

export interface StudentResponse {
  id: string;
  questionId: string;
  studentId: string;
  response: string;
  submittedAt: string;
  aiGrading?: AIGrading;
}

export interface AIGrading {
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  detailedBreakdown: GradingBreakdown[];
  suggestedResources: string[];
}

export interface GradingBreakdown {
  criterion: string;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  paperCount: number;
}

export interface TutorSession {
  id: string;
  paperId: string;
  questionId: string;
  studentId: string;
  messages: TutorMessage[];
  startedAt: string;
  status: 'active' | 'completed' | 'paused';
}

export interface TutorMessage {
  id: string;
  sender: 'student' | 'ai';
  message: string;
  timestamp: string;
  type: 'text' | 'explanation' | 'hint' | 'feedback' | 'question';
}