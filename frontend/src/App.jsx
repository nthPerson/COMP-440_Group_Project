import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login       from './pages/Login';
import Register    from './pages/Register';
import HomePage    from './pages/HomePage';
import Profile     from './pages/Profile';
import NavBar      from './components/NavBar';
import './styles/global.css';

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/"        element={<LandingPage />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/register"element={<Register />} />
          <Route path="/home"    element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
