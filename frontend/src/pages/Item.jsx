import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReviewForm from '../components/ReviewForm';
import '../styles/global.css';
import '../styles/layout/HomePage.css';
import '../styles/components/ItemManagement.css';
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
        <div className="dashboard-container"><p>Loading...</p></div>
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
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title">{item.title}</h1>
          </div>
          <p>{item.description}</p>
          <div className="item-meta">
            <div className="item-meta-item">
              <span className="meta-label">Price</span>
              <span className="meta-value">${parseFloat(item.price).toFixed(2)}</span>
            </div>
            <div className="item-meta-item">
              <span className="meta-label">Seller</span>
              <Link to={`/seller/${item.posted_by}`} className="meta-value">{item.posted_by}</Link>
            </div>
            <div className="item-meta-item">
              <span className="meta-label">Date</span>
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
          {similarItems.length > 0 && <SuggestedCarousel items={similarItems} />}

          <h3>Reviews</h3>
          <ul>
            {reviews.map(r => (
              <li key={r.id} className="review-item">
                <strong>{r.user}</strong> – {r.score}
                {r.remark && <span>: {r.remark}</span>}
              </li>
            ))}
          </ul>
          <ReviewForm itemId={id} onReviewSubmitted={handleReviewSubmitted} />
        </div>
      </div>
    </>
  );
}
