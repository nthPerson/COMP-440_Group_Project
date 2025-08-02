import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/global.css';

export default function UserProfile() {
  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1>User Profile</h1>
          <p>TODO: Implement profile details and picture upload.</p>
        </div>
      </div>
    </>
  );
}
