import React from 'react';
import ReactDOM from 'react-dom/client';
import KanbanBoard from './KanbanBoard.jsx';
import './index.css'; // Optional: For custom styles or Tailwind

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <KanbanBoard />
  </React.StrictMode>
);