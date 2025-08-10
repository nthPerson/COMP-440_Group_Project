import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/global.css';
import '../styles/pages/Reports.css';

export default function Reports() {
  // Data states
  const [mostExpensive, setMostExpensive] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cat1, setCat1] = useState('');
  const [cat2, setCat2] = useState('');
  const [twoCatUsers, setTwoCatUsers] = useState([]);

  // Loading states
  const [isLoading, setIsLoading] = useState({
    mostExpensive: true,  // Add loading state for most expensive items
    twoCat: false,
    goodItems: false,
    topPosters: false,
    followedUsers: false
  });

  // Error states
  const [errors, setErrors] = useState({
    twoCat: '',
    goodItems: '',
    topPosters: '',
    followedUsers: ''
  });

  const [goodUser, setGoodUser] = useState('');
  const [goodItems, setGoodItems] = useState([]);

  const [date, setDate] = useState('');
  const [topUsers, setTopUsers] = useState([]);
  const [topCount, setTopCount] = useState(null);

  const [allPoorUsers, setAllPoorUsers] = useState([]);
  const [noPoorUsers, setNoPoorUsers] = useState([]);

  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);

  const [neverPosted, setNeverPosted] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch most expensive items
        setIsLoading(prev => ({ ...prev, mostExpensive: true }));
        const expensiveRes = await fetch('/api/reports/most_expensive_by_category', { credentials: 'include' });
        if (expensiveRes.ok) {
          const data = await expensiveRes.json();
          setMostExpensive(data);
        }
        setIsLoading(prev => ({ ...prev, mostExpensive: false }));

        // Fetch categories
        const categoriesRes = await fetch('/api/items/categories', { credentials: 'include' });
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }

        // Fetch users with all poor reviews
        const poorRes = await fetch('/api/reports/users_all_poor', { credentials: 'include' });
        if (poorRes.ok) {
          const data = await poorRes.json();
          setAllPoorUsers(data.users || []);
        }

        // Fetch users with no poor reviews
        const noPoorRes = await fetch('/api/reports/users_no_poor_reviews_on_items', { credentials: 'include' });
        if (noPoorRes.ok) {
          const data = await noPoorRes.json();
          setNoPoorUsers(data.users || []);
        }

        // Fetch users who never posted
        const neverPostedRes = await fetch('/api/reports/users_never_posted', { credentials: 'include' });
        if (neverPostedRes.ok) {
          const data = await neverPostedRes.json();
          setNeverPosted(data.users || []);
        }

        // Fetch all users
        const usersRes = await fetch('/api/users/', { credentials: 'include' });
        if (usersRes.ok) {
          const data = await usersRes.json();
          setAllUsers(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleTwoCat = async (e) => {
    if (e) e.preventDefault();
    
    // Validate inputs
    if (!cat1 || !cat2) {
      setErrors(prev => ({ ...prev, twoCat: 'Please select both categories' }));
      return;
    }
    if (cat1 === cat2) {
      setErrors(prev => ({ ...prev, twoCat: 'Please select different categories' }));
      return;
    }

    setErrors(prev => ({ ...prev, twoCat: '' }));
    setIsLoading(prev => ({ ...prev, twoCat: true }));
    setTwoCatUsers([]); // Clear previous results

    try {
      const response = await fetch(
        `/api/reports/users_two_categories?cat1=${encodeURIComponent(cat1)}&cat2=${encodeURIComponent(cat2)}`,
        { 
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch data');
      }

      const data = await response.json();
      if (!data.users) {
        throw new Error('Invalid response format');
      }
      setTwoCatUsers(data.users);
    } catch (error) {
      console.error('Error fetching two category users:', error);
      setErrors(prev => ({ 
        ...prev, 
        twoCat: `Failed to fetch results: ${error.message || 'Please try again.'}`
      }));
      setTwoCatUsers([]);
    } finally {
      setIsLoading(prev => ({ ...prev, twoCat: false }));
    }
  };

  const handleGoodItems = async () => {
    if (!goodUser) {
      setErrors(prev => ({ ...prev, goodItems: 'Please select a user' }));
      return;
    }

    setErrors(prev => ({ ...prev, goodItems: '' }));
    setIsLoading(prev => ({ ...prev, goodItems: true }));

    try {
      const response = await fetch(
        `/api/reports/items_only_good_excellent?user=${encodeURIComponent(goodUser)}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setGoodItems(data.items || []);
    } catch (error) {
      setErrors(prev => ({ ...prev, goodItems: 'Failed to fetch results. Please try again.' }));
      setGoodItems([]);
    } finally {
      setIsLoading(prev => ({ ...prev, goodItems: false }));
    }
  };

  const handleTopPosters = async () => {
    if (!date) {
      setErrors(prev => ({ ...prev, topPosters: 'Please select a date' }));
      return;
    }

    setErrors(prev => ({ ...prev, topPosters: '' }));
    setIsLoading(prev => ({ ...prev, topPosters: true }));

    try {
      const response = await fetch(
        `/api/reports/top_posters?date=${encodeURIComponent(date)}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setTopUsers(data.users || []);
      setTopCount(data.max_posts ?? null);
    } catch (error) {
      setErrors(prev => ({ ...prev, topPosters: 'Failed to fetch results. Please try again.' }));
      setTopUsers([]);
      setTopCount(null);
    } finally {
      setIsLoading(prev => ({ ...prev, topPosters: false }));
    }
  };

  const handleFollowedByBoth = async () => {
    if (!user1 || !user2) {
      setErrors(prev => ({ ...prev, followedUsers: 'Please select both users' }));
      return;
    }
    if (user1 === user2) {
      setErrors(prev => ({ ...prev, followedUsers: 'Please select different users' }));
      return;
    }

    setErrors(prev => ({ ...prev, followedUsers: '' }));
    setIsLoading(prev => ({ ...prev, followedUsers: true }));
    setFollowedUsers([]); // Clear previous results

    try {
      const response = await fetch(
        `/api/reports/users_followed_by_both?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`,
        { 
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch data');
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data.users)) {
        throw new Error('Invalid response format');
      }
      setFollowedUsers(data.users);
    } catch (error) {
      console.error('Error fetching followed users:', error);
      setErrors(prev => ({ 
        ...prev, 
        followedUsers: `Failed to fetch results: ${error.message || 'Please try again.'}`
      }));
      setFollowedUsers([]);
    } finally {
      setIsLoading(prev => ({ ...prev, followedUsers: false }));
    }
  };

  return (
    <div>
      <Navbar />
      <div className="reports-container">
          <h1 className="reports-title">Reports</h1>

          <section className="report-section most-expensive-section">
            <h2 className="section-title">Most Expensive Items in Each Category</h2>
            {isLoading.mostExpensive ? (
              <div className="loading-spinner" />
            ) : (
              <div className="expensive-items-grid">
                {mostExpensive.length === 0 ? (
                  <div className="no-results">No expensive items found</div>
                ) : (
                  mostExpensive.map(item => (
                    <div key={item.category} className="expensive-item-card">
                      <div className="category-label">{item.category}</div>
                      <div className="item-content">
                        <h3 className="item-title">
                          <Link to={`/item/${item.item_id}`}>{item.title}</Link>
                        </h3>
                        <div className="item-price">{item.price}</div>
                        <div className="item-description">{item.description}</div>
                        <div className="item-meta">
                          <span className="seller">Posted by <Link to={`/seller/${item.posted_by}`}>{item.posted_by}</Link></span>
                          <span className="date">{item.date_posted}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          <section className="report-section">
            <h2 className="section-title">User(s) Who Posted Two Different Items On the Same Day</h2>
            <form onSubmit={handleTwoCat} className="search-form">
              <div style={{ flex: 1 }}>
                <select 
                  value={cat1} 
                  onChange={e => setCat1(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select First Category</option>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <select 
                  value={cat2} 
                  onChange={e => setCat2(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Second Category</option>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="search-button" 
                disabled={isLoading.twoCat || !cat1 || !cat2}
              >
                {isLoading.twoCat ? 'Searching...' : 'Search'}
              </button>
            </form>
            {errors.twoCat && <div className="error-message">{errors.twoCat}</div>}
            {isLoading.twoCat ? (
              <div className="loading-spinner" />
            ) : (
              <div className="user-reviews">
                {twoCatUsers.length === 0 && !errors.twoCat ? (
                  <div className="no-results">No users found matching these criteria</div>
                ) : (
                  twoCatUsers.map(u => (
                    <div key={u} className="review-card">
                      <Link to={`/seller/${u}`}>{u}</Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          <section className="report-section">
            <h2 className="section-title">Items by Seller with Only "Excellent" Or "Good" Reviews</h2>
            <div className="search-form">
              <select value={goodUser} onChange={e => setGoodUser(e.target.value)}>
                <option value="">Select User</option>
                {allUsers.map(u => (
                  <option key={u.username} value={u.username}>
                    {u.username}
                  </option>
                ))}
              </select>
              <button className="search-button" onClick={handleGoodItems}>Search</button>
            </div>
            <div className="user-reviews">
              {goodItems.map(item => (
                <div key={item.item_id} className="category-item">
                  {item.title}
                </div>
              ))}
            </div>
          </section>

          <section className="report-section">
            <h2 className="section-title">Top Seller on Given Date</h2>
            <div className="search-form">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              <button className="search-button" onClick={handleTopPosters}>Search</button>
            </div>
            {topCount !== null && (
              <div>
                <p className="category-item">Posts: {topCount}</p>
                <div className="user-reviews">
                  {topUsers.map(u => (
                    <div key={u} className="review-card">
                      <Link to={`/seller/${u}`}>{u}</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="report-section">
            <h2 className="section-title">Users with Only 'Poor' Reviews</h2>
            <div className="user-reviews">
              {allPoorUsers.map(u => (
                <div key={u} className="review-card">
                  <Link to={`/seller/${u}`}>{u}</Link>
                </div>
              ))}
            </div>
          </section>

          <section className="report-section">
            <h2 className="section-title">Sellers with No 'Poor' Reviews</h2>
            <div className="user-reviews">
              {noPoorUsers.map(u => (
                <div key={u} className="review-card">
                  <Link to={`/seller/${u}`}>{u}</Link>
                </div>
              ))}
            </div>
          </section>

          <section className="report-section">
            <h2 className="section-title">Users Followed by Both UserX and UserY</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleFollowedByBoth(); }} className="search-form">
              <div style={{ flex: 1 }}>
                <select 
                  value={user1} 
                  onChange={e => setUser1(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select First User</option>
                  {allUsers.map(u => (
                    <option key={u.username} value={u.username}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <select 
                  value={user2} 
                  onChange={e => setUser2(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Second User</option>
                  {allUsers.map(u => (
                    <option key={u.username} value={u.username}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="search-button" 
                disabled={isLoading.followedUsers || !user1 || !user2}
              >
                {isLoading.followedUsers ? 'Searching...' : 'Search'}
              </button>
            </form>
            {errors.followedUsers && <div className="error-message">{errors.followedUsers}</div>}
            {isLoading.followedUsers ? (
              <div className="loading-spinner" />
            ) : (
              <div className="user-reviews">
                {followedUsers.length === 0 && !errors.followedUsers ? (
                  <div className="no-results">No users found who are followed by both selected users</div>
                ) : (
                  followedUsers.map(u => (
                    <div key={u} className="review-card">
                      <Link to={`/seller/${u}`}>{u}</Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          <section className="report-section">
            <h2 className="section-title">Users Who Have Never Posted an Item</h2>
            <div className="user-reviews">
              {neverPosted.map(u => (
                <div key={u} className="review-card">
                  <Link to={`/seller/${u}`}>{u}</Link>
                </div>
              ))}
            </div>
          </section>
      </div>
    </div>
  );
}