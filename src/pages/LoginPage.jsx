// LoginPage.js

import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';

const CustomAlert = ({ message }) => (
  <div
    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md mt-4"
    role="alert"
  >
    <div className="flex items-center">
      <svg
        className="h-6 w-6 text-red-500 mr-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p>{message}</p>
    </div>
  </div>
);

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ useremail: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(''); // Clear any previous errors
      try {
        const { data, error } = await supabase
          .from('staffs') // Use the 'public.staffs' table
          .select('id, useremail, username, password, role, active')
          .eq('useremail', credentials.useremail)
          .single();

        if (error || !data) {
          console.error('Error fetching staff:', error);
          throw new Error('Invalid email or password'); // Set error for invalid credentials
        }

        if (!data.active) {
          throw new Error('Account is inactive, please contact admin.');
        }

        const isPasswordCorrect = bcrypt.compareSync(credentials.password, data.password);
        if (!isPasswordCorrect) {
          throw new Error('Invalid email or password'); // Set error for invalid credentials
        }

        const staffData = {
          id: data.id,
          useremail: data.useremail,
          username: data.username,
          role: data.role,
        };

        const expirationDate = Date.now() + 15 * 24 * 60 * 60 * 1000; // 15 days from now
        localStorage.setItem('staff', JSON.stringify({ ...staffData, expiry: expirationDate }));

        navigate('/'); // Navigate to the correct home route after login
      } catch (error) {
        setError(error.message || 'Something went wrong, please try again'); // Set the error message
      } finally {
        setLoading(false);
      }
    },
    [credentials, navigate]
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">Staff Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            type="email"
            id="useremail"
            name="useremail"
            value={credentials.useremail}
            onChange={handleInputChange}
            label="Email"
            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
          />
          <InputField
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            label="Password"
            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <CustomAlert message={error} />} {/* Display error message */}
      </div>
    </div>
  );
};

const InputField = memo(({ type, id, name, value, onChange, label, className }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required
      className={className}
    />
  </div>
));

export default LoginPage;
