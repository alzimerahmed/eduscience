import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminProvider } from './contexts/AdminContext';
import { AuthProvider } from './contexts/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages – Public
import HomePage from './pages/HomePage';
import StudyResourcesPage from './pages/StudyResourcesPage';
import AIHubPage from './pages/AIHubPage';
import WorkspacePage from './pages/WorkspacePage';
import PricingPlans from './components/Pricing/PricingPlans';
import UserGuide from './components/UserGuide/UserGuide';
import NotFoundPage from './pages/NotFoundPage';

// Paper/AI Components – Public
import PaperViewer from './components/PaperViewer';
import EnhancedPaperViewer from './components/EnhancedPaperViewer';
import AITutor from './components/AITutor';

// Pages – Protected
import StudentDashboard from './components/StudentDashboard';
import UserSettings from './components/Settings/UserSettings';
import PaymentsPage from './pages/PaymentsPage';
import PaperUpload from './components/Upload/PaperUpload';
import ExamSettings from './components/Admin/ExamSettings';
import PaymentManagement from './components/Admin/PaymentManagement';

import { isSupabaseConfigured } from './lib/supabase';

if (process.env.NODE_ENV !== 'production' && !isSupabaseConfigured) {
  console.warn(`
---------------------------------------
⚠️ Running in demo mode with mock data

To enable full functionality:
1. Create a .env file with your Supabase credentials:
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...

2. Restart the development server
---------------------------------------
  `);
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <ThemeProvider>
          <LanguageProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* 🔓 Public Routes */}
                <Route index element={<HomePage />} />
                <Route path="resources/*" element={<StudyResourcesPage />} />
                <Route path="ai-hub" element={<AIHubPage />} />
                <Route path="workspace" element={<WorkspacePage />} />
                <Route path="pricing" element={<PricingPlans />} />
                <Route path="guide" element={<UserGuide />} />
                <Route path="paper/:id" element={<EnhancedPaperViewer />} />
                <Route path="tutor/:paperId/:questionId" element={<AITutor />} />

                {/* 🔒 Protected Routes */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <UserSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="payments"
                  element={
                    <ProtectedRoute>
                      <PaymentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="upload"
                  element={
                    <ProtectedRoute>
                      <PaperUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/exam-settings"
                  element={
                    <ProtectedRoute>
                      <ExamSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/payment-management"
                  element={
                    <ProtectedRoute>
                      <PaymentManagement />
                    </ProtectedRoute>
                  }
                />

                {/* ❌ 404 Not Found */}
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
