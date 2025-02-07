import  { useState, useEffect } from 'react';
// import { Link2, BarChart3, LogIn } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import TopicAnalytics from './components/TopicAnalytics';
import OverallAnalytics from './components/OverallAnalytics';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      localStorage.setItem('token', token);
      setToken(token);
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogout={handleLogout} />
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard token={token} />} />
            <Route path="/analytics/:alias" element={<Analytics token={token} />} />
            <Route path="/analytics/topic/:topic" element={<TopicAnalytics token={token} />} />
            <Route path="/analytics/overall" element={<OverallAnalytics token={token} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;