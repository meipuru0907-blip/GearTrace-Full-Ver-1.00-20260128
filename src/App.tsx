import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import AddGear from './pages/AddGear';
import GearDetail from './pages/GearDetail';
import Settings from './pages/Settings';
import PackingLists from './pages/PackingLists';
import PackingListDetail from './pages/PackingListDetail';
import Subscriptions from './pages/Subscriptions';
import { Toaster } from 'sonner';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddGear />} />
            <Route path="/gear/:id" element={<GearDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/packing-lists" element={<PackingLists />} />
            <Route path="/packing-lists/:id" element={<PackingListDetail />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
