import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useItemsList } from '../contexts/ItemsListContext';
import Navbar from '../components/Navbar';
import '../styles/global.css';
import '../styles/layout/HomePage.css';
import '../styles/components/ItemManagement.css';

export default function FrontPage() {
  // const [items, setItems] = useState([]);
  const { items, isLoading, error } = useItemsList();

  // ItemsList context now handles loading items list
  // useEffect(() => {
  //   fetch('/api/items/list_items')
  //     .then(res => res.json())
  //     .then(data => setItems(data))
  //     .catch(() => {});
  // }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title">Items</h1>
          </div>
          <div className="item-management">
            <div className="item-list-section">
              {isLoading && items.length === 0 ? (
                <div className="loading-container">
                  <p>Loading items...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p className="error-message">{error}</p>
                </div>
              ) : (
                <ul>
                  {items.map(item => (
                    <li key={item.id} className="front-page-item-card">
                      {/* Item Image in upper-left corner */}
                      <div className="front-page-item-image">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="front-page-thumbnail"
                          onError={(e) => {
                            e.target.src = "https://api.iconify.design/mdi:package-variant.svg";
                          }}
                        />
                      </div>
                      
                      {/* Item content in row-based layout */}
                      <div className="front-page-item-content">
                        {/* Title */}
                        <h3 className="front-page-title">
                          <Link to={`/item/${item.id}`}>{item.title}</Link>
                        </h3>
                        
                        {/* Description */}
                        <p className="front-page-description">{item.description}</p>
                        
                        {/* Price and Posted By (same row) */}
                        <div className="front-page-row">
                          <span className="front-page-price">${parseFloat(item.price).toFixed(2)}</span>
                          <span className="front-page-posted-by">
                            posted by <Link to={`/seller/${item.posted_by}`}>{item.posted_by}</Link>
                          </span>
                        </div>
                        
                        {/* Date Posted */}
                        <div className="front-page-date">
                          {new Date(item.date_posted).toLocaleDateString()}
                        </div>
                        
                        {/* Categories */}
                        <div className="front-page-categories">
                          {item.categories.map(c => (
                            <span key={c.name} className="front-page-category-tag">
                              <img 
                                src={`https://api.iconify.design/${c.icon_key}.svg`}
                                alt=""
                                className="front-page-category-icon"
                              />
                              {c.name}
                            </span>
                          ))}
                        </div>
                        
                        {/* Star Rating */}
                        <div className="front-page-rating">
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
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
