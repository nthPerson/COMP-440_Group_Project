import React, { useEffect, useState } from "react";
import { useItemsList } from "../contexts/ItemsListContext";
import ReviewForm from "./ReviewForm";
import { Link } from 'react-router-dom';
import '../styles/components/ItemList.css';
import Pagination from './Pagination';

/**
 * ENHANCED ITEM LIST COMPONENT
 * 
 * Features:
 * - Collapsible item list for better space management (can be disabled)
 * - Enhanced card design with better organization
 * - Improved item count display
 * - Better responsive design
 * - Support for external items prop (for search results)
 * 
 * Purpose: Display all available items with reviews in an organized, collapsible format
 */
export default function ItemList({ items: externalItems, showCollapseToggle = true }) {
    const { items: contextItems, isLoading, error, loadItemsList } = useItemsList();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Use external items if provided (for search results), otherwise use context items
    const items = externalItems || contextItems;
    const isUsingExternalItems = Boolean(externalItems);

    // Pagination calculations
    const totalPages = Math.ceil(items.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    // Reset to page 1 when item list changes
    useEffect(() => {
        setCurrentPage(1);
    }, [items]);

        /**
     * Set up event listeners and initial data loading
     * Only when using context data, not external items
     */
        useEffect(() => {
            if (!isUsingExternalItems) {
                // Reload when new items are created
                const onNew = () => loadItemsList();
                window.addEventListener('itemCreated', onNew);
                
                // Cleanup event listener on unmount
                return () => window.removeEventListener('itemCreated', onNew);
            }
        }, [isUsingExternalItems, loadItemsList]);

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

    const handleRefresh = () => {
        if (!isUsingExternalItems) {
            loadItemsList();
        }
    };

    // Only show loading/error states when using context data (not external items)
    if (!isUsingExternalItems) {
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
    }

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
                {!isUsingExternalItems && (
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
                )}
            </div>
        );
    }

    return (
        <div>
            {/* Enhanced Header with Item Count and Conditional Collapse Toggle */}
            <div className="item-list-header">
                <div className="item-list-title-group">
                    <h2 className="item-list-title">
                        {isUsingExternalItems ? 'Search Results' : 'Available Items'}
                    </h2>
                    <span className="item-count">{items.length}</span>
                </div>
                
                {/* Collapse Toggle Button - Only show if enabled */}
                {showCollapseToggle && (
                    <button 
                        onClick={toggleCollapse}
                        className={`items-collapse-toggle ${isCollapsed ? 'collapsed' : ''}`}
                        title={isCollapsed ? 'Show items' : 'Hide items'}
                    >
                        <span className="collapse-icon">▼</span>
                        {isCollapsed ? 'Show Items' : 'Hide Items'}
                    </button>
                )}
            </div>

            {/* Items Container - Always expanded when collapse toggle is disabled */}
            <div className={`items-container ${!showCollapseToggle ? 'expanded' : (isCollapsed ? 'collapsed' : 'expanded')}`}>
                <ul>
                    {currentItems.map(item => (
                        <li key={item.id} className="item-card">
                            {/* Item Image */}
                            <div className="item-image-container">
                                <img 
                                    src={item.image_url} 
                                    alt={item.title}
                                    className="item-thumbnail"
                                    onError={(e) => {
                                        e.target.src = "https://api.iconify.design/mdi:package-variant.svg";
                                    }}
                                />
                            </div>
                            
                            <div className="item-content">
                                {/* Item Title */}
                                <h3><Link to={`/item/${item.id}`}>{item.title}</Link></h3>
                                
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
                                        <span className="meta-value"><Link to={`/seller/${item.posted_by}`}>{item.posted_by}</Link></span>
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
                                            <Link
                                                key={c.name}
                                                to={`/search?category=${encodeURIComponent(c.name)}`}
                                                className="category-item"
                                                title={`See all in ${c.name}`}
                                            >
                                                <img 
                                                    src={`https://api.iconify.design/${c.icon_key}.svg`}
                                                    alt=""
                                                    className="category-icon-small"
                                                />
                                                {c.name}
                                            </Link>
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
                                
                                {/* Review Form Section - Only show for context items, not search results */}
                                {!isUsingExternalItems && (
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

                            )}
                            </div>
                        </li>
                    ))}
                </ul>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        siblingCount={1}
                    />
                    // <div className="pagination-controls">
                    //     <button
                    //         className="pagination-button"
                    //         onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    //         disabled={currentPage === 1}
                    //     >
                    //         Prev
                    //     </button>

                    //     {[...Array(totalPages)].map((_, i) => (
                    //         <button
                    //             key={i}
                    //             onClick={() => setCurrentPage(i + 1)}
                    //             className={`pagination-button ${currentPage === i + 1 ? 'active-page' : ''}`}
                    //         >
                    //             {i + 1}
                    //         </button>
                    //     ))}

                    //     <button
                    //         className="pagination-button"
                    //         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    //         disabled={currentPage === totalPages}
                    //     >
                    //         Next
                    //     </button>
                    // </div>
                )}
            </div>
        </div>
    );
}