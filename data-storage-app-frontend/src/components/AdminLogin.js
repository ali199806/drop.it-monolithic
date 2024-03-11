import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router
import { useNavigate } from 'react-router-dom'; // Import useHistory from React Router

import axios from 'axios';

import './AdminLogin.css'; 


function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Get history object from React Router


  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page on submit
    setError(''); // Reset error message

    try {
      // Attempt to login
      const response = await axios.post('http://localhost:4005/api/auth/admin', { username, password });
      const token = response.data.token;

      // Save the token in local storage or context for future requests
      localStorage.setItem('token', token);

      // Redirect user or show success message
      console.log('Login successful:', token);
      
      // Here, you can redirect or update the app state based on successful login
      // Get the user ID from the response or wherever it's available
      const userId = response.data.userId;
      // Construct the URL with basePath/userId
      const browseUrl =  "/browse"
      // const browseUrl = `/browse/${userId}`;
      navigate('/users', { state: { token: token } });
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
}
export default AdminLogin;
