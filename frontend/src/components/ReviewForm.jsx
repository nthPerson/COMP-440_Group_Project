import React, { useState } from "react";
import '../styles/components/ReviewForm.css';

/**
 * ENHANCED REVIEW FORM COMPONENT
 * 
 * Features:
 * - Color-coded rating dropdown (Excellent=Green, Good=Blue, Fair=Orange, Poor=Red)
 * - Professional submit button with gradient and hover effects
 * - Enhanced form styling with better spacing and typography
 * - Improved success/error message display
 * 
 * Purpose: Allow users to submit reviews with intuitive, professional interface
 */
export default function ReviewForm({ itemId, onReviewSubmitted }) {
    const [score, setScore] = useState('Excellent');
    const [remark, setRemark] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Get CSS class for color-coded rating select
     */
    const getRatingClass = (rating) => {
        return rating.toLowerCase();
    };

    /**
     * Handle form submission with enhanced UX
     */
    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            // POST payload for backend request
            const resp = await fetch(`/api/reviews/${itemId}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score, remark })
            });
            const body = await resp.json();

            if (resp.ok) {
                // Reset fields and show success
                setSuccess('✓ Review submitted successfully!');
                setRemark('');
                setScore('Excellent');
                
                // Notify parent component to reload reviews/stats
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
                    <select 
                        value={score} 
                        onChange={e => setScore(e.target.value)}
                        className={`rating-select ${getRatingClass(score)}`}
                    >
                        <option value="Excellent"> Excellent</option>
                        <option value="Good"> Good</option>
                        <option value="Fair"> Fair</option>
                        <option value="Poor"> Poor</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    className="review-submit-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading"></span>
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
            
            {/* Enhanced Status Messages */}
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

