import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReviewForm from '../components/ReviewForm';
import ImageUpload from '../components/ImageUpload';
import '../styles/global.css';
import '../styles/pages/ItemPage.css';
import Avatar from '../components/Avatar';

export default function Item() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviewerAvatars, setReviewerAvatars] = useState({});

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

        // Batch fetch reviewer avatars if not provided in data
        const uniqueUsers = Array.from(new Set(data.map(r => r.user).filter(Boolean)));
        const missing = uniqueUsers.filter(u => !reviewerAvatars[u]);

        if (missing.length) {
          const entries = await Promise.all(missing.map(async (u) => {
            try {
              const r = await fetch(`/api/users/${encodeURIComponent(u)}`, { credentials: 'include' });
              const j = await r.json();
              return [u, j.profile_image_url || ''];
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
//   const loadReviews = () => {
//     fetch(`/api/reviews/item/${id}`)
//       .then(res => res.json())
//       .then(data => setReviews(data));
//   };

  const loadCurrentUser = () => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setCurrentUser(data.user);
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
              <img 
                src={item.image_url} 
                alt={item.title}
                className="item-image"
                onError={(e) => {
                  e.target.src = "https://api.iconify.design/mdi:package-variant.svg";
                }}
              />
              {isOwner && (
                <ImageUpload 
                  itemId={item.id}
                  currentImageUrl={item.image_url}
                  onImageUpdated={handleImageUpdated}
                />
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
                    <span key={c.name} className="category-tag">
                      <img 
                        src={`https://api.iconify.design/${c.icon_key}.svg`}
                        alt=""
                        className="category-icon"
                      />
                      {c.name}
                    </span>
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
                        {/* <div className="reviewer-avatar">
                          {review.user.charAt(0).toUpperCase()}
                        </div> */}
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
