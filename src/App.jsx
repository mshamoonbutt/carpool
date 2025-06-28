// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginBox from "./pages/LoginBox";
import SignupBox from "./pages/SignupBox";
import MainPage from './pages/MainPage';
import Dashboard from './pages/Dashboard';
import './utils/VerifyBackend'; // This will run the tests automatically

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginBox />} />
        <Route path="/signup" element={<SignupBox />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;