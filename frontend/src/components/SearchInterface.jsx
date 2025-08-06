
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchInterface() {
  const [searchCategory, setSearchCategory] = useState('');
  const [allCategories, setAllCategories]   = useState([]);
  const navigate = useNavigate();

  // Load available categories for autocomplete and quick buttons
  useEffect(() => {
    fetch('/api/items/categories')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load categories');
        return res.json();
      })
      .then(data => setAllCategories(data.categories))
      .catch(err => console.error(err));
  }, []);

  // When the form is submitted, navigate to /search?category=…
  const handleSearchSubmit = e => {
    e.preventDefault();
    const term = searchCategory.trim();
    if (term) {
      navigate(`/search?category=${encodeURIComponent(term)}`);
    }
  };

  return (
    <div className="search-interface">
      {/* MAIN SEARCH INPUT */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder="Search items or categories…"
          value={searchCategory}
          onChange={e => setSearchCategory(e.target.value)}
          list="categories-datalist"
        />
        <datalist id="categories-datalist">
          {allCategories.map(c => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      <div className="categories-preview">
        {allCategories.slice(0, 8).map(cat => (
          <button
            key={cat.name}
            className="category-tag"
            onClick={() =>
              navigate(`/search?category=${encodeURIComponent(cat.name)}`)
            }
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}