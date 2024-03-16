import { Modal, Button, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import axios from 'axios';

function FileInfoModal({ itemPath, itemType, onClose, visible  }) {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const location = useLocation();
  const token = location.state.token;



  const handleDownload = async () => {
    try {
      const response = await axios.get('/api/storage/download', {
        params: { path: itemPath,  type: itemType },
        headers: {
          'x-auth-token': token,
        },
        responseType: 'blob', // Set response type to blob to handle file downloads
      });
  
      // Create a blob URL from the response data
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
  
      // Create an anchor element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', info.name); // Set the download attribute with the file name
      document.body.appendChild(link);
  
      // Trigger the download
      link.click();
  
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download item:', error);
      // Handle error appropriately
    }
  };

  const handleDelete = async () => {
    try {
      // Retrieve item size before deleting
      const response = await axios.get(`/api/storage/info`, {
        params: { path: itemPath },
        headers: {
          'x-auth-token': token,
        },
      });
      const itemSize = response.data.size;

      await axios.delete(`/api/storage/delete`, {
        params: { path: itemPath, type: itemType , size: itemSize}, // Pass item type in the request
        headers: {
          'x-auth-token': token,
        },
      });
      onClose();
       // Close the modal after successful deletion
    } catch (error) {
      console.error('Failed to delete item:', error);
      // Handle error appropriately
    }
  };


  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(`/api/storage/info`, {
            params: { path: itemPath }, 
            headers: {
              'x-auth-token': token,
            },
          });
        setInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch item info:', error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [itemPath]);

return (
    <Modal
      title="Item Details"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="download" type="primary" onClick={handleDownload}>
          Download
        </Button>,
        <Button key="delete" type="danger" onClick={handleDelete}>
          Delete
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      {loading ? (
        <Spin />
      ) : (
        <div>
          <p>Name: {info?.name}</p>
          <p>Type: {info?.type}</p>
          <p>Size: {info?.size} bytes</p>
          <p>Created At: {info?.createdAt}</p>
          <p>Updated At: {info?.updatedAt}</p>
        </div>
      )}
    </Modal>
  );
}
export default FileInfoModal;