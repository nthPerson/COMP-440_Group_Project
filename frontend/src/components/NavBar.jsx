import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/NavBar.css';

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">Bellashop</Link>
        <input type="text" placeholder="Search" className="navbar-search" />
      </div>
      <div className="navbar-links">
        <Link to="/home" className="nav-link">Item Management</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
      </div>
    </nav>
  );
}
