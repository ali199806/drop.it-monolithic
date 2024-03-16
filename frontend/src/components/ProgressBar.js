import React from 'react';
import './ProgressBar.css'; 

// Helper function to convert bytes to megabytes
const bytesToMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

function ProgressBar({ used, total }) {
  // Convert bytes to MB for display
  const usedMB = bytesToMB(used);
  const totalMB = bytesToMB(total);
  const percentage = ((usedMB / totalMB) * 100).toFixed(2);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
      <span className="progress-text">{`${usedMB} MB of ${totalMB} MB used (${percentage}%)`}</span>
    </div>
  );
}

export default ProgressBar;
