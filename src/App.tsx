import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import AddGear from './pages/AddGear';
import GearDetail from './pages/GearDetail';
import Settings from './pages/Settings';
import PackingLists from './pages/PackingLists';
import PackingListDetail from './pages/PackingListDetail';
import Subscriptions from './pages/Subscriptions';
import Login from './pages/Login';
import { Toaster } from 'sonner';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/add" element={<RequireAuth><AddGear /></RequireAuth>} />
              <Route path="/gear/:id" element={<RequireAuth><GearDetail /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/packing-lists" element={<RequireAuth><PackingLists /></RequireAuth>} />
              <Route path="/packing-lists/:id" element={<RequireAuth><PackingListDetail /></RequireAuth>} />
              <Route path="/subscriptions" element={<RequireAuth><Subscriptions /></RequireAuth>} />
            </Routes>
            <Toaster richColors position="top-right" />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
