import { Modal, Button, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import axios from 'axios';

function FileInfoModal({ itemPath, itemType, onClose, visible  }) {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const location = useLocation();
  const token = location.state.token;



  const handleDelete = async () => {
    try {
      // Retrieve item size before deleting
      const response = await axios.get(`http://localhost:4005/api/storage/info`, {
        params: { path: itemPath },
        headers: {
          'x-auth-token': token,
        },
      });
      const itemSize = response.data.size;

      await axios.delete(`http://localhost:4005/api/storage/delete`, {
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
        const response = await axios.get(`http://localhost:4005/api/storage/info`, {
            params: { path: itemPath }, // This is where you pass the path as a query parameter
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
          <p>Owner: {info?.owner}</p>
        </div>
      )}
    </Modal>
  );
}
export default FileInfoModal;
