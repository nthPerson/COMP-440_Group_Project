
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchResults from '../pages/SearchResults';
import '../styles/components/SearchInterface.css';
import CategoryAutocomplete from './CategoryAutoComplete';

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
      {/* MAIN SEARCH INPUT (with autocomplete) */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <CategoryAutocomplete
          categories={allCategories.map(c => c.name)}
          placeholder="Search items or categories…"
          value={searchCategory}
          onChange={(v) => setSearchCategory(v)}
          onSubmit={(val) => {
            setSearchCategory(val);
            if (val && val.trim()) navigate(`/search?category=${encodeURIComponent(val.trim())}`);
          }}
          maxSuggestions={8}
        />
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