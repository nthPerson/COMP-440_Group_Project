import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/global.css';

export default function Reports() {
  const [mostExpensive, setMostExpensive] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cat1, setCat1] = useState('');
  const [cat2, setCat2] = useState('');
  const [twoCatUsers, setTwoCatUsers] = useState([]);

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
    fetch('/api/reports/most_expensive_by_category', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : []))
      .then(setMostExpensive)
      .catch(() => {});

    fetch('/api/items/categories', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { categories: [] }))
      .then(data => setCategories(data.categories || []))
      .catch(() => {});

    fetch('/api/reports/users_all_poor', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { users: [] }))
      .then(data => setAllPoorUsers(data.users || []))
      .catch(() => {});

    fetch('/api/reports/users_no_poor_reviews_on_items', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { users: [] }))
      .then(data => setNoPoorUsers(data.users || []))
      .catch(() => {});

    fetch('/api/reports/users_never_posted', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { users: [] }))
      .then(data => setNeverPosted(data.users || []))
      .catch(() => {});

    fetch('/api/users/', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : []))
      .then(setAllUsers)
      .catch(() => {});
  }, []);

  const handleTwoCat = () => {
    if (!cat1 || !cat2) return;
    fetch(`/api/reports/users_two_categories?cat1=${encodeURIComponent(cat1)}&cat2=${encodeURIComponent(cat2)}`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { users: [] }))
      .then(data => setTwoCatUsers(data.users || []))
      .catch(() => setTwoCatUsers([]));
  };

  const handleGoodItems = () => {
    if (!goodUser) return;
    fetch(`/api/reports/items_only_good_excellent?user=${encodeURIComponent(goodUser)}`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { items: [] }))
      .then(data => setGoodItems(data.items || []))
      .catch(() => setGoodItems([]));
  };

  const handleTopPosters = () => {
    if (!date) return;
    fetch(`/api/reports/top_posters?date=${encodeURIComponent(date)}`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { users: [] }))
      .then(data => {
        setTopUsers(data.users || []);
        setTopCount(data.max_posts ?? null);
      })
      .catch(() => {
        setTopUsers([]);
        setTopCount(null);
      });
  };

  const handleFollowedByBoth = () => {
    if (!user1 || !user2) return;
    fetch(`/api/reports/users_followed_by_both?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { users: [] }))
      .then(data => setFollowedUsers(data.users || []))
      .catch(() => setFollowedUsers([]));
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1>Reports</h1>

          <section>
            <h2>Most Expensive Items in Each Category</h2>
            <ul>
              {mostExpensive.map(item => (
                <li key={item.category}>
                  {item.category}: <Link to={`/item/${item.item_id}`}>{item.title}</Link> (${item.price}) by{' '}
                  <Link to={`/seller/${item.posted_by}`}>{item.posted_by}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>User(s) Who Posted Two Different Items On the Same Day</h2>
            <select value={cat1} onChange={e => setCat1(e.target.value)}>
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <select value={cat2} onChange={e => setCat2(e.target.value)}>
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <button onClick={handleTwoCat}>Search</button>
            <ul>
              {twoCatUsers.map(u => (
                <li key={u}>
                  <Link to={`/seller/${u}`}>{u}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Items by Seller (user) with Only "Excellent" Or "Good" Reviews</h2>
            <select value={goodUser} onChange={e => setGoodUser(e.target.value)}>
              <option value="">Select User</option>
              {allUsers.map(u => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>
            <button onClick={handleGoodItems}>Search</button>
            <ul>
              {goodItems.map(item => (
                <li key={item.item_id}>{item.title}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Top Seller (user) on Given Date</h2>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <button onClick={handleTopPosters}>Search</button>
            {topCount !== null && (
              <div>
                <p>Posts: {topCount}</p>
                <ul>
                  {topUsers.map(u => (
                    <li key={u}>
                      <Link to={`/seller/${u}`}>{u}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section>
            <h2>Users with Only 'Poor' Reviews</h2>
            <ul>
              {allPoorUsers.map(u => (
                <li key={u}>
                  <Link to={`/seller/${u}`}>{u}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Sellers (users) with No 'Poor' Reviews</h2>
            <ul>
              {noPoorUsers.map(u => (
                <li key={u}>
                  <Link to={`/seller/${u}`}>{u}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Users Followed by Both UserX and UserY</h2>
            <select value={user1} onChange={e => setUser1(e.target.value)}>
              <option value="">Select User 1</option>
              {allUsers.map(u => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>
            <select value={user2} onChange={e => setUser2(e.target.value)}>
              <option value="">Select User 2</option>
              {allUsers.map(u => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>
            <button onClick={handleFollowedByBoth}>Search</button>
            <ul>
              {followedUsers.map(u => (
                <li key={u}>
                  <Link to={`/seller/${u}`}>{u}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Users Who Have Never Posted an Item</h2>
            <ul>
              {neverPosted.map(u => (
                <li key={u}>
                  <Link to={`/seller/${u}`}>{u}</Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}