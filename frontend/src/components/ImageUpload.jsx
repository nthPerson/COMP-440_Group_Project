import React from 'react';

export default function ImageUpload({ itemId, currentImageUrl, onImageUpdated, open = false, onClose }) {
  const [imageUrl, setImageUrl] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [uploadMethod, setUploadMethod] = React.useState('url'); // 'url' or 'file'
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showForm, setShowForm] = React.useState(open);

  React.useEffect(() => setShowForm(open), [open]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
    setError('');
  };

  const uploadFileViaBackend = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/items/upload_image', {
      method: 'POST',
      credentials: 'include',
      body: fd
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload image');
    return data.link;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      let finalUrl = '';
      if (uploadMethod === 'file' && selectedFile) {
        finalUrl = await uploadFileViaBackend(selectedFile);
      } else {
        finalUrl = imageUrl.trim();
      }

      const resp = await fetch(`/api/items/${itemId}/image`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: finalUrl })
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed to update item image');

      onImageUpdated?.(json.image_url);
      setShowForm(false);
      onClose?.();
      setSelectedFile(null);
      setPreviewUrl('');
      setImageUrl('');
    } catch (err) {
      setError(err.message || 'Failed to update image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const resp = await fetch(`/api/items/${itemId}/image`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: '' })
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed to reset item image');

      onImageUpdated?.(json.image_url);
      setShowForm(false);
      onClose?.();
      setSelectedFile(null);
      setPreviewUrl('');
      setImageUrl('');
    } catch (err) {
      setError(err.message || 'Failed to reset image');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup preview blob URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!showForm) return null;

  return (
    <div className="image-upload-panel">
      {error && <div className="alert alert-error">{error}</div>}

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

      {uploadMethod === 'url' ? (
        <input
          type="url"
          className="form-input"
          placeholder={currentImageUrl ? 'New image URL' : 'https://example.com/image.jpg'}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      ) : (
        <>
          <input type="file" accept="image/*" onChange={handleFileSelect} className="form-input file-input" />
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" className="preview-image" />
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn-add-item" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button className="items-collapse-toggle" onClick={handleReset} disabled={isSubmitting}>
          Reset to default
        </button>
        <button className="items-collapse-toggle" onClick={() => { setShowForm(false); onClose?.(); }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
