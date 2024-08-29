// HomePage.jsx
import React from 'react';

const HomePage = () => {
  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome, Jagan!</h1>
      <button
        onClick={logout}
        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
      >
        Logout
      </button>
    </div>
  );
};

export default HomePage;
