import React, { useState } from 'react';
import { Modal, Button } from 'antd';

function UploadModal({ visible, onClose, onUpload }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
      onClose();
    }
  };

  return (
    <Modal
      title="Upload File"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="upload" type="primary" onClick={handleUpload}>Upload</Button>,
      ]}
    >
      <input type="file" onChange={handleFileChange} />
    </Modal>
  );
}

export default UploadModal;
