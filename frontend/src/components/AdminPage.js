import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Edit, Delete, Check, Close } from '@mui/icons-material';
import axios from 'axios';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const { id } = useParams();  // For editing a specific user
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
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/user', {
            headers: {
              'x-auth-token': token,
            },
          });
        setUsers(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

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
  const handleDelete = async (userId) => {
    try {
      const response = await axios.delete('/api/admin/user/' + userId, {
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

  // Handle user update logic (if needed)

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
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {user.isActive ? (
                    <IconButton onClick={() => handleActivateDeactivate(user._id, true)}>
                      <Check />
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => handleActivateDeactivate(user._id, false)}>
                      <Close />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell align="right">
                  {id !== user._id && (
                    <>
                      <IconButton onClick={() => navigate(`/users/${user._id}/edit`)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(user._id)}>
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
    </div>
  );
};

export default AdminPage;
