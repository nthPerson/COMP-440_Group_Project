import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/SearchInterface.css';

const SearchInterface = () => {
    // Core search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchError, setSearchError] = useState('');
    
    // Categories and items data
    const [categories, setCategories] = useState([]);
    const [allItems, setAllItems] = useState([]); // Store all items to avoid losing data
    
    // Search timeout for debouncing
    const [searchTimeout, setSearchTimeout] = useState(null);

    /**
     * Get rating class for color coding
     */
    const getRatingClass = (rating) => {
        if (!rating) return 'rating-badge';
        const ratingLower = rating.toLowerCase();
        return `rating-badge rating-${ratingLower}`;
    };

    /**
     * Format rating display
     */
    const formatRating = (rating) => {
        if (!rating) return 'N/A';
        return rating.charAt(0).toUpperCase() + rating.slice(1).toLowerCase();
    };
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Load categories
                const categoriesResponse = await fetch('http://localhost:5000/api/items/categories');
                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    setCategories(categoriesData.categories || categoriesData);
                }

                // Load all items initially to show data
                const itemsResponse = await fetch('http://localhost:5000/api/items/search?q=');
                if (itemsResponse.ok) {
                    const itemsData = await itemsResponse.json();
                    setAllItems(itemsData.items || []);
                    setSearchResults(itemsData.items || []);
                    setHasSearched(true);
                }
            } catch (error) {
                console.error('Failed to load initial data:', error);
                setSearchError('Failed to load data. Please refresh the page.');
            }
        };
        
        loadInitialData();
        
        // Cleanup timeout on unmount
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    /**
     * Handle search input with debouncing
     */
    const handleSearchInput = (value) => {
        setSearchQuery(value);
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout for debounced search
        const newTimeout = setTimeout(() => {
            performSearch(value.trim());
        }, 300); // 300ms debounce
        
        setSearchTimeout(newTimeout);
    };

    /**
     * Perform simple search
     */
    const performSearch = async (query) => {
        setIsSearching(true);
        setSearchError('');
        
        try {
            // Build simple query parameters
            const params = new URLSearchParams({
                q: query || '' // Send empty query to get all items
            });
            
            const response = await fetch(`http://localhost:5000/api/items/search?${params}`);
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            
            const data = await response.json();
            const searchResults = data.items || [];
            
            setSearchResults(searchResults);
            setHasSearched(true);
            
        } catch (error) {
            console.error('Search error:', error);
            setSearchError('Failed to search items. Please try again.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    /**
     * Get suggested categories based on current results
     */
    const getSuggestedCategories = () => {
        return categories.slice(0, 5); // Show first 5 categories as suggestions
    };

    return (
        <div className="search-interface">
            {/* MAIN SEARCH INPUT */}
            <div className="search-form">
                <div className="search-input-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search items by title, description, or category..."
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                    />
                </div>

                {/* CATEGORY SUGGESTIONS */}
                {getSuggestedCategories().length > 0 && !searchQuery && (
                    <div className="category-suggestions">
                        <p className="suggestions-label"> Popular categories:</p>
                        <div className="categories-tags">
                            {getSuggestedCategories().map((category, index) => (
                                <button
                                    key={index}
                                    className="category-tag"
                                    onClick={() => handleSearchInput(category.name)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* SEARCH STATUS */}
            {isSearching && (
                <div className="search-status searching">
                    <div className="search-spinner"></div>
                    <span>Searching...</span>
                </div>
            )}

            {/* SEARCH RESULTS */}
            {hasSearched && !isSearching && (
                <div className="search-results">
                    {/* RESULTS HEADER WITH STATS */}
                    <div className="results-header">
                        <h3>
                            Search Results ({searchResults.length} found)
                            {searchQuery && ` for "${searchQuery}"`}
                        </h3>
                        
                        {priceStats && (
                            <div className="price-stats">
                                <span> Price Range: ${priceStats.minPrice.toFixed(2)} - ${priceStats.maxPrice.toFixed(2)}</span>
                                <span> Average: ${priceStats.avgPrice.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* ERROR MESSAGE */}
                    {searchError && (
                        <div className="search-error">
                            <p> {searchError}</p>
                        </div>
                    )}

                    {/* RESULTS TABLE */}
                    {searchResults.length > 0 && (
                        <div className="results-table-container">
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th> Item</th>
                                        <th> Description</th>
                                        <th> Price</th>
                                        <th> Posted By</th>
                                        <th> Date</th>
                                        <th> Rating</th>
                                        <th> Categories</th>
                                        <th> Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.map((item, index) => (
                                        <tr key={item.id} className="result-row">
                                            <td>
                                                <div className="item-title">
                                                    {item.title}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="item-description">
                                                    {item.description.length > 100 
                                                        ? `${item.description.substring(0, 100)}...`
                                                        : item.description
                                                    }
                                                </div>
                                            </td>
                                            <td>
                                                <div className="item-price">
                                                    ${parseFloat(item.price).toFixed(2)}
                                                    {item.isPriceHigh && (
                                                        <span className="price-indicator expensive"> Expensive</span>
                                                    )}
                                                    {item.isPriceLow && (
                                                        <span className="price-indicator cheap"> Budget</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="item-posted-by">
                                                    {item.postedBy?.firstName} {item.postedBy?.lastName}
                                                    <br />
                                                    <small>(@{item.postedBy?.username})</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="item-date">
                                                    {new Date(item.datePosted).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="rating-display">
                                                    {item.averageRating ? (
                                                        <div className="item-rating">
                                                            <span className={getRatingClass(item.ratingCategory || 'good')}>
                                                                {formatRating(item.ratingCategory || 'good')}
                                                            </span>
                                                            <span className="item-rating-score">
                                                                {item.averageRating.toFixed(1)}/5
                                                            </span>
                                                            <span className="item-rating-text">
                                                                ({item.reviewCount} reviews)
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="no-rating">
                                                            <span className="rating-badge">N/A</span>
                                                            <span className="item-rating-text">No reviews yet</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="category-badges">
                                                    {item.categories?.map((cat, catIndex) => (
                                                        <span key={catIndex} className="category-badge">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <Link 
                                                    to={`/item/${item.id}`} 
                                                    className="view-item-btn"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* EMPTY RESULTS */}
                    {searchResults.length === 0 && !searchError && (
                        <div className="no-results">
                            <div className="no-results-icon"> </div>
                            <h3>No items found</h3>
                            <p>Try adjusting your search terms or filters</p>
                            {searchQuery.length === 1 && (
                                <p> Tip: Single letter searches show items starting with "{searchQuery.toUpperCase()}"</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchInterface;
