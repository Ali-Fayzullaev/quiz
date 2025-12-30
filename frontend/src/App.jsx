import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import QuizList from './components/quiz/QuizList';
import Quiz from './components/quiz/Quiz';
import CreateQuiz from './components/quiz/CreateQuiz';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/create-quiz" element={<CreateQuiz />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
