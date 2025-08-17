import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import '../styles/components/Navbar.css';
import SearchInterface from './SearchInterface';
import Avatar from './Avatar';

export default function Navbar() {
  // pull the last-saved user out of sessionStorage  - if you do useState starting at null, it will always start at null state which causes the glitch
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  });
  const navigate = useNavigate();
  const [me, setMe] = React.useState(null);

  // dropdown state
  const [itemsOpen, setItemsOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const itemsRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/users/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (mounted && d) setMe(d); })
      .catch(() => { });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(res => res.json()) // Always parse JSON since we always return 200
      .then(data => {
        if (data && data.username) {
          setUser(data);  // Only set a user if /api/auth/status returns all user data
          sessionStorage.setItem('user', JSON.stringify(data)); // Store user data in sessionStorage
        } else {
          setUser(null);
          sessionStorage.removeItem('user'); // Clear sessionStorage if no user
        }
      })
      .catch(() => {
        setUser(null);  // Explicitly set user to null on any error
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/');
  };

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (itemsRef.current && !itemsRef.current.contains(e.target)) setItemsOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') { setItemsOpen(false); setAvatarOpen(false); }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const toggleItems = () => setItemsOpen(o => !o);
  const toggleAvatar = () => setAvatarOpen(o => !o);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">Shopella</Link>
      </div>
      <div className="nav-center">
        <SearchInterface />
      </div>
      <div className="nav-right">
        {!user && (
          <>
            <NavLink to="/login" className="nav-link">Login</NavLink>
            <NavLink to="/register" className="nav-link">Register</NavLink>
          </>
        )}
        {user && (
          <>
            {/* Items dropdown */}
            <div className="dropdown" ref={itemsRef}>
              <button
                className="nav-link dropdown-trigger"
                aria-haspopup="menu"
                aria-expanded={itemsOpen}
                onClick={toggleItems}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleItems(); }
                }}
              >
                Items
              </button>
              {itemsOpen && (
                <div className="dropdown-menu" role="menu">
                  <NavLink
                    to="/"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setItemsOpen(false)}
                  >
                    Items
                  </NavLink>
                  <NavLink
                    to="/item-management"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setItemsOpen(false)}
                  >
                    Item Management
                  </NavLink>
                </div>
              )}
            </div>
            <NavLink to="/reports" className="nav-link">Reports</NavLink>
            
           {/* Avatar dropdown (Profile + Logout) */}
           {me && (
              <div className="dropdown avatar-dropdown" ref={avatarRef}>
                <button
                  className="nav-link avatar-trigger"
                  aria-label="User menu"
                  aria-haspopup="menu"
                  aria-expanded={avatarOpen}
                  onClick={toggleAvatar}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAvatar(); }
                  }}
                >
                  <Avatar src={me.profile_image_url} username={me.username} size={50} />
                </button>
                {avatarOpen && (
                  <div className="dropdown-menu right" role="menu">
                    <NavLink
                      to="/profile"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setAvatarOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <button
                      className="dropdown-item danger"
                      role="menuitem"
                      onClick={() => { setAvatarOpen(false); handleLogout(); }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
