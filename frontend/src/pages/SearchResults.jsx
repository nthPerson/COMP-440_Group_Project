import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ItemList from '../components/ItemList';
import '../styles/components/SearchResults.css';
import '../styles/components/LoadingSpinner.css'; //this for the loading spinner
import Spinner from '../components/LoadingSpinner';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const navigate   = useNavigate();
  const query      = useQuery();
  const searchTerm = query.get('category')?.trim() || '';

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

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

  return (
    <>
      <Navbar />

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

            {/* Disable collapse toggle for search results */}
            {!loading && !error && items.length > 0 && (
              <div className="items-container">
                <ItemList items={items} showCollapseToggle={false} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}