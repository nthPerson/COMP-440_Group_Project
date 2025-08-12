import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useItemsList } from '../contexts/ItemsListContext';
import Navbar from '../components/Navbar';
import '../styles/global.css';
import '../styles/components/ItemList.css';
import '../styles/components/ItemCard.css';
import '../styles/pages/FrontPage.css';
import ItemCard from '../components/ItemCard';

export default function FrontPage() {
  // const [items, setItems] = useState([]);
  const { items, isLoading, error } = useItemsList();

  // ItemsList context now handles loading items list
  // useEffect(() => {
  //   fetch('/api/items/list_items')
  //     .then(res => res.json())
  //     .then(data => setItems(data))
  //     .catch(() => {});
  // }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container front-page">
        <div className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title">Items</h1>
          </div>
          <div className="item-management">
            <div className="item-list-section">
              {isLoading && items.length === 0 ? (
                <div className="loading-container">
                  <p>Loading items...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p className="error-message">{error}</p>
                </div>
              ) : (
                <div className="items-container">
                  <div className="item-card-grid">
                    {items.map(item => (
                      <ItemCard item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
