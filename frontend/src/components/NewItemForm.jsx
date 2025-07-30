import React, { useState } from "react";

export default function NewItemForm() {
// export default function NewItemForm({ onItemCreated }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        categories: ''  // Comma-separated list on input
    });
    const [error, setError] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');

        // Parse comma-separated list of categories into array of strings
        const cats = form.categories
            .split(',')
            .map(s => s.trim().toLowerCase())
            .filter(s => s);

        // Build form payload
        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            price: parseFloat(form.price),
            categories: cats
        };

        // Client-side validation (prevents erroneous calls to the API that are doomed to fail)
        if (!payload.title) {
            setError('Please enter a title.');
            return;
        }
        if (!payload.description) {
            setError('Please enter a description.');
            return;
        }
        if (isNaN(payload.price) || payload.price <= 0) {
            setError('Price must be a positive number.');
            return;
        }
        if (cats.length === 0) {
            setError('Please enter at least one category that the item belongs to.');
            return;
        }

        // POST request to the backend create_item() route
        const resp = await fetch('/api/items/newitem', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await resp.json();

        if (resp.ok) {
            // Clear form so user can enter another item
            setForm({ title: '', description: '', price: '', categories: '' });
            // Create new event to let parent page know that a new item has been created
            window.dispatchEvent(new Event('itemCreated'));
        } else {
            // Show server-side error
            setError(data.error || 'Failed to create item');
        }
    };

  return (
    <div className="new-item-form">
      <h2>Create New Item</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            name="categories"
            placeholder="Categories (comma-separated)"
            value={form.categories}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Add Item
        </button>
      </form>
    </div>
  );
}