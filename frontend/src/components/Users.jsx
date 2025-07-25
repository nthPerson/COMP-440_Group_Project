import React, { useState, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/', { 
        credentials:'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Network error while fetching users');
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/', {
        method: 'POST',
        credentials:'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        await fetchUsers();
        setForm({ username:'', first_name:'', last_name:'', email:'' });
        setSuccess('User added successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add user');
      }
    } catch (err) {
      setError('Network error while adding user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async username => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${username}`, { 
        method: 'DELETE', 
        credentials:'include'
      });

      if (response.ok) {
        await fetchUsers();
        setSuccess('User deleted successfully!');
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Network error while deleting user');
    }
  };

  const handleUpdate = async (username) => {
    const newName = prompt('Enter new first name:', '');
    if (!newName || newName.trim() === '') return;

    try {
      const response = await fetch(`/api/users/${username}`, {
        method: 'PUT',
        credentials:'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: newName.trim() })
      });

      if (response.ok) {
        await fetchUsers();
        setSuccess('User updated successfully!');
      } else {
        setError('Failed to update user');
      }
    } catch (err) {
      setError('Network error while updating user');
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h3>Add New User</h3>
        <form onSubmit={handleSubmit} className="user-form">
          <input
            className="form-input"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            className="form-input"
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <input
            className="form-input"
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
          <input
            className="form-input"
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <button 
            type="submit" 
            className="btn btn-success"
            disabled={isLoading}
            style={{ gridColumn: '1 / -1' }}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                Adding User...
              </>
            ) : (
              '+ Add User'
            )}
          </button>
        </form>
      </div>

      <div>
        <h3>Current Users ({users.length})</h3>
        {users.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-xl)', 
            color: 'var(--gray-500)',
            background: 'var(--gray-50)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--gray-200)'
          }}>
            No users found. Add your first user above!
          </div>
        ) : (
          <div className="user-list">
            {users.map(user => (
              <div key={user.username} className="user-item">
                <div className="user-info">
                  <div className="user-name">
                    {user.username}
                  </div>
                  <div style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="user-email">
                    {user.email}
                  </div>
                </div>
                <div className="user-actions">
                  <button 
                    onClick={() => handleUpdate(user.username)}
                    className="btn btn-secondary btn-small"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(user.username)}
                    className="btn btn-danger btn-small"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
