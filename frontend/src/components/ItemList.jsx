import React, { useEffect, useState } from "react";

/**
 * props.onReview? potential future callback to add review UI per item
 */
export default function ItemList() {
    // export default function ItemList({ onReview }) {
    const [items, setItems] = useState([]);

    const checkAuth = resp => {
        if (resp.status === 401) {
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        return resp;
    };

    const loadItems = async () => {
        try {
            const resp = await fetch('/api/items/list_items', {
                credentials: 'include'
            });
            checkAuth(resp);
            const data = await resp.json();
            setItems(data);
        } catch (err) {
            console.error('Failed to load items:', err);
        }
    };

    useEffect(() => {
        // Initial load
        loadItems();
        // Reload whenever an itemCreated event occurs
        const onNew = () => loadItems();
        window.addEventListener('itemCreated', onNew);
        return () => window.removeEventListener('itemCreated', onNew);
    }, []);

    if (!items.length) {
        return <p>No items have been posted yet.</p>;
    }

    return (
        <div>
            <h2>Available Items</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {items.map(item => (
                    <li key={item.id}
                        style={{
                            border: '1px solid #ddd',
                            padding: '1rem',
                            marginBottom: '1rem',
                            borderRadius: '4px'
                        }}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <p>
                            <strong>Price:</strong> ${parseFloat(item.price).toFixed(2)}
                            <strong>Posted by:</strong> {item.posted_by}
                            <strong>Date:</strong> {new Date(item.date_posted).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Categories:</strong>{' '}
                            {item.categories.map(c => c.name).join(', ')}
                        </p>
                        <p>
                            <strong>Rating:</strong> {item.star_rating.toFixed(1)}/5{' '}
                            <span style={{ color: '#f5b301', fontSize: '1.2rem' }}>
                                {(() => {
                                    const full = Math.floor(item.star_rating);
                                    const half = item.star_rating % 1 >= 0.25 && item.star_rating % 1 < 0.75;
                                    const empty = 5 - full - (half ? 1 : 0);
                                    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
                                })()}
                            </span>{' '}
                            <strong>{item.review_count}</strong> {item.review_count === 1 ? 'review' : 'reviews'}
                        </p>
                        {/*
                // Later on in the project, we can render a <ReviewForm itemId={item.id} onSubmitted={…} />
                // here to choose Excellent/Good/Fair/Poor and add review remarks.
                */}
                    </li>
                ))}
            </ul>
        </div>
    );
}
