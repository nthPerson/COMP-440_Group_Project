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


  useEffect(() => {
    async function fetchUserProfileAndItems() {
      try {
        const [profileRes, myItemsRes] = await Promise.all([
          axios.get("/api/users/profile"),
          axios.get("/api/items/my_items")
        ]);

        setUserData(profileRes.data);
        setForm({
          firstName: profileRes.data.first_name || "",
          lastName: profileRes.data.last_name || "",
          username: profileRes.data.username || "",
          email: profileRes.data.email || ""
        });

        setMyItems(myItemsRes.data);
      } catch (err) {
        console.error("Failed to fetch profile or items", err);
        setStatus({ msg: "Failed to load profile or items", type: "error" });
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
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1>User Profile</h1>
          <form onSubmit={handleSave} className="profile-form">
            <label>
              First Name
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Last Name
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Username
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
              />
            </label>
            <button type="submit">Save Profile</button>

            {status.msg && (
              <p
                className={
                  status.type === "success"
                    ? "status-success"
                    : "status-error"
                }
              >
                {status.msg}
              </p>
            )}
          </form>
          <div className="items-section">
            <h2>My Items</h2>
            <div className="item-grid-container">
              {myItems.length === 0 ? (
                <p>You haven’t posted any items yet.</p>
              ) : (
                <>
                  <div className="item-card-grid">
                    {currentItems.map(item => (
                      <ItemCard key={item.id} item={item} />
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
                </>
              )}
            </div>
          </div>


        </div>
      </div>
    </>
  );
}