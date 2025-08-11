import React from 'react';


export default function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <div className="review-header">
        <strong>{review.user}</strong>
        <span className="review-score">{review.score}</span>
      </div>
      {review.remark && <p className="review-remark">{review.remark}</p>}
      <div className="review-date">
        {new Date(review.date).toLocaleDateString()}
      </div>
    </div>
  );
}
