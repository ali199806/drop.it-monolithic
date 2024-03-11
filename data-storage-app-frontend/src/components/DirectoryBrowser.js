import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams to access route parameters
import { useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import './DirectoryBrowser.css'; 
import Header from './Header';

import UploadModal from './UploadModal';
import NewFolderModal from './NewFolderModal';
import FileInfoModal from './FileInfoModal';

function DirectoryBrowser() {
//   const { path } = useParams(); // Get the path parameter from the URL
  const [path, setPath] = useState('');

  const location = useLocation();
  let token;

  try {
    token = location.state.token;
    // Use the token here
  } catch (error) {
    console.error('Error reading token:', error);
    token = null; // Assign a default value
  }
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState('');
  const [pathHistory, setPathHistory] = useState([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedItemPath, setSelectedItemPath] = useState('');
  const [selectedItemType, setSelectedItemType] = useState('');
  
  

  
  const fileIcons = {
    'folder': require("../icons/folder-icon.png"),
    'txt': require("../icons/text-icon.png"),
    'doc': require("../icons/word-icon.png"),
    'docx': require("../icons/word-icon.png"),
    'xls': require("../icons/excel-icon.png"),
    'xlsx': require("../icons/excel-icon.png"),
    'pdf': require("../icons/pdf-icon.png"),
    'jpg': require("../icons/image-icon.png"),
    'png': require("../icons/image-icon.png"),
    // Add more file extensions and icons as needed
  };
  


  useEffect(() => {
    if (!token) {
      console.log("Not authorized")
      return <Navigate to="/login" replace />;
    }
    fetchFolders(path);
  }, [path]);



  function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }
  
  // Usage:


  function getIconForFile(item) {
    if (item.type === 'folder') {
      return fileIcons['folder'];
    }
  
    // Get the file extension
    const extension = getFileExtension(item.name);
    console.log(`File Extention: ${extension}`)
  
    // Get the icon from the mapping
    const icon = fileIcons[extension];
  
    // If there's no icon for this extension, use a default icon
    return icon || require("../icons/default-icon.png");
  }

  const handleInfoClick = (itemPath, itemType) => {
    console.log(`Info Path: ${itemPath}`)
    setSelectedItemPath(itemPath);
    setSelectedItemType(itemType);
    setInfoModalVisible(true);
  };
  
  const handleUpload = async (file) => {
    // Create a new FormData instance
    const formData = new FormData();
  
    // Append the file to the form data
    formData.append('file', file);
  
    // Append the path to the form data
    formData.append('path', path);
    console.log(`Path: ${path}`)

    try {
      // Send a POST request to the '/upload' endpoint with the form data
      const response = await axios.post('http://localhost:4005/api/storage/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
          'path': path,
        },
      });
      fetchFolders(path);
      // Log the response from the server
      console.log(response.data);
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };
  

  const handleCreateFolder = async (folderName) => {
    console.log(path)
    console.log("Inside Create New Folder");
    try {
      // Implement new folder creation logic here
      await axios.post('http://localhost:4005/api/storage/create-folder', { path: path || '', folderName }, {
        headers: {
          'x-auth-token': token
        }
      });
      // Refresh folders list after creating a new folder
      fetchFolders(path);
      console.log('Folder created successfully:', folderName);
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('An error occurred while creating the folder.');
    }
  };

  const fetchFolders = async (path) => {
    try {
        const response = await axios.get(`http://localhost:4005/api/storage/browse`, {
            params: { path }, // This is where you pass the path as a query parameter
            headers: {
              'x-auth-token': token,
            },
          });
      setFolders(response.data);
    } catch (error) {
      setError('An error occurred while fetching folders.');
    }
  };

  const handleNewFolder = async () => {
    try {
      await axios.post('http://localhost:4005/api/storage/create-folder', { path: path || '', folderName: newFolderName }, 
      {
        headers: {
          'x-auth-token': token
        }
      });
      // Refresh folders list after creating a new folder
      fetchFolders(path);
      setNewFolderName(''); // Clear input field
    } catch (error) {
      setError('An error occurred while creating the folder.');
    }
  };

//   const handleItemClick = (item) => {
//     if (item.type === 'folder') {
//       // For folders, fetch the contents using the folder path as a query parameter
//       const newPath = path ? `${path}/${encodeURIComponent(item.name)}` : encodeURIComponent(item.name);
//       setPathHistory(prev => [...prev, path]); // Store the current path in history
//       setPath(newPath); // Update the current path
//       fetchFolders(newPath); // Fetch the new folder's contents
//     } else {
//       // For files, you can trigger a download or preview
//       console.log(`Opening file: ${item.name}`);
//       // Implement file opening logic here
//     }
//   };

//   const handleBackClick = () => {
//     // Remove the last path from history and update the current path
//     setPathHistory(prev => {
//       const newPathHistory = [...prev];
//       const prevPath = newPathHistory.pop(); // Remove the last path, which is the current one
//       fetchFolders(prevPath || ''); // Fetch folders for the previous path or root if undefined
//       return newPathHistory;
//     });
//   };

const downloadFile = async (path) => {
  try {
    const response = await axios.get(`http://localhost:4005/api/storage/download?path=${encodeURIComponent(path)}`, {
      responseType: 'blob', // Important for correct file download
      headers: {
        'x-auth-token': token
      }
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', path.split('/').pop()); // Use the last part of the path as the filename
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error(error);
  }
};


const handleItemClick = (item) => {
    if (item.type === 'folder') {
      const newPath = path ? `${path}/${encodeURIComponent(item.name).replace(/%20/g, ' ')}` : encodeURIComponent(item.name).replace(/%20/g, ' ');      console.log(`Opening file: ${item.name}`);
      setPathHistory((prev) => [...prev, path]); // Store the current path in history
      fetchFolders(newPath);
      setPath(newPath);
      console.log(`Current Path: ${path}`);
      console.log(`New Path: ${newPath}`)
    } else {
      const newPath = path ? `${path}/${encodeURIComponent(item.name).replace(/%20/g, ' ')}` : encodeURIComponent(item.name).replace(/%20/g, ' ');      console.log(`Opening file: ${item.name}`);
      downloadFile(newPath);
      // Implement file opening logic here
    }
  };

  const handleBackClick = () => {
    // Remove the last path from history and update the current path
    setPathHistory((prev) => {
      const newPathHistory = [...prev];
      const prevPath = newPathHistory.pop() || ''; // Remove the last path or set to root if undefined
      setPath(prevPath);
      fetchFolders(prevPath);
      console.log(`Current Path: ${prevPath}`);

      return newPathHistory;
    });
  };


return (
    <div className="directory-browser">
      <Header />
      <div className="button-container">
    {pathHistory.length > 0 && (
      <button className="button back-button" onClick={handleBackClick}>Back</button>
    )}
    <button className="button new-folder-button" onClick={() => setNewFolderModalVisible(true)}>New Folder</button>
    <button className="button new-folder-button" onClick={() => setUploadModalVisible(true)}>Upload</button>

  </div>
  
  <NewFolderModal
        visible={newFolderModalVisible}
        onClose={() => setNewFolderModalVisible(false)}
        onCreate={handleCreateFolder}
      />

  <UploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUpload={(file) => handleUpload(file)}
      />
<FileInfoModal
  itemType={selectedItemType}
  itemPath={selectedItemPath}
  onClose={() => setInfoModalVisible(false)}
  visible={infoModalVisible}
/>

      <div className="folder-grid">
      {folders.map((item, index) => (
        <div key={index} className="folder-item" onClick={() => handleItemClick(item)}>
          <img src={getIconForFile(item)} alt={item.type} className="folder-icon" />
          
          <p className="item-name">{item.name}</p>
          {/* Add an info icon/button here */}
          <button className="info-button" onClick={(e) => { e.stopPropagation(); handleInfoClick(`${path ? `${path}/` : ''}${item.name}`, item.type); }}>Info</button>
        </div>
        
      ))}
      
        </div>
      {error && <p className="error-message">{error}</p>}
    </div>
    
  );
}

export default DirectoryBrowser;
