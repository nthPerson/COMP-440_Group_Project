import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/components/SearchResults.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery();
  const searchTerm = query.get('category')?.trim() || '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('gallery');

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

  const renderStars = rating => {
    const full = Math.floor(rating);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  };

  return (
    <>
      <Navbar />
      <div className="search-results-page">
        {!searchTerm && <p>Please enter something to search.</p>}

        {searchTerm && (
          <>
            <div className="results-top-bar">
              <h1>Search Results for "{searchTerm}"</h1>
              {items.length > 0 && !loading && !error && (
                <div className="view-toggle">
                  <button
                    className={viewMode === 'gallery' ? 'active' : ''}
                    onClick={() => setViewMode('gallery')}
                  >
                    Gallery
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </button>
                </div>
              )}
            </div>

            {loading && <p>Loading results...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && items.length === 0 && (
              <p>Search results for "{searchTerm}" not found or doesn’t exist.</p>
            )}

            {!loading && !error && items.length > 0 && (
              <>
                {viewMode === 'gallery' ? (
                  <div className="results-grid">
                    {items.map(item => (
                      <div key={item.id} className="result-card">
                        <h3 className="item-title">{item.title}</h3>
                        <p className="item-description">
                          {item.description.length > 100
                            ? `${item.description.substring(0, 100)}...`
                            : item.description}
                        </p>
                        <div className="card-meta">
                          <span className="item-price">
                            ${parseFloat(item.price).toFixed(2)}
                          </span>
                          <span className="item-rating">
                            {renderStars(item.star_rating)} {item.star_rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="category-badges">
                          {item.categories.map(cat => (
                            <span key={cat.name} className="category-badge">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="results-table-container">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Description</th>
                          <th>Price</th>
                          <th>Posted By</th>
                          <th>Date</th>
                          <th>Rating</th>
                          <th>Categories</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr key={item.id} className="result-row">
                            <td className="item-title"><strong>{item.title}</strong></td>
                            <td className="item-description">
                              {item.description.length > 100
                                ? `${item.description.substring(0, 100)}...`
                                : item.description}
                            </td>
                            <td className="item-price">${parseFloat(item.price).toFixed(2)}</td>
                            <td className="item-posted-by">{item.posted_by}</td>
                            <td className="item-date">
                              {new Date(item.date_posted).toLocaleDateString()}
                            </td>
                            <td className="item-rating">
                              {renderStars(item.star_rating)} {item.star_rating.toFixed(1)} ({item.review_count})
                            </td>
                            <td className="item-categories">
                              <div className="category-badges">
                                {item.categories.map(cat => (
                                  <span key={cat.name} className="category-badge">
                                    {cat.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
