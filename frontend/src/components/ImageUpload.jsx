import React, { useState } from 'react';

export default function ImageUpload({ itemId, currentImageUrl, onImageUpdated }) {
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/items/${itemId}/image`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        onImageUpdated(data.image_url);
        setImageUrl('');
        setShowForm(false);
      } else {
        setError(data.error || 'Failed to update image');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/items/${itemId}/image`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: '' }),
      });

      const data = await response.json();

      if (response.ok) {
        onImageUpdated(data.image_url);
        setShowForm(false);
      } else {
        setError(data.error || 'Failed to reset image');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <div className="image-upload-container">
        <button 
          onClick={() => setShowForm(true)}
          className="btn-edit-image"
        >
          📷 Update Image
        </button>
      </div>
    );
  }

  return (
    <div className="image-upload-form">
      <h4>Update Item Image</h4>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="url"
            placeholder="Enter new image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="form-input"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isSubmitting || !imageUrl.trim()}
            className="btn-primary"
          >
            {isSubmitting ? 'Updating...' : 'Update Image'}
          </button>
          
          <button 
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="btn-secondary"
          >
            {isSubmitting ? 'Resetting...' : 'Reset to Default'}
          </button>
          
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
