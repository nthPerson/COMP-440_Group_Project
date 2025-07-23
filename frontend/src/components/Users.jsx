import React, { useState, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: ''
  });

  useEffect(() => {
    fetch('/api/users/')
      .then(r => r.json())
      .then(setUsers);
  }, []);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    fetch('/api/users/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    }).then(() => window.location.reload());
  };

  return (
    <div>
      <h2>User Management</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />
        <input
          name="first_name"
          placeholder="First Name"
          onChange={handleChange}
        />
        <input
          name="last_name"
          placeholder="Last Name"
          onChange={handleChange}
        />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <button type="submit">Add User</button>
      </form>
      <ul>
        {users.map(u => (
          <li key={u.username}>
            {u.username} - {u.first_name} {u.last_name} ({u.email})
          </li>
        ))}
      </ul>
    </div>
  );
}