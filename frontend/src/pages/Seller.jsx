import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import '../styles/global.css';
import '../styles/pages/Seller.css';
import axios from 'axios';
import '../styles/components/SearchInterface.css';


export default function Seller() {
  const { username } = useParams();
  const [seller, setSeller] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [followers, setFollowers] = useState([]);         // ← added
  const [followingList, setFollowingList] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('items');


  useEffect(() => {
    async function fetchAll() {
      try {
        const [
          profileRes,
          itemsRes,
          reviewsRes,
          followersRes,
          followingRes
        ] = await Promise.all([
          axios.get(`/api/users/${username}`),
          axios.get(`/api/items/user/${username}`),
          axios.get(`/api/reviews/user/${username}`),
          axios.get(`/api/follow/followers`),
          axios.get(`/api/follow/following`),
        ]);

        setSeller(profileRes.data);
        setItems(itemsRes.data);
        setReviews(reviewsRes.data);
        setFollowers(followersRes.data);
        setFollowingList(followingRes.data);
        setIsFollowing(followingRes.data.some(u => u.username === username));
      } catch (e) {
        console.error('Error fetching seller data:', e);
      }
    }
    fetchAll();
  }, [username]);

  if (!seller) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-content">
            <p>Loading seller profile…</p>
          </div>
        </div>
      </>
    );
  }

  const toggleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.delete(`/api/follow/${username}`);
        setFollowingList(followingList.filter(u => u.username !== username));
      } else {
        await axios.post(`/api/follow/${username}`);
        setFollowingList([...followingList, { username }]);
      }
      setIsFollowing(!isFollowing);
    } catch (e) {
      console.error('Error toggling follow:', e);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Seller Header */}
          <div className="seller-header">
            <div className="seller-avatar">
              {/* optionally: <img src={seller.avatarUrl} alt="" /> */}
            </div>
            <div className="seller-info">
              <h1>{seller.username}</h1>
              <button className="search-button" onClick={toggleFollow}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          </div>

          {/* Seller Stats */}
          <div className="seller-stats-row">
            <div className="stat-block">
              <div className="stat-label">Sales</div>
              <div className="stat-value">{items.length}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Rating</div>
              <div className="stat-value">
                {(seller.star_rating ?? 0).toFixed(1)}/5
              </div>
            </div>
            {seller.joined_date && (
              <div className="stat-block">
                <div className="stat-label">Joined</div>
                <div className="stat-value">
                  {new Date(seller.joined_date).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="follow-tabs">
            <button
              className={`follow-tab ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
            >
              Items
            </button>
            <button
              className={`follow-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>

          {/* Tab Panels */}
          {activeTab === 'items' && (
            <div className="item-card-grid">
              {items.length === 0
                ? <p>No items for sale.</p>
                : items.map(it => (
                  <div key={it.id} className="item-card">
                    <ItemCard item={it} />
                  </div>
                ))
              }
            </div>
          )}
          {activeTab === 'reviews' && (
  <div className="reviews-section">
    <div className="reviews-header">
      <h3 className="section-title">Customer Reviews</h3>
      <span className="reviews-count">
        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
      </span>
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
                    <span
                      className={`rating-badge rating-${review.score.toLowerCase()}`}
                    >
                      {review.score}
                    </span>
                  </div>
                </div>
              </div>
              <span className="review-date">
                {review.date
                  ? new Date(review.date).toLocaleDateString()
                  : 'Recently'}
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
        <p className="no-reviews-text">
          Be the first to share your experience with this seller!
        </p>
      </div>
    )}
  </div>
)}


        </div>
      </div>
    </>
  );
}
