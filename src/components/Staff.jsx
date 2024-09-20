import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Menu,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Key as KeyIcon,
  Description as DescriptionIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    useremail: '',
    role: 'Admin',
    mobile_number: '',
    employee_code: '',
    subscription_end: null,
    active: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data, error } = await supabase.from('staffs').select('*');
    if (error) {
      console.error('Error fetching staff:', error);
    } else {
      setStaff(data);
    }
  };

  const handleOpenDialog = (type, staffMember = null) => {
    setDialogType(type);
    setSelectedStaff(staffMember);
    if (staffMember) {
      setFormData({
        username: staffMember.username,
        useremail: staffMember.useremail,
        role: staffMember.role,
        mobile_number: staffMember.mobile_number,
        employee_code: staffMember.employee_code,
        subscription_end: staffMember.subscription_end || null,
        active: staffMember.active,
      });
    } else {
      setFormData({
        username: '',
        useremail: '',
        role: 'Admin',
        mobile_number: '',
        employee_code: '',
        subscription_end: null,
        active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (staffId) => {
    const { error } = await supabase.from('staffs').delete().eq('id', staffId);
    if (error) {
      console.error('Error deleting staff:', error);
      setSnackbar({ open: true, message: 'Failed to delete staff', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Staff deleted successfully', severity: 'success' });
      fetchStaff(); // Refresh the data
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (dialogType === 'add') {
      result = await supabase.from('staffs').insert([formData]);
    } else if (dialogType === 'edit') {
      result = await supabase
        .from('staffs')
        .update(formData)
        .eq('id', selectedStaff.id);
    }

    if (result.error) {
      console.error('Error:', result.error);
      setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Operation successful', severity: 'success' });
      fetchStaff(); // Refresh the data dynamically
      handleCloseDialog();
    }
  };

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <div className="p-6  space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold ">Staff Management</h2>
        <Button
          variant="contained"
          style={{ backgroundColor: "#4F46E5", color: "#FFF" }}
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          ADD STAFF
        </Button>
      </div>

      {/* Staff Table */}
      <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
        <Table>
          <TableHead >
            <TableRow>
              <TableCell className="font-bold">#</TableCell>
              <TableCell className="font-bold">Username</TableCell>
              <TableCell className="font-bold">Email</TableCell>
              <TableCell className="font-bold">Role</TableCell>
              <TableCell className="font-bold">Mobile Number</TableCell>
              <TableCell className="font-bold">Employee Code</TableCell>
              <TableCell className="font-bold">Subscription End</TableCell>
              <TableCell className="font-bold">Active</TableCell>
              <TableCell className="font-bold">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((staffMember, index) => (
              <TableRow key={staffMember.id} hover style={{ backgroundColor: '#FFF' }}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{staffMember.username}</TableCell>
                <TableCell>{staffMember.useremail}</TableCell>
                <TableCell>{staffMember.role}</TableCell>
                <TableCell>{staffMember.mobile_number}</TableCell>
                <TableCell>{staffMember.employee_code}</TableCell>
                <TableCell>{staffMember.subscription_end}</TableCell>
                <TableCell>
                  <Switch checked={staffMember.active} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={handleMenuClick}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                  >
                    <ListItem button onClick={() => handleOpenDialog('edit', staffMember)}>
                      <ListItemIcon><EditIcon /></ListItemIcon>
                      <ListItemText primary="Edit" />
                    </ListItem>
                    <ListItem button onClick={() => handleOpenDialog('changePassword', staffMember)}>
                      <ListItemIcon><KeyIcon /></ListItemIcon>
                      <ListItemText primary="Change Password" />
                    </ListItem>
                    <ListItem button onClick={() => handleDelete(staffMember.id)}>
                      <ListItemIcon><DeleteIcon /></ListItemIcon>
                      <ListItemText primary="Delete" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DescriptionIcon /></ListItemIcon>
                      <ListItemText primary="View Details" />
                    </ListItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Adding/Editing/Changing Password */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogType === 'add'
            ? 'Add New Staff'
            : dialogType === 'edit'
            ? 'Edit Staff'
            : 'Change Password'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              name="username"
              label="Username"
              type="text"
              fullWidth
              value={formData.username}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="useremail"
              label="Email"
              type="email"
              fullWidth
              value={formData.useremail}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="role"
              label="Role"
              type="text"
              fullWidth
              value={formData.role}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="mobile_number"
              label="Mobile Number"
              type="tel"
              fullWidth
              value={formData.mobile_number}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="employee_code"
              label="Employee Code"
              type="text"
              fullWidth
              value={formData.employee_code}
              onChange={handleInputChange}
              required
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Subscription End"
                value={formData.subscription_end}
                onChange={(newValue) => {
                  setFormData({ ...formData, subscription_end: newValue });
                }}
                renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
              />
            </LocalizationProvider>
            <Switch
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              label="Active"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {dialogType === 'add' ? 'Add' : dialogType === 'edit' ? 'Update' : 'Change Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Staff;
