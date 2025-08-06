import React, { useState } from 'react';

export default function ImageUpload({ itemId, currentImageUrl, onImageUpdated }) {
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setError('');
    }
  };

  const uploadToImgur = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7' // Public Imgur client ID
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Imgur');
    }

    const data = await response.json();
    return data.data.link;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let finalImageUrl = '';

      if (uploadMethod === 'file' && selectedFile) {
        // Upload file to Imgur and get URL
        finalImageUrl = await uploadToImgur(selectedFile);
      } else if (uploadMethod === 'url' && imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      } else {
        setError('Please provide an image URL or select a file');
        setIsSubmitting(false);
        return;
      }

      // Update item with the image URL
      const response = await fetch(`/api/items/${itemId}/image`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: finalImageUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        onImageUpdated(data.image_url);
        setImageUrl('');
        setSelectedFile(null);
        setPreviewUrl('');
        setShowForm(false);
      } else {
        setError(data.error || 'Failed to update image');
      }
    } catch (err) {
      setError(err.message || 'Error uploading image. Please try again.');
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
        setSelectedFile(null);
        setPreviewUrl('');
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

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
      
      {/* Upload Method Selector */}
      <div className="upload-method-selector">
        <label>
          <input
            type="radio"
            value="url"
            checked={uploadMethod === 'url'}
            onChange={(e) => setUploadMethod(e.target.value)}
          />
          Image URL
        </label>
        <label>
          <input
            type="radio"
            value="file"
            checked={uploadMethod === 'file'}
            onChange={(e) => setUploadMethod(e.target.value)}
          />
          Upload File
        </label>
      </div>
      
      <form onSubmit={handleSubmit}>
        {uploadMethod === 'url' ? (
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
        ) : (
          <div className="form-group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="form-input file-input"
              disabled={isSubmitting}
            />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" className="preview-image" />
                <p className="preview-text">Preview of selected image</p>
              </div>
            )}
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isSubmitting || (uploadMethod === 'url' && !imageUrl.trim()) || (uploadMethod === 'file' && !selectedFile)}
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
