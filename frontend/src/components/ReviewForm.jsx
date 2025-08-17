import React, { useState } from "react";
import '../styles/components/ReviewForm.css';

/**
 * BEAUTIFIED REVIEW FORM COMPONENT - CR440-106
 * 
 * Features:
 * - Clean, minimalist white design
 * - Button-based rating selection with hover effects and color coding
 * - Professional styling with excellent readability
 * - Responsive design for all screen sizes
 * 
 * Purpose: Allow users to submit reviews with beautiful, intuitive interface
 */
export default function ReviewForm({ itemId, onReviewSubmitted }) {
    const [score, setScore] = useState('Excellent');
    const [remark, setRemark] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredRating, setHoveredRating] = useState('');

    /**
     * Get rating info with colors
     */
    const getRatingInfo = (rating) => {
        const ratingMap = {
            'Excellent': { color: '#059669', bgColor: '#ecfdf5', borderColor: '#a7f3d0' },
            'Good': { color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#93c5fd' },
            'Fair': { color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#fde68a' },
            'Poor': { color: '#ef4444', bgColor: '#fef2f2', borderColor: '#fca5a5' }
        };
        return ratingMap[rating] || ratingMap['Excellent'];
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            const resp = await fetch(`/api/reviews/${itemId}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score, remark })
            });
            const body = await resp.json();

            if (resp.ok) {
                setSuccess('✓ Review submitted successfully!');
                setRemark('');
                setScore('Excellent');
                
                if (typeof onReviewSubmitted === 'function') {
                    onReviewSubmitted(itemId);
                }
            } else {
                setError(body.message || 'Failed to submit review');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="review-form">
            <div className="review-form-controls">
                <div className="rating-select-wrapper">
                    <label className="rating-label">Rating:</label>
                    <div className="rating-buttons-container">
                        {['Excellent', 'Good', 'Fair', 'Poor'].map((rating) => {
                            const ratingInfo = getRatingInfo(rating);
                            const isSelected = score === rating;
                            const isHovered = hoveredRating === rating;
                            
                            return (
                                <button
                                    key={rating}
                                    type="button"
                                    className={`rating-button ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                                    onClick={() => setScore(rating)}
                                    onMouseEnter={() => setHoveredRating(rating)}
                                    onMouseLeave={() => setHoveredRating('')}
                                    style={{
                                        '--rating-color': ratingInfo.color,
                                        '--rating-bg': ratingInfo.bgColor,
                                        '--rating-border': ratingInfo.borderColor,
                                        ...(isSelected && {
                                            backgroundColor: ratingInfo.bgColor,
                                            borderColor: ratingInfo.borderColor,
                                            color: ratingInfo.color
                                        }),
                                        ...(isHovered && !isSelected && {
                                            backgroundColor: ratingInfo.bgColor,
                                            borderColor: ratingInfo.borderColor,
                                            color: ratingInfo.color
                                        })
                                    }}
                                >
                                    <span className="rating-text">{rating}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="review-submit-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="btn-loading"></span>
                            Submitting...
                        </>
                    ) : (
                        <>
                            Submit Review
                        </>
                    )}
                </button>
            </div>
            
            <div>
                <textarea
                    value={remark}
                    onChange={e => setRemark(e.target.value)}
                    placeholder="Share your experience with this item... (optional)"
                    className="review-textarea"
                />
            </div>
            
            {error && (
                <div className="review-message error">
                    {error}
                </div>
            )}
            {success && (
                <div className="review-message success">
                    {success}
                </div>
            )}
        </form>
    );
}