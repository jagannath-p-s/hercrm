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

const Equipment = () => {
  const [equipments, setEquipments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    cost: '',
    depreciation_rate: '',
    maintenance_schedule: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchEquipments();
  }, []);

  // Fetch data from "equipment" table
  const fetchEquipments = async () => {
    const { data, error } = await supabase.from('equipment').select('*');
    if (error) {
      showSnackbar(`Error fetching equipment: ${error.message}`, 'error');
    } else {
      setEquipments(data);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setEditMode(false);
    setNewEquipment({
      name: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      cost: '',
      depreciation_rate: '',
      maintenance_schedule: '',
    });
  };

  const handleEditEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setNewEquipment(equipment);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteEquipment = async (id) => {
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) {
      showSnackbar(`Error deleting equipment: ${error.message}`, 'error');
    } else {
      showSnackbar('Equipment deleted successfully', 'success');
      fetchEquipments();
    }
  };

  const handleSaveEquipment = async () => {
    const fieldsToSave = {
      name: newEquipment.name,
      model: newEquipment.model,
      serial_number: newEquipment.serial_number,
      purchase_date: newEquipment.purchase_date,
      cost: parseFloat(newEquipment.cost),
      depreciation_rate: parseFloat(newEquipment.depreciation_rate),
      maintenance_schedule: newEquipment.maintenance_schedule,
    };

    let response;
    if (editMode) {
      response = await supabase
        .from('equipment')
        .update(fieldsToSave)
        .eq('id', selectedEquipment.id);
    } else {
      response = await supabase.from('equipment').insert([fieldsToSave]);
    }

    const { error } = response;
    if (error) {
      showSnackbar(`Error saving equipment: ${error.message}`, 'error');
    } else {
      showSnackbar('Equipment saved successfully', 'success');
      fetchEquipments();
      setOpenDialog(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold ml-2">Manage Equipment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Tooltip title="Add new equipment">
                <IconButton onClick={handleOpenDialog} style={{ backgroundColor: '#e3f2fd', color: '#1e88e5', borderRadius: '12px' }}>
                  <AddIcon style={{ fontSize: '1.75rem' }} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 space-x-4 overflow-x-auto">
        <TableContainer component={Paper} className="shadow-md sm:rounded-lg overflow-auto">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Equipment Name</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Depreciation Rate</TableCell>
                <TableCell>Maintenance Schedule</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipments.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell>{equipment.name}</TableCell>
                  <TableCell>{equipment.model}</TableCell>
                  <TableCell>{equipment.serial_number}</TableCell>
                  <TableCell>{new Date(equipment.purchase_date).toLocaleDateString()}</TableCell>
                  <TableCell>{equipment.cost}</TableCell>
                  <TableCell>{equipment.depreciation_rate}%</TableCell>
                  <TableCell>{equipment.maintenance_schedule}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditEquipment(equipment)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteEquipment(equipment.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Equipment Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.name}
            onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
            className="mt-2 mb-4"
          />
          <TextField
            label="Model"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.model}
            onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
            className="mt-2 mb-4"
          />
          <TextField
            label="Serial Number"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.serial_number}
            onChange={(e) => setNewEquipment({ ...newEquipment, serial_number: e.target.value })}
            className="mt-2 mb-4"
          />
          <TextField
            label="Purchase Date"
            variant="outlined"
            type="date"
            fullWidth
            margin="dense"
            value={newEquipment.purchase_date}
            onChange={(e) => setNewEquipment({ ...newEquipment, purchase_date: e.target.value })}
            className="mt-2 mb-4"
          />
          <TextField
            label="Cost"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.cost}
            onChange={(e) => setNewEquipment({ ...newEquipment, cost: e.target.value })}
            className="mt-2 mb-4"
          />
          <TextField
            label="Depreciation Rate (%)"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.depreciation_rate}
            onChange={(e) => setNewEquipment({ ...newEquipment, depreciation_rate: e.target.value })}
            className="mt-2 mb-4"
          />
          <TextField
            label="Maintenance Schedule"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.maintenance_schedule}
            onChange={(e) => setNewEquipment({ ...newEquipment, maintenance_schedule: e.target.value })}
            className="mt-2 mb-4"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveEquipment} color="primary">
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

export default Equipment;
