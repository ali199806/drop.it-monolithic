import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import DirectoryBrowser from './components/DirectoryBrowser';
import AdminLogin from './components/AdminLogin';
import AdminPage from './components/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/browse" element={<DirectoryBrowser />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/users" element={<AdminPage />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
