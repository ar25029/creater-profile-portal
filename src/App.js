// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CreatorProvider } from "./contexts/CreatorContext";
import Dashboard from "./pages/Dashboard";
import "./index.css";

function App() {
  return (
    <CreatorProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/creator/:id" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </CreatorProvider>
  );
}

export default App;
