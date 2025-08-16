// src/components/ItemCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/ItemCard.css';

export default function ItemCard({ item, showPostedBy = true }) {
  return (
    <div className="item-card">
    {/* Row 1: Image (64×64) + Title */}
    <div className="fp-item-header-row">
      <img
        className="fp-item-thumb"
        src={
          item.image_url ||
          (item.categories?.[0]?.icon_key
            ? `https://api.iconify.design/${item.categories[0].icon_key}.svg`
            : 'https://api.iconify.design/mdi:package-variant.svg')
        }
        alt={item.title}
        onError={e => {
          e.currentTarget.src = 'https://api.iconify.design/mdi:package-variant.svg';
        }}
      />
      <h3 className="fp-item-title">
        <Link to={`/item/${item.id}`}>{item.title}</Link>
      </h3>
    </div>

    {/* Row 2: Description */}
    <p className="fp-item-description">{item.description}</p>

    {/* Row 3: Price, Posted By */}
    {showPostedBy && (
      <div className="fp-row fp-price-seller">
        <div className="fp-price">${parseFloat(item.price).toFixed(2)}</div>
        <div className="fp-posted-by">
          posted by <Link to={`/seller/${item.posted_by}`}>{item.posted_by}</Link>
        </div>
      </div>
    )}

    {/* Row 4: Date Posted */}
    <div className="fp-date">{new Date(item.date_posted).toLocaleDateString()}</div>

    {/* Row 5: Categories */}
    <div className="item-categories">
      <span className="meta-label">Categories:</span>
      <div className="category-list">
        {item.categories.map(c => (
          <Link
            key={c.name}
            to={`/search?category=${encodeURIComponent(c.name)}`}
            className="category-item"
            title={`See all in ${c.name}`}
          >
            <img
              src={`https://api.iconify.design/${c.icon_key}.svg`}
              alt=""
              className="category-icon-small"
            />
            {c.name}
          </Link>
        ))}
      </div>
    </div>

    {/* Row 6: Rating */}
    <div className="item-rating">
      <span className="rating-stars">
        {(() => {
          const full = Math.floor(item.star_rating);
          const half =
            item.star_rating % 1 >= 0.25 && item.star_rating % 1 < 0.75;
          const empty = 5 - full - (half ? 1 : 0);
          return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
        })()}
      </span>
      <span className="rating-info">
        {item.star_rating.toFixed(1)}/5 • <strong>{item.review_count}</strong>{' '}
        <Link to={`/item/${item.id}#reviews`} className="review-link">
          {item.review_count === 1 ? 'review' : 'reviews'}
        </Link>
      </span>
    </div>
  </div>
  );
}
