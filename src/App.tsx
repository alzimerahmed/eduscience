import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminProvider } from './contexts/AdminContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StudyResourcesPage from './pages/StudyResourcesPage';
import AIHubPage from './pages/AIHubPage';
import WorkspacePage from './pages/WorkspacePage';
import NotFoundPage from './pages/NotFoundPage';
import PaymentsPage from './pages/PaymentsPage';
import PaperViewer from './components/PaperViewer';
import EnhancedPaperViewer from './components/EnhancedPaperViewer';
import AITutor from './components/AITutor';
import StudentDashboard from './components/StudentDashboard';
import UserSettings from './components/Settings/UserSettings';
import UserGuide from './components/UserGuide/UserGuide';
import PricingPlans from './components/Pricing/PricingPlans';
import ExamSettings from './components/Admin/ExamSettings';
import PaymentManagement from './components/Admin/PaymentManagement';
import PaperUpload from './components/Upload/PaperUpload';
import { isSupabaseConfigured } from './lib/supabase';

function App() {
  if (process.env.NODE_ENV !== 'production' && !isSupabaseConfigured) {
    console.warn(`
---------------------------------------
⚠️ Running in demo mode with mock data

For full functionality:
1. Create a .env file with your Supabase credentials:
   VITE_SUPABASE_URL=https://ikzwhapilfosvommhlpg.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrendhc3hxcmRxcnZua2NyaWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY1MTc3MDQsImV4cCI6MjAwMjA5MzcwNH0.h0YGM1xHZ8HuY8k8RbYUZ9z4yQVxQ-DN2QcKNBGqR8M

2. Restart the development server
---------------------------------------
    `);
  }

  return (
    <AuthProvider>
      <AdminProvider>
        <ThemeProvider>
          <LanguageProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="resources/*" element={<StudyResourcesPage />} />
                <Route path="ai-hub" element={<AIHubPage />} />
                <Route path="workspace" element={<WorkspacePage />} />
                <Route path="paper/:id" element={<EnhancedPaperViewer />} />
                <Route path="tutor/:paperId/:questionId" element={<AITutor />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="settings" element={<UserSettings />} />
                <Route path="guide" element={<UserGuide />} />
                <Route path="pricing" element={<PricingPlans />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="upload" element={<PaperUpload />} />
                <Route path="admin/exam-settings" element={<ExamSettings />} />
                <Route path="admin/payment-management" element={<PaymentManagement />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </LanguageProvider>
        </ThemeProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;