import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ username:'', password:'' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });
    if (resp.ok) {
      navigate('/home');
    } else {
      const { message } = await resp.json();
      setError(message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth:400, margin:'2rem auto' }}>
      <h2>Log In</h2>
      {error && <p style={{ color:'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Log In</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>.
      </p>
    </div>
  );
}