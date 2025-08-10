import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/ItemCard.css';

export default function ItemCard({ item }) {
  return (
    <div className="item-card">
      {/* Item Image / Icon (matches FrontPage & ItemList behavior) */}
      <div className="item-image-container">
        <img
          className="item-thumbnail"
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
      </div>

      <div className="item-content">
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
            <Link to={`/seller/${item.posted_by}`} className="meta-value seller-link">{item.posted_by}</Link>
          </div>
        </div>

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
                {c.icon_key && (
                  <img
                    src={`https://api.iconify.design/${c.icon_key}.svg`}
                    alt=""
                    className="category-icon-small"
                  />
                )}
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
