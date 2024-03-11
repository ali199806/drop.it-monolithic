import React, { useState } from 'react';
import { Modal, Button, Input } from 'antd';

function NewFolderModal({ visible, onClose, onCreate }) {
  const [folderName, setFolderName] = useState('');

  const handleFolderNameChange = (e) => {
    setFolderName(e.target.value);
  };

  const handleCreate = () => {
    if (folderName.trim() !== '') {
      // Perform new folder creation logic
      onCreate(folderName.trim());
      // Close the modal
      onClose();
    }
  };

  return (
    <Modal
      title="New Folder"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="create" type="primary" onClick={handleCreate}>Create</Button>,
      ]}
    >
      <Input placeholder="Enter folder name" value={folderName} onChange={handleFolderNameChange} />
    </Modal>
  );
}

export default NewFolderModal;
