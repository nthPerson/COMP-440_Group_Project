import React, { useState, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: ''
  });

  // fetch all users
  useEffect(() => {
    fetch('/api/users/', { 
        credentials:'include'  // Send login credentials to backend session manager (Flask-Login)
    })
      .then(r => r.json())
      .then(setUsers);
  }, []);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    fetch('/api/users/', {
      method: 'POST',
      credentials:'include',  // Send login credentials to backend session manager (Flask-Login)
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(() => fetch('/api/users/'))
      .then(r => r.json())
      .then(setUsers)
      .then(() => setForm({ username:'', first_name:'', last_name:'', email:'' }));
  };

  const handleDelete = username => {
    fetch(`/api/users/${username}`, { 
        method: 'DELETE', 
        credentials:'include',  // Send login credentials to backend session manager (Flask-Login)
    })
      .then(() => fetch('/api/users/'))
      .then(r => r.json())
      .then(setUsers);
  };

  const handleUpdate = (username) => {
    const newName = prompt('New first name:');
    if (!newName) return;
    fetch(`/api/users/${username}`, {
      method: 'PUT',
      credentials:'include',  // Send login credentials to backend session manager (Flask-Login)
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: newName })
    })
      .then(() => fetch('/api/users/'))
      .then(r => r.json())
      .then(setUsers);
  };

  return (
    <div>
      <h2>User Management</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
        />
        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <button type="submit">Add User</button>
      </form>
      <ul>
        {users.map(u => (
          <li key={u.username}>
            {u.username} - {u.first_name} {u.last_name} ({u.email})
            <button onClick={() => handleUpdate(u.username)}>Edit</button>
            <button onClick={() => handleDelete(u.username)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
