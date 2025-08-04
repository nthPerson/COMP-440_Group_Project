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

  useEffect(() => {
    fetch('/api/items/list_items')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(() => {});
  }, []);

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
                    <li key={item.id} className="item-card">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
