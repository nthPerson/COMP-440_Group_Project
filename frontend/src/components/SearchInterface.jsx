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
    
    // Advanced search state
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
    const [expenseFilter, setExpenseFilter] = useState('all'); // New: expensive/cheap filter
    
    // Categories and items data
    const [categories, setCategories] = useState([]);
    const [allItems, setAllItems] = useState([]); // Store all items to avoid losing data
    
    // Search timeout for debouncing
    const [searchTimeout, setSearchTimeout] = useState(null);

    /**
     * Load initial data (categories and all items)
     */
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Load categories
                const categoriesResponse = await fetch('http://localhost:5000/api/categories');
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
     * Handle filter changes - re-search when filters change
     */
    useEffect(() => {
        if (hasSearched) {
            handleFilterChange();
        }
    }, [sortBy, priceFilter.min, priceFilter.max, expenseFilter]);

    /**
     * Handle search input with debouncing and partial matching
     */
    const handleSearchInput = (value) => {
        setSearchQuery(value);
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout for debounced search
        const newTimeout = setTimeout(() => {
            performAdvancedSearch(value.trim());
        }, 300); // 300ms debounce
        
        setSearchTimeout(newTimeout);
    };

    /**
     * Perform the advanced search with all filters and partial matching
     */
    const performAdvancedSearch = async (query) => {
        setIsSearching(true);
        setSearchError('');
        
        try {
            // Build query parameters
            const params = new URLSearchParams({
                q: query || '', // Send empty query to get all items
                sort: sortBy
            });
            
            // Add price filters if provided
            if (priceFilter.min) params.append('minPrice', priceFilter.min);
            if (priceFilter.max) params.append('maxPrice', priceFilter.max);
            
            const response = await fetch(`http://localhost:5000/api/items/search?${params}`);
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            
            const data = await response.json();
            let filteredResults = data.items || [];
            
            // Apply expense filter on frontend
            if (expenseFilter === 'expensive') {
                filteredResults = filteredResults.filter(item => item.isPriceHigh);
            } else if (expenseFilter === 'cheap') {
                filteredResults = filteredResults.filter(item => item.isPriceLow);
            }
            
            setSearchResults(filteredResults);
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
     * Handle filter changes by re-running search
     */
    const handleFilterChange = () => {
        performAdvancedSearch(searchQuery);
    };

    /**
     * Get suggested categories based on current results
     */
    const getSuggestedCategories = () => {
        return categories.slice(0, 5); // Show first 5 categories as suggestions
    };

    /**
     * Calculate price statistics from search results
     */
    const getPriceStats = () => {
        if (searchResults.length === 0) return null;
        
        const prices = searchResults.map(item => parseFloat(item.price));
        return {
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length
        };
    };

    const priceStats = getPriceStats();

    return (
        <div className="search-interface">
            {/* ENHANCED SEARCH HEADER */}
            <div className="search-header">
                <h2>🔍 Advanced Item Search</h2>
                <p>Search by keywords, filter by price, and sort results</p>
            </div>

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
                    
                    <button 
                        className="advanced-toggle-btn"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        type="button"
                    >
                        {showAdvanced ? 'Hide Filters' : 'Advanced'}
                    </button>
                </div>

                                {/* ADVANCED FILTERS */}
                {showAdvanced && (
                    <div className="advanced-filters">
                        <div className="filter-row">
                            <div className="price-filter">
                                <label> Price Range:</label>
                                <div className="price-inputs">
                                    <input
                                        type="number"
                                        placeholder="Min $"
                                        value={priceFilter.min}
                                        onChange={(e) => setPriceFilter({...priceFilter, min: e.target.value})}
                                        className="price-input"
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        placeholder="Max $"
                                        value={priceFilter.max}
                                        onChange={(e) => setPriceFilter({...priceFilter, max: e.target.value})}
                                        className="price-input"
                                    />
                                </div>
                            </div>
                            
                            <div className="expense-filter">
                                <label> Price Category:</label>
                                <select 
                                    value={expenseFilter} 
                                    onChange={(e) => setExpenseFilter(e.target.value)}
                                    className="expense-select"
                                >
                                    <option value="all"> All Items</option>
                                    <option value="expensive"> Expensive Items</option>
                                    <option value="cheap"> Budget Items</option>
                                </select>
                            </div>
                            
                            <div className="sort-filter">
                                <label> Sort by:</label>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="sort-select"
                                >
                                    <option value="relevance"> Relevance</option>
                                    <option value="price-high"> Price: High to Low</option>
                                    <option value="price-low"> Price: Low to High</option>
                                    <option value="date-new"> Newest First</option>
                                    <option value="date-old"> Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

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
                                                    <div className="stars">
                                                        {item.averageRating 
                                                            ? '⭐'.repeat(Math.round(item.averageRating))
                                                            : '☆☆☆☆☆'
                                                        }
                                                    </div>
                                                    <div className="rating-text">
                                                        {item.averageRating 
                                                            ? `${item.averageRating.toFixed(1)} (${item.reviewCount} reviews)`
                                                            : 'No reviews'
                                                        }
                                                    </div>
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
