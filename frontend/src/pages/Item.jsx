import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReviewForm from '../components/ReviewForm';
import '../styles/global.css';
import '../styles/pages/ItemPagePage.css';
import SuggestedCarousel from '../components/SuggestedCarousel';


export default function Item() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarItems, setSimilarItems] = useState([]);

  const loadItem = () => {
    fetch(`/api/items/${id}`)
      .then(res => res.json())
      .then(data => setItem(data));
  };

  const loadReviews = () => {
    fetch(`/api/reviews/item/${id}`)
      .then(res => res.json())
      .then(data => setReviews(data));
  };

  useEffect(() => {
    loadItem();
    loadReviews();
  }, [id]);
  useEffect(() => {
    if (item && item.categories.length > 0) {
      loadSuggestedItems(item.categories[0].name); // use first category
    }
  }, [item]);

  const handleReviewSubmitted = () => {
    loadItem();
    loadReviews();
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
  const loadSuggestedItems = (categoryName) => {
    fetch(`/api/items/search?category=${encodeURIComponent(categoryName)}`) // or use /public_search
      .then(res => res.json())
      .then(data => {
        const filtered = data.items.filter(i => i.id !== parseInt(id)); // exclude current item
        setSimilarItems(filtered);
      });
  };
  
  return (
    <>
      <Navbar />
      <div className="item-page">
        <div className="item-container">
          {/* ITEM HEADER SECTION */}
          <div className="item-header">
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
                    <span key={c.name} className="category-tag">{c.name}</span>
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
                        <div className="reviewer-avatar">
                          {review.user.charAt(0).toUpperCase()}
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
