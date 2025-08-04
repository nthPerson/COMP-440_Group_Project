import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import '../styles/components/Navbar.css';
import SearchInterface from './SearchInterface';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then (data => {
        if (data && data.id) {
          setUser(data);  // Only set a user if /api/auth/status returns all user data
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);  // Explicityly set user to null on any error
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">Shopella</Link>
      </div>
      <div className="nav-center">
        <SearchInterface />
      </div>
      <div className="nav-right">
        {!user && (
          <>
            <NavLink to="/login" className="nav-link">Login</NavLink>
            <NavLink to="/register" className="nav-link">Register</NavLink>
          </>
        )}
        {user && (
          <>
            <NavLink to="/item-management" className="nav-link">Item Management</NavLink>
            <NavLink to="/reports" className="nav-link">Reports</NavLink>
            <NavLink to="/profile" className="nav-link">Profile</NavLink>
            <button onClick={handleLogout} className="nav-link nav-button">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
