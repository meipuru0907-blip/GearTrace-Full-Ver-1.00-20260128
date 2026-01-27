import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddGear from "./pages/AddGear";
import GearDetail from "./pages/GearDetail";
import Settings from "./pages/Settings";
import { Toaster } from "sonner";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddGear />} />
          <Route path="/gear/:id" element={<GearDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
