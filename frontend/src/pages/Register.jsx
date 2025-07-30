import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Import optimized styles
import '../styles/global.css';
import '../styles/AuthForms.css';

export default function Register() {
  const [form, setForm] = useState({
    username:'', password:'', passwordConfirm: '', firstName:'', lastName:'', email:''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validations, setValidations] = useState({
    username: false,
    email: false,
    password: false,
    passwordMatch: false
  });
  const navigate = useNavigate();

  // Real-time validation
  useEffect(() => {
    setValidations({
      username: form.username.length >= 3,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
      password: form.password.length >= 6,
      passwordMatch: form.password && form.passwordConfirm && form.password === form.passwordConfirm
    });
  }, [form]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  }

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate all fields
    if (!validations.username || !validations.email || !validations.password || !validations.passwordMatch) {
      setError('Please fill in all fields correctly');
      return;
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required');
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
        setSuccess(' Account created successfully! Redirecting...');
        setTimeout(() => navigate('/home'), 2000);
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
    <div className="auth-container">
      <div className="auth-content">
        <h2>Create Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
          Join our online store community
        </p>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit} autoComplete="off" className="auth-form">
          <div className="form-group">
            <input
              className={`form-input ${validations.username ? 'valid' : ''}`}
              name="username"
              placeholder="Choose a unique username"
              value={form.username}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
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
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
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
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
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
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
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
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
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
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
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
            className="auth-btn auth-btn-primary"
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
          <Link to="/login" className="auth-link">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}