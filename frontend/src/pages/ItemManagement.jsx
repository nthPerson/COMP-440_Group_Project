import React from 'react';
import Navbar from '../components/Navbar';
import NewItemForm from '../components/NewItemForm';
import ItemList from '../components/ItemList';
import '../styles/global.css';
import '../styles/layout/HomePage.css';
import '../styles/components/ItemManagement.css';

export default function ItemManagement() {
  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title">Item Management</h1>
          </div>
          <div className="item-management">
            <div className="item-management-layout">
              <div className="item-form-section">
                <NewItemForm />
              </div>
              <div className="item-list-section">
                <ItemList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}