import React from 'react';
import '../styles/components/LoadingSpinner.css';

//you can pass a custom text prop to change the loading message but default is just "loading"
export default function LoadingSpinner ({ text = 'Loading ...'}){
    return (
        <div className = "spinner-container">
            <div className = "spinner" />
            <span className = "spinner-text">{text}</span>
        </div>
    )

}