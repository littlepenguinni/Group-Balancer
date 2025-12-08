import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TeamBalancer from './App';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <TeamBalancer />
    </React.StrictMode>
);