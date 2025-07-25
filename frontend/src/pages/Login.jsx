import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ username:'', password:'' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
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
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <h2>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
          Sign in to your account
        </p>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-input"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <input
              className="form-input"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full-width"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', color: 'var(--gray-600)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="link">Create one here</Link>
        </p>
      </div>
    </div>
  );
}