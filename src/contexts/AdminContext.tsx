import React, { createContext, useContext, useState } from 'react';

export interface ExamSettings {
  id: string;
  paperId: string;
  timeLimit: number; // in minutes
  allowPause: boolean;
  showTimer: boolean;
  autoSubmit: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;
  passingScore: number;
  maxAttempts: number;
  availableFrom: string;
  availableTo: string;
  instructions: string;
}

export interface UploadedPaper {
  id: string;
  title: string;
  subject: string;
  type: 'pastpaper' | 'model' | 'notes' | 'answerScheme' | 'mindMap' | 'shortMethod';
  language: 'ta' | 'en' | 'si';
  file: File | null;
  content: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  examSettings?: ExamSettings;
}

interface AdminContextType {
  examSettings: ExamSettings[];
  uploadedPapers: UploadedPaper[];
  createExamSettings: (settings: Omit<ExamSettings, 'id'>) => void;
  updateExamSettings: (id: string, settings: Partial<ExamSettings>) => void;
  deleteExamSettings: (id: string) => void;
  uploadPaper: (paper: Omit<UploadedPaper, 'id' | 'uploadedAt' | 'status'>) => void;
  approvePaper: (id: string) => void;
  rejectPaper: (id: string) => void;
  getExamSettings: (paperId: string) => ExamSettings | undefined;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [examSettings, setExamSettings] = useState<ExamSettings[]>([
    {
      id: '1',
      paperId: '1',
      timeLimit: 180, // 3 hours
      allowPause: true,
      showTimer: true,
      autoSubmit: true,
      shuffleQuestions: false,
      showResults: true,
      passingScore: 60,
      maxAttempts: 3,
      availableFrom: new Date().toISOString(),
      availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      instructions: 'Read all questions carefully before answering. You have 3 hours to complete this exam.'
    }
  ]);

  const [uploadedPapers, setUploadedPapers] = useState<UploadedPaper[]>([]);

  const createExamSettings = (settings: Omit<ExamSettings, 'id'>) => {
    const newSettings: ExamSettings = {
      ...settings,
      id: Date.now().toString()
    };
    setExamSettings(prev => [...prev, newSettings]);
  };

  const updateExamSettings = (id: string, updates: Partial<ExamSettings>) => {
    setExamSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, ...updates } : setting
      )
    );
  };

  const deleteExamSettings = (id: string) => {
    setExamSettings(prev => prev.filter(setting => setting.id !== id));
  };

  const uploadPaper = (paper: Omit<UploadedPaper, 'id' | 'uploadedAt' | 'status'>) => {
    const newPaper: UploadedPaper = {
      ...paper,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
      status: 'pending'
    };
    setUploadedPapers(prev => [...prev, newPaper]);
  };

  const approvePaper = (id: string) => {
    setUploadedPapers(prev =>
      prev.map(paper =>
        paper.id === id ? { ...paper, status: 'approved' } : paper
      )
    );
  };

  const rejectPaper = (id: string) => {
    setUploadedPapers(prev =>
      prev.map(paper =>
        paper.id === id ? { ...paper, status: 'rejected' } : paper
      )
    );
  };

  const getExamSettings = (paperId: string): ExamSettings | undefined => {
    return examSettings.find(setting => setting.paperId === paperId);
  };

  return (
    <AdminContext.Provider value={{
      examSettings,
      uploadedPapers,
      createExamSettings,
      updateExamSettings,
      deleteExamSettings,
      uploadPaper,
      approvePaper,
      rejectPaper,
      getExamSettings
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};