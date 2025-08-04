import React, { useEffect, useState } from 'react';
// useLocation gives us access to the current URL (including query string)
// useNavigate lets us redirect (e.g. to /login or to the item detail page)
import { useLocation,useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ItemList from '../components/ItemList';

/* this not really a "page", its what the search results page will look like 
this is the user interface when you type in the search bar and click enter and what will show up
*/

//custom hook to turn the URL query string into a usable object
function useQuery() {
    return new URLSearchParams(useLocation().search);
}


export default function SearchResults() {
    //VARIABLES
    const navigate = useNavigate();                        // useNavigate hook to redirect users
    const query = useQuery();                              // useQuery hook to access URL query parameters
    const searchTerm    = query.get('category')?.trim()    // Read ?category=… from the URL
                    || '';

    /*Local state of our list of items, loading state, and any error message
        -you can think of this as the "state" of the search results page
        -you can use this to conditionally render spinners, messages, or result list
    */
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);  

 
    //runs whenever 'searchTerm' changes (e.g. when the user hits the search bar or clicks a category)
    useEffect(() => {
        if (!searchTerm) return; //if no search termm inside, do nothing

        setLoading(true);   //set loading state to true
        setError('');       //clear any previous error

        //1. First try the server-side category search API first
        fetch( 
            /*encodeURIComponent() makes sure spaces or special characters in search term don't break URL
                -example "Holland Lop Tonka" --> Holland%20Lop%20Tonka
            */
            '/api/items/search?category=${encodeURIComponent(searchTerm)}',
            { credentials: 'include' } //send login credentials to backend session manager (Flask-Login)
        )

            .then(checkAuth) //check for 401 error message or redirect if not logged in
            .then(responseA => {
                if (!responseA.ok) throw new Error('Search API error');
                    return responseA.json();
            })
            .then(data => {
                if (data.item_count > 0){
                    //found category matches
                    setItems(data.items); //set items to the list of items returned by the API
                }
                else {
                    //2. FALLBACK: fetch everything and filter by title (for free-text searches)
                    return fetch('/api/items/list_items')
                        .then(responseB => {
                            if (!responseB.ok) throw new Error ('List-items API error');
                            return responseB.json();
                        })
                        .then(allItems => {
                            const matched = allItems.filter(item =>
                                item.title.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            setItems(matched); //set items to the filtered list
                        });
                }
            })
            .catch(err => setError(err.message)) //show any fetch or parsing error
            .finally(() => setLoading(false));   //stop loading no matter what
    }, [term]);

    //RETURNING - SHOWING THE PAGE
    return(
        <div className="search-results-page">
            {/* if nothing typed yet but shouldn't really have this executed */}
            {!searchTermterm && <p>Please enter something to search.</p>}

            {/* if we have search term, always show this block */}
            {searchTermterm && (
                <>
                    {/* Header always shows, even if there are zero matches */}
                    <h1>Search Results for "{searchTerm}"</h1>

                    {loading && <p> Loading Results... </p>} {/* show loading message while fetching data */}
                    {error && <p className = "error">{error}</p>} {/* show error message if any */}

                    {/* If no items found, show a message */}
                    {!loading && !error && items.length === 0 && (
                        <ul className="item-list">
                            {items.map(item => (
                                <li key={item.id} className="item-card">
                                    {/* clicking the title navigates to the item-detail page */}
                                    <h2
                                        className="item-title clickable"
                                        onClick={() => navigate('/item/${item.id}')}
                                    >
                                        {item.title}
                                    </h2>
                                    <p>{item.description}</p>
                                    <p><strong>Price:</strong> ${parseFloat(item.price).toFixed(2)}</p>
                  <p><strong>Posted by:</strong> {item.posted_by}</p>
                  <p><strong>Date:</strong> {new Date(item.date_posted).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
    





