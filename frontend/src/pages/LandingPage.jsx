import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ textAlign:'center', marginTop:'2rem' }}>
      <h1>Welcome to the COMP 440 Online Store!</h1>
      <nav style={{ marginTop:'1rem' }}>
        <Link to="/login" style={{ marginRight:'1rem' }}>Log In</Link>
        <Link to="/register">Register</Link>
      </nav>
    </div>
  );
}