import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import StatementsPage from './pages/StatementsPage';
import StatementReviewPage from './pages/StatementReviewPage';
import GoalsPage from './pages/GoalsPage';
import PortfolioPage from './pages/PortfolioPage';
import ResearchPage from './pages/ResearchPage';
import ResearchDetailPage from './pages/ResearchDetailPage';
import MarketsPage from './pages/MarketsPage';
import SettingsPage from './pages/SettingsPage';
import UpgradeToProPage from './pages/UpgradeToProPage';
import ManualEntryPage from './pages/ManualEntryPage';
import BudgetsPage from './pages/BudgetsPage';
import EmergencyFundPage from './pages/EmergencyFundPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth pages (wrapped in layout) */}
          <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Register — standalone layout (no AuthLayout wrapper) */}
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Onboarding — standalone layout (no AppLayout wrapper) */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

          {/* Protected pages */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/statements" element={<StatementsPage />} />
            <Route path="/statements/manual" element={<ManualEntryPage />} />
            <Route path="/statements/review/:id" element={<StatementReviewPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/research/:id" element={<ResearchDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/upgrade-to-pro" element={<UpgradeToProPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
