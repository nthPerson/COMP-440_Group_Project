import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    username:'', password:'', passwordConfirm: '', firstName:'', lastName:'', email:''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async e => {
    e.preventDefault();

    // Make sure that the user has entered matching passwords in both fields
    if (form.password !== form.passwordConfirm) {
      setError("Passwords do not match. Please ensure both password fields are identical.");
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { passwordConfirm, ...payload } = form;
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (resp.ok) {
        navigate('/home');
      } else {
        const { message } = await resp.json();
        setError(message || 'Registration failed');
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

  const passwordsMatch = form.password && form.passwordConfirm && form.password === form.passwordConfirm;
  const passwordsDontMatch = form.password && form.passwordConfirm && form.password !== form.passwordConfirm;

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <h2>Create Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
          Join our online store community
        </p>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-input"
              name="username"
              placeholder="Choose a username"
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
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              autoComplete="given-name"
            />
          </div>

          <div className="form-group">
            <input
              className="form-input"
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              autoComplete="family-name"
            />
          </div>

          <div className="form-group">
            <input
              className="form-input"
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <input
              className="form-input"
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              autoComplete="new-password"
            />
          </div>
          
          <div className="form-group">
            <input
              className="form-input"
              name="passwordConfirm"
              type="password"
              placeholder="Confirm your password"
              value={form.passwordConfirm}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              autoComplete="new-password"
            />
            {form.passwordConfirm && (
              <div className={`password-match ${passwordsMatch ? 'match' : 'no-match'}`}>
                {passwordsMatch ? (
                  <>✓ Passwords match</>
                ) : (
                  <>✗ Passwords do not match</>
                )}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full-width"
            disabled={isLoading || passwordsDontMatch}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', color: 'var(--gray-600)' }}>
          Already have an account?{' '}
          <Link to="/login" className="link">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}