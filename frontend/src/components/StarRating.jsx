import React from 'react';

export default function StarRating({ rating, reviewCount }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
        {rating.toFixed(1)}/5
      </div>
      <div style={{ fontSize: '1.5rem', color: '#000' }}>
        {'★'.repeat(fullStars)}
        {halfStar && '☆'}
        {'☆'.repeat(emptyStars)}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#333' }}>
        {reviewCount} REVIEW{reviewCount !== 1 ? 'S' : ''}
      </div>
    </div>
  );
}
