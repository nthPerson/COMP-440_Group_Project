import React, { useState, useEffect } from 'react';

/**
 * PHASE 2 REQUIREMENT: Search Interface Component
 * 
 * Purpose: Implement search form for finding items by category
 * Requirements Met:
 * - Form interface for category input
 * - Results displayed as table/list
 * - Real-time search as user types
 * 
 * Used in: HomePage component as part of item management
 */
export default function SearchInterface() {
    // State management for search functionality
    const [searchCategory, setSearchCategory] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    /**
     * Authentication helper - redirects to login on 401 errors
     * This ensures search only works for authenticated users
     */
    const checkAuth = (resp) => {
        if (resp.status === 401) {
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        return resp;
    };

    /**
     * Load all available categories for autocomplete suggestions
     * Called on component mount to populate category dropdown
     */
    const loadCategories = async () => {
        try {
            const resp = await fetch('/api/items/categories', {
                credentials: 'include'
            });
            checkAuth(resp);
            
            if (resp.ok) {
                const data = await resp.json();
                setAllCategories(data.categories);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    /**
     * CORE SEARCH FUNCTIONALITY
     * Performs the actual search API call when user enters a category
     */
    const performSearch = async (category) => {
        if (!category.trim()) {
            setSearchResults([]);
            setSearchError('');
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setSearchError('');
        setHasSearched(true);

        try {
            // Call the backend search API with category parameter
            const resp = await fetch(`/api/items/search?category=${encodeURIComponent(category.trim())}`, {
                credentials: 'include'
            });
            checkAuth(resp);

            const data = await resp.json();

            if (resp.ok) {
                setSearchResults(data.items);
                if (data.items.length === 0) {
                    setSearchError(`No items found in category "${category}"`);
                }
            } else {
                setSearchError(data.error || 'Search failed');
                setSearchResults([]);
            }
        } catch (error) {
            setSearchError('Network error. Please try again.');
            setSearchResults([]);
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    /**
     * Handle form submission - prevents page reload and triggers search
     */
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        performSearch(searchCategory);
    };

    /**
     * Handle input changes - triggers search as user types (debounced)
     */
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setSearchCategory(value);
        
        // Debounce search - wait 500ms after user stops typing
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            performSearch(value);
        }, 500);
    };

    /**
     * Load categories when component mounts
     */
    useEffect(() => {
        loadCategories();
        
        // Cleanup timeout on unmount
        return () => {
            clearTimeout(window.searchTimeout);
        };
    }, []);

    return (
        <div className="search-interface">
            <h2 className="search-title"> Search Items by Category</h2>
            
            {/* SEARCH FORM - Phase 2 Requirement */}
            <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Enter category name (e.g., electronics, books, clothing)"
                        value={searchCategory}
                        onChange={handleCategoryChange}
                        list="categories-datalist"
                    />
                    
                    {/* Autocomplete suggestions using HTML5 datalist */}
                    <datalist id="categories-datalist">
                        {allCategories.map(category => (
                            <option key={category.name} value={category.name} />
                        ))}
                    </datalist>
                    
                    <button 
                        type="submit" 
                        className="search-button"
                        disabled={isSearching}
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {/* AVAILABLE CATEGORIES DISPLAY */}
            {allCategories.length > 0 && (
                <div className="categories-preview">
                    <p className="categories-label">Available categories:</p>
                    <div className="categories-tags">
                        {allCategories.slice(0, 8).map(category => (
                            <button
                                key={category.name}
                                className="category-tag"
                                onClick={() => {
                                    setSearchCategory(category.name);
                                    performSearch(category.name);
                                }}
                            >
                                {category.name}
                            </button>
                        ))}
                        {allCategories.length > 8 && (
                            <span className="categories-more">+{allCategories.length - 8} more</span>
                        )}
                    </div>
                </div>
            )}

            {/* ERROR MESSAGES */}
            {searchError && (
                <div className="search-error">
                    {searchError}
                </div>
            )}

            {/* SEARCH RESULTS - Phase 2 Requirement: Table/List Display */}
            {hasSearched && !isSearching && (
                <div className="search-results">
                    {searchResults.length > 0 ? (
                        <>
                            <h3 className="results-header">
                                Found {searchResults.length} item{searchResults.length !== 1 ? 's' : ''} 
                                {searchCategory && ` in "${searchCategory}"`}
                            </h3>
                            
                            {/* RESULTS TABLE - Responsive design */}
                            <div className="results-table-container">
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Description</th>
                                            <th>Price</th>
                                            <th>Posted By</th>
                                            <th>Date</th>
                                            <th>Rating</th>
                                            <th>Categories</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map(item => (
                                            <tr key={item.id} className="result-row">
                                                <td className="item-title">
                                                    <strong>{item.title}</strong>
                                                </td>
                                                <td className="item-description">
                                                    {item.description.length > 100 
                                                        ? `${item.description.substring(0, 100)}...`
                                                        : item.description
                                                    }
                                                </td>
                                                <td className="item-price">
                                                    ${parseFloat(item.price).toFixed(2)}
                                                </td>
                                                <td className="item-posted-by">
                                                    {item.posted_by}
                                                </td>
                                                <td className="item-date">
                                                    {new Date(item.date_posted).toLocaleDateString()}
                                                </td>
                                                <td className="item-rating">
                                                    <div className="rating-display">
                                                        <span className="stars">
                                                            {'★'.repeat(Math.floor(item.star_rating))}
                                                            {'☆'.repeat(5 - Math.floor(item.star_rating))}
                                                        </span>
                                                        <span className="rating-text">
                                                            {item.star_rating.toFixed(1)} ({item.review_count})
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="item-categories">
                                                    <div className="category-badges">
                                                        {item.categories.map(cat => (
                                                            <span key={cat.name} className="category-badge">
                                                                {cat.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        !searchError && (
                            <div className="no-results">
                                <p>No items found{searchCategory && ` for category "${searchCategory}"`}.</p>
                                <p>Try searching for: {allCategories.slice(0, 3).map(c => c.name).join(', ')}</p>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
