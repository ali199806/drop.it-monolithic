import React from 'react';
import './NotificationModal.css';



function NotificationModal({ notifications, onClose }) {
  return (
    <div className="model-overflow">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Notifications</h2>
        <ul>
          {notifications.map((notification, index) => (
            <li key={index} className={`notification ${notification.type}`}>
              {notification.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default NotificationModal;
