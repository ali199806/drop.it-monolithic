import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import './DirectoryBrowser.css'; 
import Header from './Header';

import UploadModal from './UploadModal';
import NewFolderModal from './NewFolderModal';
import FileInfoModal from './FileInfoModal';

function DirectoryBrowser() {
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
    // Extract the file name from the File object
    const fileName = file.name;

    // Construct the new path that includes the directory and the file name
    const fullPath = `${path}/${fileName}`;
    // Append the path to the form data
    formData.append('path', path);
    console.log(`Path: ${path}`)

    try {
      const response = await axios.post('/api/storage/upload', formData, {
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
      if (error.response) {
        
        const { status, data } = error.response;

        console.error(`Error: ${data.error} (Status code: ${status})`);
        
      if (status === 400 && data.error === 'Storage limit exceeded. Cannot upload File') {
            alert('!!! Error !!! Storage limit exceeded. Cannot upload file.');
          } else if(status === 400 && data.error === 'Storage limit exceeded. File Uploaded.') {
            try {
              // Retrieve item size before deleting
              const response = await axios.get(`/api/storage/info`, {
                params: { path: fullPath },
                headers: {
                  'x-auth-token': token,
                },
              });
              const itemSize = response.data.size;
        
              await axios.delete(`/api/storage/delete`, {
                params: { path: fullPath, type: 'file' , size: itemSize}, // Pass item type in the request
                headers: {
                  'x-auth-token': token,
                },
              });
               // Close the modal after successful deletion
            } catch (error) {
              console.error('Failed to delete item:', error);
              // Handle error appropriately
            }
            alert('!!! Warning !!! Cannot upload file. Please choose a file smaller than 10mb');
          }
          else {
            // Handle other status codes or general error
            alert('An error occurred. Please try again later.');
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error(error.request);
          alert('No response from server. Please check your network connection.');
        } else {
          // Something happened in setting up the request that triggered an error
          console.error('Error', error.message);
          alert('An unexpected error occurred. Please try again.');
        }
      }
  };
  

  const handleCreateFolder = async (folderName) => {
    console.log(path)
    console.log("Inside Create New Folder");
    try {
      await axios.post('/api/storage/create-folder', { path: path || '', folderName }, {
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
        const response = await axios.get(`/api/storage/browse`, {
            params: { path }, 
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
      await axios.post('/api/storage/create-folder', { path: path || '', folderName: newFolderName }, 
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


const downloadFile = async (path) => {
  try {
    const response = await axios.get(`/api/storage/download?path=${encodeURIComponent(path)}`, {
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


  const handleCloseUploadModal = () => {
    setUploadModalVisible(false);
    fetchFolders(path);
  }

  const handleCloseInfoModal = () => {
    setInfoModalVisible(false)
    fetchFolders(path)
  }


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
        onClose={() => handleCloseUploadModal()}
        onUpload={(file) => handleUpload(file)}
      />
<FileInfoModal
  itemType={selectedItemType}
  itemPath={selectedItemPath}
  onClose={() => handleCloseInfoModal()}
  visible={infoModalVisible}
/>

      <div className="folder-grid">
      {folders.map((item, index) => (
        <div key={index} className="folder-item" onClick={() => handleItemClick(item)}>
          <img src={getIconForFile(item)} alt={item.type} className="folder-icon" />
          
          <p className="item-name">{item.name}</p>

          <img src={require('../icons/info.png')} alt="Info Icon" className="info-icon" onClick={(e) => { e.stopPropagation(); handleInfoClick(`${path ? `${path}/` : ''}${item.name}`, item.type); }} />
        </div>
        
      ))}
      
        </div>
      {error && <p className="error-message">{error}</p>}
    </div>
    
  );
}

export default DirectoryBrowser;
