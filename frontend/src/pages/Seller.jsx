import React, { useState, useEffect } from 'react';
import { useParams }        from 'react-router-dom';
import Navbar               from '../components/Navbar';
import ItemCard             from '../components/ItemCard';
import ReviewCard           from '../components/ReviewCard';
import '../styles/global.css';
import axios                from 'axios';

export default function Seller() {
  const { username } = useParams();
  const [seller, setSeller]         = useState(null);
  const [items, setItems]           = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [followers, setFollowers]   = useState([]);         // ← added
  const [followingList, setFollowingList] = useState([]);
  const [isFollowing, setIsFollowing]     = useState(false);
  const [activeTab, setActiveTab]         = useState('items');


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
              <button className="follow-btn" onClick={toggleFollow}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          </div>

          {/* Seller Stats */}
          <div className="seller-stats">
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
              className={`follow-tab ${activeTab==='items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
            >
              Items
            </button>
            <button
              className={`follow-tab ${activeTab==='reviews'?'active':''}`}
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
            <div className="review-list">
              {reviews.length === 0
                ? <p>No reviews yet.</p>
                : reviews.map(r => (
                    <ReviewCard key={r.id} review={r} />
                  ))
              }
            </div>
          )}
        </div>
      </div>
    </>
  );
}
