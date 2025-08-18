import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReviewForm from '../components/ReviewForm';
import ImageUpload from '../components/ImageUpload';
import '../styles/global.css';
import '../styles/pages/ItemPage.css';
import '../styles/components/NewItemForm.css';  // Reuse the exact styles from the NewItemForm for identical look/feel as user avatar image update
import Avatar from '../components/Avatar';
import axios from 'axios';

export default function Item() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviewerAvatars, setReviewerAvatars] = useState({});
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imgUploadMethod, setImgUploadMethod] = useState('url'); // 'url' | 'file'
  const [imgFile, setImgFile] = useState(null);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgPreviewUrl, setImgPreviewUrl] = useState('');
  const [imgSaving, setImgSaving] = useState(false);
  const [imgError, setImgError] = useState('');
  const fallbackIcon = "https://api.iconify.design/mdi:package-variant.svg";

  const loadItem = () => {
    fetch(`/api/items/${id}`)
      .then(res => res.json())
      .then(data => setItem(data));
  };

  const loadReviews = () => {
    fetch(`/api/reviews/item/${id}`)
      .then(res => res.json())
      .then(async (data) => {
        setReviews(data);

        const uniqueUsers = Array.from(new Set(data.map(r => r.user).filter(Boolean)));
        const missing = uniqueUsers.filter(u => !reviewerAvatars[u]);

        if (missing.length) {
          const entries = await Promise.all(missing.map(async (u) => {
            try {
              const r = await fetch(`/api/users/${encodeURIComponent(u)}`, { credentials: 'include' });
              if (!r.ok) return [u, ''];
              const j = await r.json();

              // Be defensive about possible response shapes
              const url =
                j.profile_image_url ||
                j.user?.profile_image_url ||
                j.user?.avatar ||
                j.avatar_url ||
                '';

              return [u, url];
            } catch {
              return [u, ''];
            }
          }));
          setReviewerAvatars(prev => {
            const next = { ...prev };
            for (const [u, url] of entries) next[u] = url;
            return next;
          });
        }
      });
  };

  const loadCurrentUser = () => {
    // Use the same endpoint we already use elsewhere for the logged-in user
    fetch('/api/users/me', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && data.username) {
          setCurrentUser({ username: data.username });
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  };

  useEffect(() => {
    loadItem();
    loadReviews();
    loadCurrentUser();
  }, [id]);

  const handleReviewSubmitted = () => {
    loadItem();
    loadReviews();
  };

  const handleImageUpdated = (newImageUrl) => {
    setItem(prev => ({ ...prev, image_url: newImageUrl }));
  };

  const isOwner = currentUser && item && currentUser.username === item.posted_by;

  // If you already have item or id, keep that. This is a safe fallback:
  const { id: itemIdParam } = useParams();
  const itemId = item?.id || itemIdParam;

  useEffect(() => {
    return () => {
      if (imgPreviewUrl) URL.revokeObjectURL(imgPreviewUrl);
    };
  }, [imgPreviewUrl]);

  const onItemFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setImgFile(f);
    setImgError('');
    if (f) {
      const preview = URL.createObjectURL(f);
      setImgPreviewUrl(preview);
    } else {
      setImgPreviewUrl('');
    }
  };

  const submitItemImage = async (e) => {
    e.preventDefault();
    if (!itemId) {
      setImgError('Missing item id.');
      return;
    }
    setImgSaving(true);
    setImgError('');
    try {
      if (imgUploadMethod === 'file') {
        if (!imgFile) {
          setImgError('Please choose an image file.');
          return;
        }
        const fd = new FormData();
        fd.append('image', imgFile);
        // Adjust endpoint if your backend differs
        const res = await axios.put(`/api/items/${itemId}/image`, fd, { withCredentials: true });
        // If you keep item in local state, update its image here
        // setItem(prev => ({ ...prev, image_url: res.data?.image_url }));
      } else {
        const url = imgUrlInput.trim();
        if (!url) {
          setImgError('Please enter an image URL.');
          return;
        }
        const res = await axios.put(
          `/api/items/${itemId}/image`,
          { image_url: url },
          { withCredentials: true }
        );
        // setItem(prev => ({ ...prev, image_url: res.data?.image_url }));
      }
      // Reset editor state and close
      setShowImageEditor(false);
      setImgFile(null);
      setImgUrlInput('');
      setImgPreviewUrl('');
    } catch (err) {
      console.error('Failed to update item image', err);
      setImgError('Failed to update item image. Please try another image.');
    } finally {
      setImgSaving(false);
    }
  };

  const resetItemImage = async () => {
    if (!itemId) return;
    try {
      // Adjust this endpoint to match your API (examples: PUT /default, POST /reset_image)
      await axios.put(`/api/items/${itemId}/image/default`, {}, { withCredentials: true });
      // setItem(prev => ({ ...prev, image_url: res.data?.image_url }));
      setShowImageEditor(false);
      setImgFile(null);
      setImgUrlInput('');
      setImgPreviewUrl('');
      setImgError('');
    } catch (err) {
      console.error('Failed to reset item image', err);
      setImgError('Failed to reset image to default.');
    }
  };

  if (!item) {
    return (
      <>
        <Navbar />
        <div className="item-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading item details...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="item-page">
        <div className="item-container">
          {/* ITEM HEADER SECTION */}
          <div className="item-header">
            <div className="item-image-section">
              <div className="item-image-wrapper">
                <img
                  className="item-image"
                  src={item.image_url || fallbackIcon}
                  alt={item.title}
                  onError={(e) => { e.currentTarget.src = fallbackIcon; }}
                />

                {/* Show edit button for owner; this toggles the image update editor */}
                {isOwner && (
                  <button
                    type="button"
                    className="edit-image-btn"
                    title="Edit item image"
                    onClick={() => setShowImageEditor(v => !v)}
                  >
                    ✎
                  </button>
                )}
              </div>

              {/* Collapsible image update editor panel */}
              {isOwner && showImageEditor && (
                <form className="item-image-editor" onSubmit={submitItemImage}>
                  {imgError && <div className="alert alert-error">{imgError}</div>}

                  {/* Same URL/File selector pattern as on UserProfile */}
                  <div className="upload-method-selector">
                    <input
                      type="radio"
                      id="item-upload-url"
                      value="url"
                      checked={imgUploadMethod === 'url'}
                      onChange={(e) => setImgUploadMethod(e.target.value)}
                    />
                    <label htmlFor="item-upload-url" className={imgUploadMethod === 'url' ? 'active' : ''}>
                      Image URL
                    </label>

                    <input
                      type="radio"
                      id="item-upload-file"
                      value="file"
                      checked={imgUploadMethod === 'file'}
                      onChange={(e) => setImgUploadMethod(e.target.value)}
                    />
                    <label htmlFor="item-upload-file" className={imgUploadMethod === 'file' ? 'active' : ''}>
                      Upload File
                    </label>
                  </div>

                  {imgUploadMethod === 'url' ? (
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://example.com/item-image.jpg"
                      value={imgUrlInput}
                      onChange={(e) => setImgUrlInput(e.target.value)}
                    />
                  ) : (
                    <div className="file-input-wrapper">
                      {/* Hidden native input triggers the OS file picker via the label */}
                      <input
                        type="file"
                        id="item-file-upload"
                        accept="image/*"
                        onChange={onItemFileChange}
                        className="file-input"
                      />
                      <label
                        htmlFor="item-file-upload"
                        className={`file-input-custom ${imgFile ? 'has-file' : ''}`}
                      >
                        <div className="file-upload-icon"></div>
                        <div className="file-upload-text">
                          {imgFile ? `Selected: ${imgFile.name}` : 'Choose an image file'}
                        </div>
                        <div className="file-upload-subtext">
                          {imgFile ? 'Click to change file' : 'PNG, JPG, GIF up to 10MB'}
                        </div>
                        <div className="file-upload-button">
                          {imgFile ? 'Change File' : 'Browse Files'}
                        </div>
                      </label>

                      {imgPreviewUrl && (
                        <div className="image-preview">
                          <img src={imgPreviewUrl} alt="Preview" className="preview-image" />
                          <p className="preview-text upload-success"> Image ready to upload!</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button className="btn-add-item" type="submit" disabled={imgSaving}>
                      {imgSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="items-collapse-toggle" onClick={resetItemImage}>
                      Reset to default
                    </button>
                    <button
                      type="button"
                      className="items-collapse-toggle"
                      onClick={() => {
                        setShowImageEditor(false);
                        setImgError('');
                        setImgFile(null);
                        setImgUrlInput('');
                        setImgPreviewUrl('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            <div className="item-title-section">
              <h1 className="item-title">{item.title}</h1>
              <div className="item-rating-summary">
                <div className="rating-stars">
                  {(() => {
                    const full = Math.floor(item.star_rating);
                    const half = item.star_rating % 1 >= 0.25 && item.star_rating % 1 < 0.75;
                    const empty = 5 - full - (half ? 1 : 0);
                    return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
                  })()}
                </div>
                <span className="rating-text">
                  {item.star_rating.toFixed(1)} ({item.review_count} {item.review_count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
            
            <div className="item-price-section">
              <span className="price">${parseFloat(item.price).toFixed(2)}</span>
            </div>
          </div>

          {/* ITEM DETAILS SECTION */}
          <div className="item-details">
            <div className="item-description">
              <h3 className="section-title">Description</h3>
              <p className="description-text">{item.description}</p>
            </div>

            <div className="item-meta-grid">
              <div className="meta-card">
                <span className="meta-label">Seller</span>
                <Link to={`/seller/${item.posted_by}`} className="meta-value seller-link">
                  {item.posted_by}
                </Link>
              </div>
              <div className="meta-card">
                <span className="meta-label">Posted</span>
                <span className="meta-value">{new Date(item.date_posted).toLocaleDateString()}</span>
              </div>
              <div className="meta-card">
                <span className="meta-label">Categories</span>
                <div className="categories-container">
                  {item.categories.map(c => (
                    <Link
                      key={c.name}
                      to={`/search?category=${encodeURIComponent(c.name)}`}
                      className="category-tag"
                      title={`See all in ${c.name}`}
                    >
                      <img
                        src={`https://api.iconify.design/${c.icon_key}.svg`}
                        alt=""
                        className="category-icon"
                      />
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* REVIEWS SECTION - BEAUTIFIED */}
          <div className="reviews-section">
            <div className="reviews-header">
              <h3 className="section-title">Customer Reviews</h3>
              <span className="reviews-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
            </div>

            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Avatar
                            src={review.user_profile_image_url || reviewerAvatars[review.user]}
                            username={review.user}
                            size={36}
                          />
                        </div>
                        <div className="reviewer-details">
                          <span className="reviewer-name">{review.user}</span>
                          <div className="review-rating">
                            <span className={`rating-badge rating-${review.score.toLowerCase()}`}>
                              {review.score}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="review-date">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    {review.remark && (
                      <div className="review-content">
                        <p className="review-text">{review.remark}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <div className="no-reviews-icon">💭</div>
                <h4 className="no-reviews-title">No reviews yet</h4>
                <p className="no-reviews-text">Be the first to share your experience with this item!</p>
              </div>
            )}
          </div>

          {/* REVIEW FORM SECTION */}
          <div className="add-review-section">
            <h3 className="section-title">Write a Review</h3>
            <ReviewForm itemId={id} onReviewSubmitted={handleReviewSubmitted} />
          </div>
        </div>
      </div>
    </>
  );
}
