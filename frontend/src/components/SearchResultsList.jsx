import React from 'react';
import { Link } from 'react-router-dom';

export default function SearchResultsList({ items }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="search-results-list">
      {items.map(item => (
        <div key={item.id} className="search-result-card">
          {/* Item Image */}
          <div className="search-result-image">
            <img 
              src={item.image_url} 
              alt={item.title}
              className="result-thumbnail"
              onError={(e) => {
                e.target.src = "https://api.iconify.design/mdi:package-variant.svg";
              }}
            />
          </div>
          
          {/* Item Content */}
          <div className="search-result-content">
            <Link to={`/item/${item.id}`} className="result-title-link">
              <h3 className="result-title">{item.title}</h3>
            </Link>
            
            <p className="result-description">
              {item.description.length > 150 
                ? item.description.substring(0, 150) + "..."
                : item.description}
            </p>
            
            <div className="result-meta">
              <div className="result-price">${parseFloat(item.price).toFixed(2)}</div>
              <div className="result-rating">
                <span className="rating-stars">
                  {(() => {
                    const full = Math.floor(item.star_rating);
                    const half = item.star_rating % 1 >= 0.25 && item.star_rating % 1 < 0.75;
                    const empty = 5 - full - (half ? 1 : 0);
                    return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
                  })()}
                </span>
                <span className="rating-text">
                  {item.star_rating.toFixed(1)} ({item.review_count})
                </span>
              </div>
            </div>
            
            <div className="result-categories">
              {item.categories.map(c => (
                <span key={c.name} className="result-category-tag">
                  <img 
                    src={`https://api.iconify.design/${c.icon_key}.svg`}
                    alt=""
                    className="result-category-icon"
                  />
                  {c.name}
                </span>
              ))}
            </div>
            
            <div className="result-seller">
              Posted by <Link to={`/seller/${item.posted_by}`} className="seller-link">{item.posted_by}</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
