import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/ItemManagement.css'; // reuse your existing styles
import '../styles/components/Carousel.css';

export default function SuggestedCarousel({ items }) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 2; // Adjust based on screen width if needed

  const handlePrev = () => {
    setStartIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setStartIndex(prev => Math.min(prev + 1, items.length - visibleCount));
  };

  const visibleItems = items.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="suggested-carousel-wrapper">
      <h3 className="page-title">Similar Styles</h3>
      <div className="carousel-controls">
      <button onClick={handlePrev} disabled={startIndex === 0} className="carousel-arrow left">‹</button>
        <ul className="carousel-items">
          {visibleItems.map(item => (
            <li key={item.id} className="item-card carousel-card">

              <h3>
                <Link to={`/item/${item.id}`}>{item.title}</Link>
              </h3>
              <p>{item.description}</p>
              <div className="item-meta">
                <div className="item-meta-item">
                  <span className="meta-label">Price</span>
                  <span className="meta-value">${parseFloat(item.price).toFixed(2)}</span>
                </div>
                <div className="item-meta-item">
                  <span className="meta-label">Posted By</span>
                  <Link to={`/seller/${item.posted_by}`} className="meta-value">{item.posted_by}</Link>
                </div>
                <div className="item-meta-item">
                  <span className="meta-label">Date Posted</span>
                  <span className="meta-value">{new Date(item.date_posted).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="item-categories">
                <span className="meta-label">Categories:</span>
                <div className="category-list">
                  {item.categories.map(c => (
                    <span key={c.name} className="category-item">{c.name}</span>
                  ))}
                </div>
              </div>
              <div className="item-rating">
                <span className="rating-stars">
                  {(() => {
                    const full = Math.floor(item.star_rating);
                    const half = item.star_rating % 1 >= 0.25 && item.star_rating % 1 < 0.75;
                    const empty = 5 - full - (half ? 1 : 0);
                    return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
                  })()}
                </span>
                <span className="rating-info">
                  {item.star_rating.toFixed(1)}/5 • <strong>{item.review_count}</strong> {item.review_count === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <button onClick={handleNext} disabled={startIndex + visibleCount >= items.length} className="carousel-arrow right">›</button>

      </div>
    </div>
  );
}
