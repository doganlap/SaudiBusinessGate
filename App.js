import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AgentFactory from './components/AgentFactory';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/agent-factory" replace />} />
          <Route path="/agent-factory" element={<AgentFactory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

