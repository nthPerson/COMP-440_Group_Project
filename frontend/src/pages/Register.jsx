import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    username:'', password:'', passwordConfirm: '', firstName:'', lastName:'', email:''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    // setForm({ ...form, [e.target.name]: e.target.value });
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async e => {
    e.preventDefault();

    // Make sure that the user has entered matching passwords in both fields
    if (form.password != form.passwordConfirm) {
      alert("Please make sure your password matches in both fields. Thanks!");
      return;
    }
    setError('');
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
  };

  return (
    <div style={{ maxWidth:400, margin:'2rem auto' }}>
      <h2>Register</h2>
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
        <div>
          <input
            name="passwordConfirm"
            type="password"
            placeholder="Confirm Password"
            value={form.passwordConfirm}
            onChange={handleChange}
            required
          />
          {form.passwordConfirm && (
            <p style={{ color: form.password === form.passwordConfirm ? 'green' : 'red' }}>
              {form.password === form.passwordConfirm ? 'Passwords match' : 'Passwords do not match'}
            </p>
          )}
        </div>
        <div>
          <input
            name="firstName"
            placeholder="FirstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            name="lastName"
            placeholder="LastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* {['username','password','firstName','lastName','email'].map(field => (
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
        ))} */}


        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in here</Link>.
      </p>
    </div>
  );
}