import React from 'react';
import './NotificationModal.css';
import ProgressBar from './ProgressBar'; // Import the ProgressBar component

function NotificationModal({ notifications, onClose, storageInfo }) {
  return (
    <div className="model-overflow">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Notifications</h2>
        {storageInfo && (
          <div className="storage-usage">
            <h3>Your Storage</h3>
            <ProgressBar used={storageInfo.usedStorage} total={storageInfo.totalStorage} />
          </div>
        )}
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