import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/global.css';
import '../styles/pages/Seller.css';

export default function Seller() {
  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1>Seller Page</h1>
          <p>TODO: Implement seller details and follower lists.</p>
        </div>
      </div>
    </>
  );
}
