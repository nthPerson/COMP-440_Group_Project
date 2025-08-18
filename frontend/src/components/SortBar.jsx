import React, { useState } from 'react';
import '../styles/components/SortBar.css';

export default function SortBar({ onSortChange }) {
  const [open, setOpen] = useState(false);

  const handleClick = (option) => {
    if (onSortChange) {
      onSortChange(option);
    }
    setOpen(false);
  };

  return (
    <div className="sort-bar">
      <button className="sort-toggle" onClick={() => setOpen(o => !o)}>
        Sort
      </button>
      {open && (
        <ul className="sort-options">
          <li onClick={() => handleClick('date-asc')}>Posted: Oldest to Newest</li>
          <li onClick={() => handleClick('price-desc')}>Price: High to Low</li>
          <li onClick={() => handleClick('price-asc')}>Price: Low to High</li>
        </ul>
      )}
    </div>
  );
}