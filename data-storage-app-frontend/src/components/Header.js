import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';


import './Header.css'
import NotificationModal from './NotificationModal';

function Header() {

  const bell = require("../icons/bell.png")
  const notification = require("../icons/notification.png")
  const location = useLocation();
  const token = location.state.token;

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
    // For example, clear the token from local storage and redirect to login page
    localStorage.removeItem('token');
    window.location.href = '/'; // or use your routing library's method to navigate
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:4005/api/storage/usage`, {
            params: { }, // This is where you pass the path as a query parameter
            headers: {
              'x-auth-token': token,
            },
          });
        const { usedStorage, totalStorage } = response.data;
        const usagePercentage = (usedStorage / totalStorage) * 100;
        
        const newNotifications = [];
        if (usagePercentage >= 80 && usagePercentage < 100) {
          newNotifications.push({ type: 'warning', message: 'You have reached 80% of your storage capacity.' });
        } else if (usagePercentage >= 100) {
          newNotifications.push({ type: 'error', message: 'Your storage capacity has been exceeded.' });
        }

        setNotifications(newNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationButtonClick = () => {
    setShowNotificationModal(true);
  };

  // JSX for notification button with dynamic icon
  const notificationButtonIcon = notifications.length > 0 ? bell : notification;


  return (
    <header className="app-header">
      {/* Notification modal */}
      {showNotificationModal && <NotificationModal notifications={notifications} onClose={() => setShowNotificationModal(false)} />}

      <div className="logo">
        <img src="path-to-your-logo.png" alt="App Logo" />
      </div>
      <h1 className="app-name">Your App Name</h1>
      {/* Notification button */}
      <div className="left">
      <button className="notification-button" onClick={handleNotificationButtonClick}>
        <img src={notificationButtonIcon} alt="Notification" />
      </button>

            <button className="logout-button" onClick={handleLogout}>Log Out</button>
      </div>
    </header>
  );
}

export default Header;
