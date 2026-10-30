import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastViewport } from '@/components/feedback/ToastViewport';
import { AppLayout, RequireAuth } from '@/components/layout/AppLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import TransactionsPage from '@/pages/TransactionsPage';
import BudgetsPage from '@/pages/BudgetsPage';
import InsightsPage from '@/pages/InsightsPage';
import GoalsPage from '@/pages/GoalsPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastViewport />
    </>
  );
}
