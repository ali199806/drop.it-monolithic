import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Edit, Delete, Check, Close } from '@mui/icons-material';


import axios from 'axios';

const PAGE_SIZE = 10; // Number of users to display per page

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [id, setId] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  let token;

  
  try {
    token = location.state.token;
    // Use the token here
  } catch (error) {
    console.error('Error reading token:', error);
    token = null; // Assign a default value
  }

    // State variables for user update
    const [editUser, setEditUser] = useState({ username: '', totalStorage: 0 });
    const [isEditing, setIsEditing] = useState(false);
    
  // Fetch users on component mount

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/api/admin/user?page=${currentPage}&pageSize=${PAGE_SIZE}`, {
            headers: {
              'x-auth-token': token,
            },
          });
        setUsers(response.data);
        console.log(users)
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, [currentPage]);

  // Handle user activation/deactivation
  const handleActivateDeactivate = async (userId, isActive) => {
    const url = isActive ? '/api/admin/user/' + userId + '/deactivate' : '/api/admin/user/' + userId + '/activate';
    try {
        const response = await axios.put(
            url,
            {},
            {
              headers: {
                'x-auth-token': token,
              },
            }
          );
      if (response.data.message === 'User activated successfully' || response.data.message === 'User deactivated successfully') {
        const updatedUsers = users.map(user => user._id === userId ? { ...user, isActive: !isActive } : user);
        setUsers(updatedUsers);
      } else {
        console.error('Error activating/deactivating user');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle user deletion
  const handleDelete = async (userId, storageId) => {
    try {
      const response = await axios.delete('/api/admin/user/' + userId + '/' + storageId, {

        headers: {
            'x-auth-token': token,
        }
      });
      if (response.data.message === 'User deleted successfully') {
        setUsers(users.filter(user => user._id !== userId));
      } else {
        console.error('Error deleting user');
      }
    } catch (error) {
      console.error(error);
    }
  };
  


  const handleEditButton = (userId, username, storage) => {
    setIsEditing(true);
    setId(userId);
    const fetchedUser = {
      username: username,
      totalStorage: storage,  // previous totalStorage value
    };
    setEditUser(fetchedUser);
  }

// Handle user update logic
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setEditUser({ ...editUser, [name]: value });
};

const handleSubmit = async (Id) => {
  try {
    const response = await axios.put(`/api/admin/user/${Id}`, editUser, {
      headers: {
        'x-auth-token': token,
      },
    });
    if (response.data.message === 'User updated successfully') {
      const updatedUsers = users.map(user => user.userId._id === Id ? { ...user, ...editUser } : user);
      setUsers(updatedUsers);
      setIsEditing(false);
    } else {
      console.error('Error updating user');
    }
  } catch (error) {
    console.error(error);
  }
};

return (
  <div>
    <Typography variant="h5">User Management</Typography>
    <TableContainer sx={{ width: '100%' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Used Storage</TableCell>
            <TableCell>Total Storage</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.userId.username}</TableCell>
              <TableCell>{user.userId.isAdmin ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                {user.userId.isActive ? (
                  <IconButton onClick={() => handleActivateDeactivate(user.userId._id, true)}>
                    <Check />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => handleActivateDeactivate(user.userId._id, false)}>
                    <Close />
                  </IconButton>
                )}
              </TableCell>
              <TableCell>{user.usedStorage}</TableCell>
              <TableCell>{user.totalStorage}</TableCell>
              <TableCell align="right">
                {isEditing && id === user.userId._id ? (
                  <>
                    <TextField
                      name="username"
                      value={editUser.username}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="Username"
                    />
                    <TextField
                      name="totalStorage"
                      type="number"
                      value={editUser.totalStorage}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="Storage"
                    />
                    <IconButton onClick={() => handleSubmit(user.userId._id)}>
                      <Check />
                    </IconButton>
                    <IconButton onClick={() => setIsEditing(false)}>
                      <Close />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => handleEditButton(user.userId._id, user.userId.username, user.totalStorage)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.userId._id, user._id )}>
                      <Delete />
                    </IconButton>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    {/* Pagination controls */}
    <div>
      <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
      <Button disabled={users.length < PAGE_SIZE} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
    </div>
  </div>
);
};

export default AdminPage;
