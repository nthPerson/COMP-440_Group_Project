import React, { useState } from "react";
import { useItemsList } from "../contexts/ItemsListContext";
import CategoryDropdown from "./CategoryDropdown";
import '../styles/components/NewItemForm.css';

/**
 * ENHANCED NEW ITEM FORM COMPONENT
 * 
 * Features:
 * - Larger, more professional input fields
 * - Beautiful gradient "Add Item" button with hover effects
 * - Enhanced error handling and success messages
 * - Better spacing and typography
 * - Loading states with spinner
 * 
 * Purpose: Allow users to create new items with a professional, intuitive interface
 */
export default function NewItemForm() {
    const { addItem } = useItemsList();
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        image_url: ''  // Add image_url field
    });
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Handle input changes with enhanced UX
     */
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    }

    /**
     * Enhanced form submission with better UX
     */
    const handleSubmit = async e => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');
        
        try {
            // Build form payload with selected categories
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                price: parseFloat(form.price),
                categories: selectedCategories,  // Use selected categories array
                image_url: form.image_url.trim()  // Include image URL
            };

            // Client-side validation with enhanced messages
            if (!payload.title) {
                setError('Please enter a title for your item.');
                return;
            }
            if (!payload.description) {
                setError('Please enter a description for your item.');
                return;
            }
            if (isNaN(payload.price) || payload.price <= 0) {
                setError('Price must be a positive number.');
                return;
            }
            if (selectedCategories.length === 0) {
                setError('Please select at least one category.');
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
                // Add the new item to the global item list state immediately
                if (data.item) {
                    addItem(data.item);
                }
                // Clear form and show success
                setForm({ title: '', description: '', price: '', image_url: '' });
                setSelectedCategories([]);
                setSuccess('Item created successfully! It will appear in the list below.');
                
                // Create new event to let parent page know that a new item has been created
                window.dispatchEvent(new Event('itemCreated'));
            } else {
                // Show server-side error
                setError(`${data.error || 'Failed to create item'}`);
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="new-item-form">
            <h2>Create New Item</h2>
            
            {/* Enhanced Alert Messages */}
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        name="title"
                        placeholder="Item Title (e.g., Gaming Mouse, Smartphone)"
                        value={form.title}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <textarea
                        name="description"
                        placeholder="Describe your item in detail... What makes it special?"
                        value={form.description}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <input
                        name="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Price (e.g., 29.99)"
                        value={form.price}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <input
                        name="image_url"
                        type="url"
                        placeholder="Item Image URL (optional - defaults to category icon)"
                        value={form.image_url}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                
                <div className="form-group">
                    <label className="form-label">Categories</label>
                    <CategoryDropdown 
                        selectedCategories={selectedCategories}
                        onCategoriesChange={setSelectedCategories}
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="btn-add-item"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="btn-loading"></span>
                            Creating Item...
                        </>
                    ) : (
                        <>
                             Add Item
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}