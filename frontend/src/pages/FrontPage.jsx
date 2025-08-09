import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useItemsList } from '../contexts/ItemsListContext';
import Navbar from '../components/Navbar';
import '../styles/global.css';
import '../styles/layout/HomePage.css';
import '../styles/components/ItemManagement.css';
import '../styles/pages/FrontPage.css';

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
      <div className="dashboard-container front-page">
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
                    <li key={item.id} className="item-card">
                      {/* Row 1: Image (64x64) + Title */}
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
                          onError={(e) => {
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
                      <div className="fp-row fp-price-seller">
                        <div className="fp-price">${parseFloat(item.price).toFixed(2)}</div>
                        <div className="fp-posted-by">
                          posted by <Link to={`/seller/${item.posted_by}`}>{item.posted_by}</Link>
                        </div>
                      </div>

                      {/* Row 4: Date Posted */}
                      <div className="fp-date">{new Date(item.date_posted).toLocaleDateString()}</div>

                      {/* Row 5: Categories (pill with icon + name) */}
                      <div className="item-categories">
                        <span className="meta-label">Categories:</span>
                        <div className="category-list">
                          {item.categories.map(c => (
                            <span key={c.name} className="category-item">
                              <img 
                                src={`https://api.iconify.design/${c.icon_key}.svg`}
                                alt=""
                                className="category-icon-small"
                              />
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Row 6: Rating */}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
