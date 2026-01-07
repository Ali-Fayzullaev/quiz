import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import QuizList from './components/quiz/QuizList';
import Quiz from './components/quiz/Quiz';
import CreateQuiz from './components/quiz/CreateQuiz';
import EditQuiz from './components/quiz/EditQuiz';
import MyQuizzes from './components/quiz/MyQuizzes';
import QuizStats from './components/quiz/QuizStats';
import LikedQuizzes from './components/quiz/LikedQuizzes';
import Profile from './components/profile/Profile';
import ProfileEditor from './components/profile/ProfileEditor';
import Dashboard from './components/dashboard/Dashboard';
import DashboardLayout from './components/dashboard/DashboardLayout';
import './App.css';

// Компонент для защищенных маршрутов с Dashboard Layout
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
};

// Компонент для публичных страниц с Header
const PublicLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="main-content">
        {children}
      </main>
    </>
  );
};

// Компонент для условного показа Header
const AppContent = () => {
  const location = useLocation();

  return (
    <div className="App min-h-screen bg-[#0a0a0f] text-white">
      <Routes>
        {/* Публичные маршруты с Header */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Защищенные маршруты с Dashboard Layout */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
        <Route path="/quiz/:id" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/create-quiz" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
        <Route path="/edit-quiz/:id" element={<ProtectedRoute><EditQuiz /></ProtectedRoute>} />
        <Route path="/my-quizzes" element={<ProtectedRoute><MyQuizzes /></ProtectedRoute>} />
        <Route path="/quiz/:id/stats" element={<ProtectedRoute><QuizStats /></ProtectedRoute>} />
        <Route path="/liked" element={<ProtectedRoute><LikedQuizzes /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditor /></ProtectedRoute>} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
