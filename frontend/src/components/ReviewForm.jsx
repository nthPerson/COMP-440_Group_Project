import React, { useState } from "react";


export default function ReviewForm({ itemId, onReviewSubmitted }) {
    const [score, setScore] = useState('Excellent');
    const [remark, setRemark] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');

        // POST payload for backend request
        const resp = await fetch(`/api/reviews/${itemId}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score, remark })
        });
        const body = await resp.json();

        if (resp.ok) {
            // Reset fields and stuff
            setSuccess('Review Submitted!');
            setRemark('');
            setScore('Excellent');
            // Notify parent component to reload reviews/stats/etc.
            if (typeof onReviewSubmitted === 'function') {
                onReviewSubmitted(itemId);
            }
        } else {
            setError(body.message || 'Failed to submit');
        }
    };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1em'}}>
      <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
        <label>
          Rating:{' '}
          <select value={score} onChange={e => setScore(e.target.value)}>
            <option>Excellent</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
        </label>

        <button type="submit" style={{ padding: '0.25em 0.5em' }}>
          Submit
        </button>
      </div>
      <div style={{ marginTop: '0.5em' }}>
        <textarea
          value={remark}
          onChange={e => setRemark(e.target.value)}
          placeholder="Your remarks..."
          rows={2}
          style={{ width: '100%' }}
        />
      </div>
      {error   && <p style={{ color: 'crimson' }}>{error}</p>}
      {success && <p style={{ color: 'green'   }}>{success}</p>}
    </form>
  );
}

