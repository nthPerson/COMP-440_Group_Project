import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from "axios";
import '../styles/global.css';
import '../styles/pages/UserProfile.css';
import '../styles/components/ItemList.css';
import '../styles/components/ItemCard.css';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Avatar from '../components/Avatar';

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
  const [activeTab, setActiveTab] = useState('followers');
  const [showConnections, setShowConnections] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [avatarUploadMethod, setAvatarUploadMethod] = useState('url'); // 'url' | 'file'
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState('');


  const onAvatarFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setAvatarFile(f);
    setAvatarError('');
  };

  const submitAvatar = async (e) => {
    e.preventDefault();
    setAvatarSaving(true);
    setAvatarError('');
    try {
      if (avatarUploadMethod === 'file' && avatarFile) {
        const fd = new FormData();
        fd.append('image', avatarFile);
        const res = await axios.put('/api/users/me/avatar', fd, { withCredentials: true });
        setAvatarUrl(res.data?.profile_image_url || '');
      } else {
        const url = avatarUrlInput.trim();
        const res = await axios.put('/api/users/me/avatar', { image_url: url }, { withCredentials: true });
        setAvatarUrl(res.data?.profile_image_url || '');
      }
      setShowAvatarEditor(false);
      setAvatarFile(null);
      setAvatarUrlInput('');
    } catch (err) {
      console.error('Failed to update avatar', err);
      setAvatarError('Failed to update profile image. Please try another image.');
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleFollow = async (username) => {
    try {
      await axios.post(`/api/follow/${username}`);
      setFollowing((prev) => [...prev, { username }]);
    } catch (err) {
      console.error("Failed to follow user", err);
    }
  };
  const handleUnfollow = async (username) => {
    try {
      await axios.delete(`/api/follow/${username}`);
      setFollowing((prev) => prev.filter(user => user.username !== username));
    } catch (err) {
      console.error("Failed to unfollow user", err);
    }
  };
  const handleRemoveFollower = async (username) => {
    try {
      await axios.delete(`/api/follow/remove_follower/${username}`);
      setFollowers((prev) => prev.filter(user => user.username !== username));
    } catch (err) {
      console.error("Failed to remove follower", err);
    }
  };

  useEffect(() => {
    async function fetchUserProfileAndItems() {
      try {
        const [profileRes, myItemsRes, followersRes, followingRes] = await Promise.all([
          axios.get("/api/users/profile"),
          axios.get("/api/items/my_items"),
          axios.get("/api/follow/followers"),
          axios.get("/api/follow/following"),
          axios.get("/api/users/me", { withCredentials: true })  // fetch avatar
        ]);

        setUserData(profileRes.data);
        setForm({
          firstName: profileRes.data.first_name || "",
          lastName: profileRes.data.last_name || "",
          username: profileRes.data.username || "",
          email: profileRes.data.email || ""
        });

        // Accept either array or {items: [...]}
        const itemsPayload = Array.isArray(myItemsRes.data)
            ? myItemsRes.data
            : (myItemsRes.data?.items || []);
        setMyItems(itemsPayload);

        setFollowers(followersRes.data || []);
        setFollowing(followingRes.data || []);
        // setAvatarUrl(meRes.data?.profile_image_url || '');
        
        // setMyItems(myItemsRes.data);
        // setFollowers(followersRes.data);
        // setFollowing(followingRes.data);
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

  //if (!userData) return <p>Loading profile...</p>;
  if (!userData) return <LoadingSpinner text="Loading Profile..." />; //uses the loading spinner component

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">

          <div className="page-header">
            <h1 className="page-title">User Profile</h1>
            {/* Avatar with hover edit icon */}
            <div className="avatar-edit-wrapper">
              <Avatar src={avatarUrl} username={form.username} size={96} />
              <button
                type="button"
                className="avatar-edit-btn"
                title="Edit profile picture"
                onClick={() => setShowAvatarEditor(v => !v)}
              >
                ✎
              </button>
            </div>
            
            {/* <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Avatar src={avatarUrl} username={form.username} size={96} />
            </div> */}

            {/* Collapsible avatar editor */}
            {showAvatarEditor && (
              <form className="avatar-editor" onSubmit={submitAvatar}>
                {avatarError && <div className="alert alert-error">{avatarError}</div>}

                <div className="upload-method-selector">
                  <label>
                    <input
                      type="radio"
                      value="url"
                      checked={avatarUploadMethod === 'url'}
                      onChange={() => setAvatarUploadMethod('url')}
                    />
                    Image URL
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="file"
                      checked={avatarUploadMethod === 'file'}
                      onChange={() => setAvatarUploadMethod('file')}
                    />
                    Upload File
                  </label>
                </div>

                {avatarUploadMethod === 'url' ? (
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                  />
                ) : (
                  <input
                    type="file"
                    className="form-input file-input"
                    accept="image/*"
                    onChange={onAvatarFileChange}
                  />
                )}

                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button className="btn-add-item" type="submit" disabled={avatarSaving}>
                    {avatarSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="items-collapse-toggle"
                    onClick={() => setShowAvatarEditor(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}            

          </div>
          <div className="new-item-form">
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
          </div>

          <div className="item-management">
            <div className="item-management-layout">
              <div className="item-list-section">
                <div className="item-list-header">
                  <div className="item-list-title-group">
                    <h2 className="item-list-title">My Connections</h2>
                  </div>

                  <button
                    className="items-collapse-toggle"
                    onClick={() => setShowConnections(!showConnections)}
                  >
                    <span className="collapse-icon">{showConnections ? '▼' : '▶'}</span>
                    {showConnections ? 'Hide Connections' : 'Show Connections'}
                  </button>
                </div>

                <div className={`items-container ${showConnections ? 'expanded' : 'collapsed'}`}>
                  <div className="follow-tabs">
                    <button
                      className={`follow-tab ${activeTab === 'followers' ? 'active' : ''}`}
                      onClick={() => setActiveTab('followers')}
                    >
                      {followers.length} Followers
                    </button>

                    <button
                      className={`follow-tab ${activeTab === 'following' ? 'active' : ''}`}
                      onClick={() => setActiveTab('following')}
                    >
                      {following.length} Following
                    </button>
                  </div>

                  {activeTab === 'followers' && (
                    <ul className="follow-list">
                      {isLoadingFollowers ? (
                        <li>Loading...</li>
                      ) : (
                        followers.map(user => (
                          <li key={user.username}>
                            <Link to={`/seller/${user.username}`} className="follow-user-link">
                              {user.username}
                            </Link>
                            <button
                              className="unfollow-btn"
                              onClick={() => handleRemoveFollower(user.username)}
                            >
                              Remove
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}

                  {activeTab === 'following' && (
                    <ul className="follow-list">
                      {isLoadingFollowing ? (
                        <li>Loading...</li>
                      ) : (
                        following.map(user => (
                          <li key={user.username}>
                            <Link to={`/seller/${user.username}`} className="follow-user-link">
                              {user.username}
                            </Link>
                            <button
                              className="unfollow-btn"
                              onClick={() => handleUnfollow(user.username)}
                            >
                              Unfollow
                            </button>
                          </li>
                        ))
                      )}
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
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>

                  <div className="pagination-controls">
                    <button
                      className="pagination-button"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`pagination-button ${currentPage === index + 1 ? 'active-page' : ''}`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      className="pagination-button"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </>
  );
}