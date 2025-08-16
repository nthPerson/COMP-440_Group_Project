import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ItemCard from  '../components/ItemCard';

import '../styles/pages/SearchResults.css';
import '../styles/global.css';
// Spinner styles are imported within the component
import '../styles/components/ItemList.css';
import '../styles/components/ItemCard.css';
import Spinner from '../components/LoadingSpinner';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query      = useQuery();
  const searchTerm = query.get('category')?.trim() || '';

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  //Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Number of items to display per page

  useEffect(() => {
    if (!searchTerm) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    fetch(`/api/items/search?category=${encodeURIComponent(searchTerm)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Search API error (${res.status})`);
        return res.json();
      })
      .then(data => {
        if (data.item_count > 0) {
          setItems(data.items);
        } else {
          return fetch('/api/items/list_items')
            .then(res2 => {
              if (!res2.ok) throw new Error(`List-items API error (${res2.status})`);
              return res2.json();
            })
            .then(allItems => {
              const matched = allItems.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase())
              );
              setItems(matched);
            });
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchTerm]);

  //Reset to first page when new search results load
  useEffect(() => {
    setCurrentPage(1);
  }, [items]); //OR SEARCH TERM???

  //Pagination calculations
  const totalPages = Math.ceil(items.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
      <div className="search-results-page">
        {!searchTerm && <p>Please enter something to search.</p>}

        {searchTerm && (
          <>
            <h1>Search Results for "{searchTerm}"</h1>

            {loading && <Spinner text="Loading results..." />}
            {error   && <p className="error">{error}</p>}

            {!loading && !error && items.length === 0 && (
              <p>Search results for "{searchTerm}" not found or doesn't exist.</p>
            )}

            {/* Disable collapse toggle for search results and RESULTS GRID */}
            {!loading && !error && items.length > 0 && (
              <div className="items-container">
                <div className="item-card-grid">
                  {currentItems.map(item => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Pagination controls */}
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
          </>
        )}
        </div>
      </div>
    </>
  );
}