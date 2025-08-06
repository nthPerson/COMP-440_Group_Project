
import React, { useEffect, useState } from 'react';
// useLocation gives us access to the current URL (including query string)
// useNavigate lets us redirect (e.g. to item detail page)
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchResultsList from '../components/SearchResultsList';
import '../styles/components/SearchResults.css';

/*
  This isn’t really a "page"—it’s the interface shown when you type into the
  search bar and hit Enter (or click a category). It:
    • Reads the `?category=` query param
    • Tries the server-side category search endpoint
    • Falls back to a client-side title filter if needed
    • Renders either a message or a list of items via <ItemList>
*/

// Hook: parse URL query string into a URLSearchParams object
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const navigate   = useNavigate();                        // for redirects
  const query      = useQuery();                          // to read `?category=`
  const searchTerm = query.get('category')?.trim() || ''; // the user’s term

  // Local component state
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Fetch & filter logic whenever the searchTerm changes
  useEffect(() => {
    if (!searchTerm) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    // 1) Try server-side category search
    fetch(`/api/items/search?category=${encodeURIComponent(searchTerm)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Search API error (${res.status})`);
        return res.json();
      })
      .then(data => {
        if (data.item_count > 0) {
          // category hits
          setItems(data.items);
        } else {
          // 2) Fallback: fetch all items and filter by title
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
        {/* Prompt when no term provided */}
        {!searchTerm && <p>Please enter something to search.</p>}

        {/* Once a term exists, show this block */}
        {searchTerm && (
          <>
            <h1>Search Results for "{searchTerm}"</h1>

            {loading && <p>Loading results...</p>}
            {error   && <p className="error">{error}</p>}

            {/* No matches */}
            {!loading && !error && items.length === 0 && (
              <p>Search results for "{searchTerm}" not found or doesn’t exist.</p>
            )}

            {/* Render items */}
            {!loading && !error && items.length > 0 && (
              <SearchResultsList items={items} />
            )}
          </>
        )}
      </div>
    </>
  );
}
