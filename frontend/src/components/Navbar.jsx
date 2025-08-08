import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import '../styles/components/Navbar.css';
import SearchInterface from './SearchInterface';

export default function Navbar() {
  // pull the last-saved user out of sessionStorage  - if you do useState starting at null, it will always start at null state which causes the glitch
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const navigate = useNavigate();

  useEffect(() => {
      fetch('/api/auth/status', { credentials: 'include' })
        .then(res => res.json()) // Always parse JSON since we always return 200
        .then (data => {
          if (data && data.username) {
            setUser(data);  // Only set a user if /api/auth/status returns all user data
            sessionStorage.setItem('user', JSON.stringify(data)); // Store user data in sessionStorage
          } else {
            setUser(null);
            sessionStorage.removeItem('user'); // Clear sessionStorage if no user
          }
        })
        .catch(() => {
          setUser(null);  // Explicitly set user to null on any error
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
            <NavLink to="/" className="nav-link">Items</NavLink>
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
