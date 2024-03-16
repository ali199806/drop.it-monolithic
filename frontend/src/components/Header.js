import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';


import './Header.css'
import NotificationModal from './NotificationModal';

function Header() {

  const bell = require("../icons/bell.png")
  const notification = require("../icons/active.png")
  const location = useLocation();
  const token = location.state.token;

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [storageInfo, setStorageInfo] = useState({ usedStorage: 0, totalStorage: 0 });

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    window.location.href = '/'; 
  };



  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`/api/storage/usage`, {
        params: {}, 
        headers: {
          'x-auth-token': token,
        },
      });
      const { usedStorage, totalStorage } = response.data;
      setStorageInfo({ usedStorage, totalStorage }); // Update the storage info state
  
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

  useEffect(() => {
    

    fetchNotifications();
    // Set up a timer to fetch notifications periodically
    const intervalId = setInterval(fetchNotifications, 2000); // Checks every 2 seconds

    // Clean-up function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const handleNotificationButtonClick = () => {
    setShowNotificationModal(true);
  };

  const notificationButtonIcon = notifications.length > 0 ? notification : bell;


  return (
    <header className="app-header">
      {showNotificationModal && <NotificationModal notifications={notifications} onClose={() => setShowNotificationModal(false)} storageInfo={storageInfo}
/>}

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
