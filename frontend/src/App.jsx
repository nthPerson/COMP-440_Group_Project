import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage    from './pages/HomePage';

// New fontend UI (front page, item page(s), etc.)
import FrontPage   from './pages/FrontPage';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Item        from './pages/Item';
import Seller      from './pages/Seller';
import UserProfile from './pages/UserProfile';
import Reports     from './pages/Reports';
import './styles/global.css';

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route path="/"                  element={<FrontPage />} />
          <Route path="/item/:id"          element={<Item />} />
          <Route path="/seller/:username"  element={<Seller />} />
          <Route path="/profile"           element={<UserProfile />} />
          <Route path="/reports"           element={<Reports />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/register"          element={<Register />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
