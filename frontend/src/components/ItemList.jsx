import React, { useEffect, useState } from "react";
import { useItemsList } from "../contexts/ItemsListContext";
import ReviewForm from "./ReviewForm";

/**
 * ENHANCED ITEM LIST COMPONENT
 * 
 * Features:
 * - Collapsible item list for better space management
 * - Enhanced card design with better organization
 * - Improved item count display
 * - Better responsive design
 * 
 * Purpose: Display all available items with reviews in an organized, collapsible format
 */
export default function ItemList() {
    // const [items, setItems] = useState([]);
    const { items, isLoading, error, loadItemsList } = useItemsList();
    const [isCollapsed, setIsCollapsed] = useState(false); // Collapse state for space management

    /**
     * Authentication helper - redirects to login on 401 errors
     * Ensures item list only works for authenticated users
     */
    const checkAuth = resp => {
        if (resp.status === 401) {
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        return resp;
    };


    // TODO: Currently testing ItemsList context manager that implements this behavior
    // /**
    //  * Load all items from the backend API
    //  * Called on component mount and when new items are created
    //  */
    // const loadItems = async () => {
    //     try {
    //         const resp = await fetch('/api/items/list_items', {
    //             credentials: 'include'
    //         });
    //         checkAuth(resp);
    //         const data = await resp.json();
    //         setItems(data);
    //     } catch (err) {
    //         console.error('Failed to load items:', err);
    //     }
    // };

    const handleRefresh = () => {
        loadItemsList();
    };

    if (isLoading && items.length === 0) {
        return <div className="loading-container">Loading items...</div>;
    }

    if (error) {
        return (
        <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={handleRefresh} className="retry-button">
            Try Again
            </button>
        </div>
        );
    }

    /**
     * Set up event listeners and initial data loading
     * Listens for 'itemCreated' events to refresh the list
     */
    useEffect(() => {
        // loadItems();
        
        // Reload when new items are created
        const onNew = () => loadItemsList();
        window.addEventListener('itemCreated', onNew);
        
        // Cleanup event listener on unmount
        return () => window.removeEventListener('itemCreated', onNew);
    }, []);

    /**
     * Toggle collapse state for better space management
     * Allows users to hide/show items list when not needed
     */
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    /**
     * Empty state display when no items exist
     */
    if (!items.length) {
        return (
            <div className="no-items-message">
                <h3>No Items Available</h3>
                <p>Be the first to post an item! Use the form above to get started.</p>
                <button 
                    className="create-first-item"
                    onClick={() => {
                        // Scroll to form section
                        document.querySelector('.item-form-section')?.scrollIntoView({ 
                            behavior: 'smooth' 
                        });
                    }}
                >
                    Create Your First Item
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Enhanced Header with Item Count and Collapse Toggle */}
            <div className="item-list-header">
                <div className="item-list-title-group">
                    <h2 className="item-list-title">Available Items</h2>
                    <span className="item-count">{items.length}</span>
                </div>
                
                {/* Collapse Toggle Button for Space Management */}
                <button 
                    onClick={toggleCollapse}
                    className={`items-collapse-toggle ${isCollapsed ? 'collapsed' : ''}`}
                    title={isCollapsed ? 'Show items' : 'Hide items'}
                >
                    <span className="collapse-icon">▼</span>
                    {isCollapsed ? 'Show Items' : 'Hide Items'}
                </button>
            </div>

            {/* Collapsible Items Container */}
            <div className={`items-container ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                <ul>
                    {items.map(item => (
                        <li key={item.id} className="item-card">
                            {/* Item Title */}
                            <h3>{item.title}</h3>
                            
                            {/* Item Description */}
                            <p>{item.description}</p>
                            
                            {/* Item Metadata in Organized Grid */}
                            <div className="item-meta">
                                <div className="item-meta-item">
                                    <span className="meta-label">Price</span>
                                    <span className="meta-value">${parseFloat(item.price).toFixed(2)}</span>
                                </div>
                                <div className="item-meta-item">
                                    <span className="meta-label">Posted By</span>
                                    <span className="meta-value">{item.posted_by}</span>
                                </div>
                                <div className="item-meta-item">
                                    <span className="meta-label">Date Posted</span>
                                    <span className="meta-value">{new Date(item.date_posted).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            {/* Categories Display */}
                            <div className="item-categories">
                                <span className="meta-label">Categories:</span>
                                <div className="category-list">
                                    {item.categories.map(c => (
                                        <span key={c.name} className="category-item">{c.name}</span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Enhanced Rating Display */}
                            <div className="item-rating">
                                <span className="rating-stars">
                                    {(() => {
                                        const full = Math.floor(item.star_rating);
                                        const half = item.star_rating % 1 >= 0.25 && item.star_rating % 1 < 0.75;
                                        const empty = 5 - full - (half ? 1 : 0);
                                        return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
                                    })()}
                                </span>
                                <span className="rating-info">
                                    {item.star_rating.toFixed(1)}/5 • <strong>{item.review_count}</strong> {item.review_count === 1 ? 'review' : 'reviews'}
                                </span>
                            </div>
                            
                            {/* Review Form Section */}
                            <div className="review-section">
                                <ReviewForm
                                    itemId={item.id}
                                    onReviewSubmitted={() => {
                                        // Reload items to update star ratings after new review
                                        loadItemsList();
                                        
                                        // Dispatch event for other components
                                        window.dispatchEvent(new Event('reviewCreated'));
                                    }}                
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
