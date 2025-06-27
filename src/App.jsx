// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginBox from "./pages/LoginBox";
import SignupBox from "./pages/SignupBox";
import MainPage from './pages/MainPage';
import './utils/VerifyBackend'; // This will run the tests automatically

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginBox />} />
        <Route path="/signup" element={<SignupBox />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;