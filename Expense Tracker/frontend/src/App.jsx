import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Income from './Pages/Income';
import Expenses from './Pages/Expenses';

const App = () => {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/expenses" />} />
              <Route path="/income" element={<Income />} />
              <Route path="/expenses" element={<Expenses />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
