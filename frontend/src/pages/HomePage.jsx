import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Users from '../components/Users';

export default function HomePage() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    setError('');
    try {
      const resp = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (resp.ok) {
        navigate('/');  // Go back to the Landing Page upon logout
      } else {
        const { message } = await resp.json();
        setError(message || 'Logout failed');
      }
    } catch {
      setError('Logout failed');
    }
  };

  return (
    <div style={{ padding:'1rem' }}>
      <h2>Home</h2>
      <Users />
      {error && <p style={{ color:'red'}}>{error}</p>}
      <button onClick={handleLogout} style={{ marginTop: '1rem' }}>Log Out</button>
    </div>
  );
}