import React, { createContext, useContext, useState, useEffect } from "react";

const ItemsListContext = createContext();

export const useItemsList = () => {
    const context = useContext(ItemsListContext);
    if (!context) {
        throw new Error('useItemsList must be used within ItemsListProvider');
    }
    return context;
};

export const ItemsListProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);

    const loadItemsList = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/items/list_items');
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data = await res.json()
            setItems(data);
            setLastFetch(Date.now());
        } catch (error) {
            console.error('Failed to load items list:', error);
            setError('Failed to load items list. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const addItem = (newItem) => {
        setItems(prev => [newItem, ...prev]);
    }

    const updateItem = (updatedItem) => {
        setItems(prev => prev.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        ));
    };

    const removeItem = (itemId) => {
        setItems(prev => prev.filter(item => item.id !== itemId));
    };

    // Load items list on provider mount (aka when the page that the items list is rendered on loads)
    useEffect(() => {
        loadItemsList();
    }, []);

    const value = {
        items,
        isLoading,
        error,
        lastFetch,
        loadItemsList,
        addItem,
        updateItem,
        removeItem
    };

    return (
        <ItemsListContext.Provider value={value}>
            {children}
        </ItemsListContext.Provider>
    );
}
