import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  TextField,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [newMembership, setNewMembership] = useState({
    member_id: '',
    membership_type: '',
    start_date: '',
    end_date: '',
    amount_due: '',
  });
  const [members, setMembers] = useState([]); // For fetching and selecting members
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchMemberships();
    fetchMembers();
  }, []);

  // Fetch memberships from the database
  const fetchMemberships = async () => {
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        id,
        member_id,
        start_date,
        end_date,
        membership_type,
        amount_due,
        amount_paid,
        status,
        members (first_name, last_name)
      `);

    if (error) {
      showSnackbar(`Error fetching memberships: ${error.message}`, 'error');
    } else {
      setMemberships(data);
    }
  };

  // Fetch all members for the member selection dropdown
  const fetchMembers = async () => {
    const { data, error } = await supabase.from('members').select('id, first_name, last_name');
    if (error) {
      showSnackbar(`Error fetching members: ${error.message}`, 'error');
    } else {
      setMembers(data);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setEditMode(false);
    setNewMembership({
      member_id: '',
      membership_type: '',
      start_date: '',
      end_date: '',
      amount_due: '',
    });
  };

  const handleEditMembership = (membership) => {
    setSelectedMembership(membership);
    setNewMembership({
      member_id: membership.member_id,
      membership_type: membership.membership_type,
      start_date: membership.start_date,
      end_date: membership.end_date,
      amount_due: membership.amount_due,
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteMembership = async (id) => {
    const { error } = await supabase.from('memberships').delete().eq('id', id);
    if (error) {
      showSnackbar(`Error deleting membership: ${error.message}`, 'error');
    } else {
      showSnackbar('Membership deleted successfully', 'success');
      fetchMemberships();
    }
  };

  const handleSaveMembership = async () => {
    const fieldsToSave = {
      member_id: newMembership.member_id,
      membership_type: newMembership.membership_type,
      start_date: newMembership.start_date,
      end_date: newMembership.end_date,
      amount_due: parseFloat(newMembership.amount_due),
    };

    let response;
    if (editMode) {
      response = await supabase
        .from('memberships')
        .update(fieldsToSave)
        .eq('id', selectedMembership.id);
    } else {
      response = await supabase.from('memberships').insert([fieldsToSave]);
    }

    const { error } = response;
    if (error) {
      showSnackbar(`Error saving membership: ${error.message}`, 'error');
    } else {
      showSnackbar('Membership saved successfully', 'success');
      fetchMemberships();
      setOpenDialog(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  // Check if a membership is expiring soon (within 7 days)
  const isExpiringSoon = (endDate) => {
    const expirationDate = new Date(endDate);
    const today = new Date();
    const daysLeft = (expirationDate - today) / (1000 * 60 * 60 * 24);
    return daysLeft <= 7;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <h1 className="text-xl font-semibold ml-2">Membership Expiry Notifications</h1>
            <Tooltip title="Add new membership">
              <IconButton
                onClick={handleOpenDialog}
                style={{ backgroundColor: '#e3f2fd', color: '#1e88e5', borderRadius: '12px' }}
              >
                <AddIcon style={{ fontSize: '1.75rem' }} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 space-x-4 overflow-x-auto">
        <TableContainer component={Paper} className="shadow-md sm:rounded-lg overflow-auto">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Member Name</TableCell>
                <TableCell>Membership Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Amount Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {memberships.map((membership) => (
                <TableRow key={membership.id}>
                  <TableCell>
                    {membership.members.first_name} {membership.members.last_name}
                  </TableCell>
                  <TableCell>{membership.membership_type}</TableCell>
                  <TableCell>{new Date(membership.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(membership.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>${membership.amount_due}</TableCell>
                  <TableCell>{membership.status}</TableCell>
                  <TableCell>
                    {isExpiringSoon(membership.end_date) ? (
                      <span style={{ color: 'red' }}>Expiring Soon!</span>
                    ) : (
                      'Active'
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditMembership(membership)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteMembership(membership.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Dialog for Adding/Editing Membership */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Membership' : 'Add New Membership'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Select Member"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newMembership.member_id}
            onChange={(e) => setNewMembership({ ...newMembership, member_id: e.target.value })}
            className="mt-2 mb-4"
            SelectProps={{
              native: true,
            }}
          >
            <option value="">-- Select Member --</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </TextField>
          <TextField
            label="Membership Type"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newMembership.membership_type}
            onChange={(e) => setNewMembership({ ...newMembership, membership_type: e.target.value })}
            className="mt-2 mb-4"
          />
          <TextField
            label="Start Date"
            variant="outlined"
            type="date"
            fullWidth
            margin="dense"
            value={newMembership.start_date}
            onChange={(e) => setNewMembership({ ...newMembership, start_date: e.target.value })}
            className="mt-2 mb-4"
          />
          <TextField
            label="End Date"
            variant="outlined"
            type="date"
            fullWidth
            margin="dense"
            value={newMembership.end_date}
            onChange={(e) => setNewMembership({ ...newMembership, end_date: e.target.value })}
            className="mt-2 mb-4"
          />
          <TextField
            label="Amount Due"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newMembership.amount_due}
            onChange={(e) => setNewMembership({ ...newMembership, amount_due: e.target.value })}
            className="mt-2 mb-4"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveMembership} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Memberships;
