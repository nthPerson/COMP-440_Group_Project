import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({ rating, reviewCount }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#000' }}>
        {rating.toFixed(1)}/5
      </span>
      <span style={{ display: 'flex', gap: '2px', fontSize: '1rem', color: '#f5a623' }}>
        {Array(fullStars).fill().map((_, i) => <FaStar key={`full-${i}`} />)}
        {halfStar && <FaStarHalfAlt />}
        {Array(emptyStars).fill().map((_, i) => <FaRegStar key={`empty-${i}`} />)}
      </span>
      </div>
      
    </div>
  );
}
