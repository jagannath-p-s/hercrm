// App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// A wrapper component to protect private routes
const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('staff')); // Use 'staff' instead of 'user'
  // Check if the user exists and if the token is still valid based on the expiry time
  return user && Date.now() < user.expiry ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
