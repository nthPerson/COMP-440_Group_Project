import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import axios from "axios";
import '../styles/global.css';
import '../styles/layout/HomePage.css';
import ItemCard from '../components/ItemCard';

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: ""
  });
  const [status, setStatus] = useState({ msg: "", type: "" });
  const [myItems, setMyItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = myItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(myItems.length / itemsPerPage);
  const [showMyItems, setShowMyItems] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(true);

  const handleFollow = async (username) => {
    try {
      await axios.post(`/api/follow/${username}`);
      setFollowing((prev) => [...prev, { username }]);
    } catch (err) {
      console.error("Failed to follow user", err);
    }
  };
  const handleUnfollow = async (username) => {
    try{
      await axios.delete(`/api/follow/${username}`);
      setFollowing((prev) => prev.filter(user => user.username !== username));  
    } catch (err) {
      console.error("Failed to unfollow user", err);
    }
  };

  useEffect(() => {
    async function fetchUserProfileAndItems() {
      try {
        const [profileRes, myItemsRes, followersRes, followingRes] = await Promise.all([
          axios.get("/api/users/profile"),
          axios.get("/api/items/my_items"),
          axios.get("/api/follow/followers"),
          axios.get("/api/follow/following")
        ]);

        setUserData(profileRes.data);
        setForm({
          firstName: profileRes.data.first_name || "",
          lastName: profileRes.data.last_name || "",
          username: profileRes.data.username || "",
          email: profileRes.data.email || ""
        });

        setMyItems(myItemsRes.data);

        setFollowers(followersRes.data);
        setFollowing(followingRes.data);
      } catch (err) {
        console.error("Failed to fetch profile or items", err);
        setStatus({ msg: "Failed to load profile or items", type: "error" });
      } finally {
        setIsLoadingFollowers(false);
        setIsLoadingFollowing(false);
      }
    }

    fetchUserProfileAndItems();
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("first_name", form.firstName);
      formData.append("last_name", form.lastName);
      formData.append("username", form.username);
      formData.append("email", form.email);

      await axios.post("/api/users/profile", formData);

      setStatus({ msg: "Profile updated successfully!", type: "success" });
    } catch (err) {
      console.error("Profile update failed", err);
      setStatus({ msg: "Failed to update profile", type: "error" });
    }
  };

  if (!userData) return <p>Loading profile...</p>;

  return (
    <>
      <Navbar />
      <div className="dashboard-content">
        <div className="new-item-form">

          <h1>User Profile</h1>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <input
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <input
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleInputChange}
                className="form-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn-add-item">
              Save Profile
            </button>
          </form>

          <div className="follow-section">
            <div className="follow-list">
              <h3>Followers</h3>
    {isLoadingFollowers ? (
      <p>Loading...</p>
    ) : (
      <ul>
        {followers.map(user => (
          <li key={user.username}>
            {user.username}
          </li>
        ))}
      </ul>
    )}
  </div>

  <div className="follow-list">
    <h3>Following</h3>
    {isLoadingFollowing ? (
      <p>Loading...</p>
    ) : (
      <ul>
        {following.map(user => (
          <li key={user.username}>
            {user.username}
            <button onClick={() => handleUnfollow(user.username)}>Unfollow</button>
          </li>
        ))}
      </ul>
    )}
            </div>
          </div>

          <div className="item-list-section">
            <div className="item-list-header">
              <div className="item-list-title-group">
                <h2 className="item-list-title">My Items</h2>
                <span className="item-count">{myItems.length}</span>
              </div>

              <button
                className="items-collapse-toggle"
                onClick={() => setShowMyItems(!showMyItems)}
              >
                <span className="collapse-icon">{showMyItems ? '▼' : '▶'}</span>
                {showMyItems ? 'Hide Items' : 'Show Items'}
              </button>
            </div>

            <div className={`items-container ${showMyItems ? 'expanded' : 'collapsed'}`}>
              <div className="item-card-grid">
                {currentItems.map(item => (
                  <div key={item.id} className="item-card">
                    <ItemCard item={item} />
                  </div>
                ))}
              </div>

              {totalPages > 0 && (
                <div className="pagination-controls">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={currentPage === index + 1 ? 'active-page' : ''}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}