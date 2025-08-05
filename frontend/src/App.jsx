import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ItemsListProvider } from './contexts/ItemsListContext';

// New fontend UI (front page, item page(s), etc.)
import FrontPage   from './pages/FrontPage';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Item        from './pages/Item';
import Seller      from './pages/Seller';
import UserProfile from './pages/UserProfile';
import Reports     from './pages/Reports';
import ItemManagement from './pages/ItemManagement';
import './styles/global.css';

// import LandingPage from './pages/LandingPage';  // Deprecated (from single-page UI)
// import HomePage    from './pages/HomePage';  // Deprecated (from single-page UI)

function App() {
  return (
    <div className="app-container">
      <ItemsListProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"                  element={<FrontPage />} />
            <Route path="/item/:id"          element={<Item />} />
            <Route path="/seller/:username"  element={<Seller />} />
            <Route path="/profile"           element={<UserProfile />} />
            <Route path="/reports"           element={<Reports />} />
            <Route path="/login"             element={<Login />} />
            <Route path="/item-management"   element={<ItemManagement />} />
            <Route path="/register"          element={<Register />} />
          </Routes>
        </BrowserRouter>
      </ItemsListProvider>
    </div>
  );
}

export default App;
