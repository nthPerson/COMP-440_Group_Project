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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // wherever your full items array lives (e.g., items, allItems, searchResults)
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => { setCurrentPage(1); }, [items]);

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
                    {currentItems.map(item => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="pagination-controls">
                      <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`pagination-button ${currentPage === i + 1 ? 'active-page' : ''}`}
                        >
                          {i + 1}
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
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
