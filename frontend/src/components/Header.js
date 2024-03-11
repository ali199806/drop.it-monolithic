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
    console.log('Logging out...');
    localStorage.removeItem('token');
    window.location.href = '/'; 
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`/api/storage/usage`, {
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

  const notificationButtonIcon = notifications.length > 0 ? bell : notification;


  return (
    <header className="app-header">
      {showNotificationModal && <NotificationModal notifications={notifications} onClose={() => setShowNotificationModal(false)} />}

      <div className="logo">
        <img src={require('../icons/icon.png')} alt="App Logo" />
      </div>
      <h1 className="app-name">Drop.it</h1>
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
