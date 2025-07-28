import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Users from '../components/Users';

export default function HomePage() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and load user data
    // checkAuth();
    loadStats();
  }, []);

  // const checkAuth = async () => {
  //   try {
  //     const resp = await fetch('/api/auth/status', { credentials: 'include' });
  //     if (resp.ok) {
  //       const userData = await resp.json();
  //       setUser(userData);
  //     } else {
  //       navigate('/login');
  //     }
  //   } catch (err) {
  //     navigate('/login');
  //   }
  // };

  const loadStats = async () => {
    try {
      const resp = await fetch('/api/users/', { credentials: 'include' });
      if (resp.ok) {
        const users = await resp.json();
        setStats({
          totalUsers: users.length,
          recentActivity: users.filter(u => {
            const created = new Date(u.created_at || Date.now());
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return created > dayAgo;
          }).length
        });
      }
    } catch (err) {
      console.log('Stats loading failed:', err);
    }
  };

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