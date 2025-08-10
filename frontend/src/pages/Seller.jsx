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
  const [currentPage, setCurrentPage] = useState(1);
  const [showItems, setShowItems] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  
  const itemsPerPage = 6;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

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


  const totalReviews = items.reduce((sum, i) => sum + i.review_count, 0);
  const weightedStars = items.reduce(
    (sum, i) => sum + i.star_rating * i.review_count,
    0
  );
  const avgRating = totalReviews > 0 ? weightedStars / totalReviews : 0;


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
          <div className="seller-header seller-profile">
            <div className="seller-avatar">
              {/* optionally: <img src={seller.avatarUrl} alt="" /> */}
            </div>
            <div className="seller-info">
              <h1>{seller.username}</h1>
              <button className="search-button" onClick={toggleFollow} style={{
                alignSelf: 'center',
                margin: '0 auto 2rem'
              }}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          </div>

          {/* Seller Stats */}
          {/* —— STATS GRID —— */}
          <div className="seller-stats-grid">
            {/* Row 1: VALUES */}
            <div className="stat-value">{items.length}</div>
            <div className="stat-value">
              <span className="rating-stars">
                {(() => {
                  const full = Math.floor(avgRating);
                  const half = avgRating % 1 >= 0.25 && avgRating % 1 < 0.75;
                  const empty = 5 - full - (half ? 1 : 0);
                  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
                })()}
              </span>
              <span className="rating-info">{avgRating.toFixed(1)}/5</span>
            </div>

            {/* Row 2: LABELS */}
            <div className="stat-label">Sales</div>
            <div className="stat-label">Rating</div>
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
  <div className="item-list-section">
    <div className="item-list-header">
      <div className="item-list-title-group">
        <h2 className="item-list-title">Items</h2>
        <span className="item-count">{items.length}</span>
      </div>
     
    </div>

    <div className={`items-container ${showItems ? 'expanded' : 'collapsed'}`}>
      <div className="item-card-grid">
        {items.length === 0 ? (
          <p>No items for sale.</p>
        ) : (
          // paginate over currentItems, not all items
          currentItems.map(it => (
            <div key={it.id} className="item-card">
              <ItemCard item={it} />
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`pagination-button ${
                currentPage === i + 1 ? 'active-page' : ''
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{activeTab === 'reviews' && (
  <div className="item-list-section">
    <div className="item-list-header">
      <div className="item-list-title-group">
        <h2 className="item-list-title">Reviews</h2>
        <span className="item-count">{reviews.length}</span>
      </div>
    </div>

    <div className={`items-container ${showReviews ? 'expanded' : 'collapsed'}`}>
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
                        <span className={`rating-badge rating-${review.score.toLowerCase()}`}>
                          {review.score}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="review-date">
                    {review.date ? new Date(review.date).toLocaleDateString() : 'Recently'}
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
    </div>
  </div>
)}


        </div>
      </div>
    </>
  );
}
