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
