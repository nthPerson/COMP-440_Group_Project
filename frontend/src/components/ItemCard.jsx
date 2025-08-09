import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/ItemManagement.css';

export default function ItemCard({ item }) {
  return (
    <div className="item-card">
      <div className="item-header">
        <h3 className="item-title">
          <Link to={`/item/${item.id}`}>{item.title}</Link>
        </h3>
      </div>
      <p>{item.description}</p>
      <div className="item-meta">
        <div className="item-meta-item">
          <span className="meta-label">Price</span>
          <span className="meta-value">${parseFloat(item.price).toFixed(2)}</span>
        </div>
        <div className="item-meta-item">
          <span className="meta-label">Date</span>
          <span className="meta-value">{new Date(item.date_posted).toLocaleDateString()}</span>
        </div>
        <div className="item-meta-item">
          <span className="meta-label">Seller</span>
          <span className="meta-value">{item.posted_by}</span>
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
    </div>
  );
}
