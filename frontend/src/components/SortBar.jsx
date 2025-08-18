import React, { useState } from 'react';
import '../styles/components/SortBar.css';

export default function SortBar({ onSortChange }) {
    const [open, setOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('Posted: Newest to Oldest'); //default state because thats how we rendered the SR page

    const options = [
        {value: 'date-desc', label: 'Posted: Newest to Oldest'},
        {value: 'date-asc', label: 'Posted: Oldest to Newest'},
        {value: 'price-desc', label: 'Price: High to Low'},
        {value: 'price-asc', label: 'Price: Low to High'},  
    ];

    const handleClick = (option) => {
        setSelectedLabel(option.label);
        if (onSortChange) {
            onSortChange(option.value);
        }
        setOpen(false);
    }
 
  return (
    <div className="sort-bar"
      onMouseEnter={() => setOpen(true)}  //open while hovering
      onMouseLeave={() => setOpen(false)} //close when leaving
    >
      <span className="sort-label">Sort By: </span>
      <button className="sort-toggle">
        {selectedLabel}
      </button>
      {open && (
        <ul className="sort-options">
          {options.map(opt => (
            <li key={opt.value} onClick={() => handleClick(opt)}>
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
