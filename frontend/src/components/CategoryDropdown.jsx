import React, { useState, useEffect, useRef } from 'react';

export default function CategoryDropdown({ selectedCategories, onCategoriesChange }) {
  const [allCategories, setAllCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Load categories from API
  useEffect(() => {
    fetch('/api/items/categories')
      .then(res => res.json())
      .then(data => {
        setAllCategories(data.categories);
        setFilteredCategories(data.categories);
      })
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    const filtered = allCategories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedCategories.includes(cat.name)
    );
    setFilteredCategories(filtered);
  }, [searchTerm, allCategories, selectedCategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleCategorySelect = (categoryName) => {
    const newCategories = [...selectedCategories, categoryName];
    onCategoriesChange(newCategories);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current.focus();
  };

  const handleRemoveCategory = (categoryName) => {
    const newCategories = selectedCategories.filter(cat => cat !== categoryName);
    onCategoriesChange(newCategories);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCategories.length > 0) {
        handleCategorySelect(filteredCategories[0].name);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="category-dropdown" ref={dropdownRef}>
      <div className="selected-categories">
        {selectedCategories.map(category => (
          <span key={category} className="category-tag selected">
            {category}
            <button
              type="button"
              onClick={() => handleRemoveCategory(category)}
              className="remove-category"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <div className="category-input-container">
        <input
          ref={inputRef}
          type="text"
          placeholder={selectedCategories.length > 0 ? "Add another category..." : "Search and select categories..."}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="form-input category-search-input"
        />
        
        {isOpen && filteredCategories.length > 0 && (
          <div className="category-dropdown-menu">
            {filteredCategories.slice(0, 10).map(category => (
              <button
                key={category.name}
                type="button"
                className="category-option"
                onClick={() => handleCategorySelect(category.name)}
              >
                <img 
                  src={`https://api.iconify.design/${category.icon_key}.svg`}
                  alt=""
                  className="category-icon"
                />
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
