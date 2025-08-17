import React from 'react';

/**
 * ENHANCED REVIEW CARD COMPONENT
 * 
 * Features:
 * - Color-coded rating scores (Excellent=Green, Good=Blue, Fair=Orange, Poor=Red)
 * - Clean, professional styling
 * - Consistent with ReviewForm design
 * - Responsive layout
 */
export default function ReviewCard({ review }) {
  /**
   * Get CSS class for color-coded review score
   */
  const getScoreClass = (score) => {
    const normalizedScore = score.toLowerCase();
    switch (normalizedScore) {
      case 'excellent':
        return 'excellent';
      case 'good':
        return 'good';
      case 'fair':
        return 'fair';
      case 'poor':
        return 'poor';
      default:
        return 'excellent'; // Default fallback
    }
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <strong>{review.user}</strong>
        <span className={`review-score ${getScoreClass(review.score)}`}>
          {review.score}
        </span>
      </div>
      {review.remark && (
        <p className="review-remark">{review.remark}</p>
      )}
      <div className="review-date">
        {new Date(review.date).toLocaleDateString()}
      </div>
    </div>
  );
}