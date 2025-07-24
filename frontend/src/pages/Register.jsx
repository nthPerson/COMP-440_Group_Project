import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    username:'', password:'', firstName:'', lastName:'', email:''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const resp = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });
    if (resp.ok) {
      navigate('/home');
    } else {
      const { message } = await resp.json();
      setError(message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth:400, margin:'2rem auto' }}>
      <h2>Register</h2>
      {error && <p style={{ color:'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {['username','password','firstName','lastName','email'].map(field => (
          <div key={field}>
            <input
              name={field}
              type={field==='password' ? 'password':'text'}
              placeholder={field[0].toUpperCase()+field.slice(1)}
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in here</Link>.
      </p>
    </div>
  );
}