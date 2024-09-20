import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  TextField,
  IconButton,
  Tooltip,
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
  Download as DownloadIcon,
} from '@mui/icons-material';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  // Fetch data from "equipment" table
  const fetchEquipments = async () => {
    const { data, error } = await supabase.from('equipment').select('*');
    if (error) {
      showSnackbar(`Error fetching equipment: ${error.message}`, 'error');
    } else {
      setEquipments(data);
    }
  };

  // Fetch the equipments when the component mounts
  useEffect(() => {
    fetchEquipments();
  }, []);

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

  const calculateCurrentValue = (cost, depreciation_rate, purchase_date) => {
    const purchaseDate = new Date(purchase_date);
    const currentDate = new Date();
    const yearsPassed = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365);
    return (cost - (cost * (depreciation_rate / 100) * yearsPassed)).toFixed(2);
  };

  // Function to generate CSV download data
  const csvData = equipments.map((equipment) => ({
    name: equipment.name,
    model: equipment.model,
    serial_number: equipment.serial_number,
    purchase_date: new Date(equipment.purchase_date).toLocaleDateString(),
    cost: equipment.cost,
    depreciation_rate: `${equipment.depreciation_rate}%`,
    current_value: calculateCurrentValue(equipment.cost, equipment.depreciation_rate, equipment.purchase_date),
    maintenance_schedule: equipment.maintenance_schedule,
  }));

  // Function to generate PDF report
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Equipment List', 20, 10);
    doc.autoTable({
      head: [['Name', 'Model', 'Serial Number', 'Purchase Date', 'Cost', 'Depreciation Rate', 'Current Value', 'Maintenance Schedule']],
      body: equipments.map(equipment => [
        equipment.name,
        equipment.model,
        equipment.serial_number,
        new Date(equipment.purchase_date).toLocaleDateString(),
        equipment.cost,
        `${equipment.depreciation_rate}%`,
        calculateCurrentValue(equipment.cost, equipment.depreciation_rate, equipment.purchase_date),
        equipment.maintenance_schedule,
      ]),
    });
    doc.save('equipment_list.pdf');
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
              <h1 className="text-xl font-semibold text-blue-800 ml-2">Manage Gym Equipment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Tooltip title="Add new equipment">
                <span>
                  <IconButton onClick={handleOpenDialog} className="bg-blue-500 text-white rounded-full p-2">
                    <AddIcon style={{ fontSize: '1.75rem' }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Download CSV">
                <span>
                  <CSVLink data={csvData} filename="equipment_list.csv">
                    <IconButton className="bg-green-500 text-white rounded-full p-2">
                      <DownloadIcon />
                    </IconButton>
                  </CSVLink>
                </span>
              </Tooltip>
              <Tooltip title="Download PDF">
                <span>
                  <IconButton onClick={downloadPDF} className="bg-red-500 text-white rounded-full p-2">
                    <DownloadIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 space-x-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depreciation Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maintenance Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipments.map((equipment) => (
                <tr key={equipment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{equipment.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{equipment.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{equipment.serial_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(equipment.purchase_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{equipment.cost}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{equipment.depreciation_rate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {calculateCurrentValue(equipment.cost, equipment.depreciation_rate, equipment.purchase_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{equipment.maintenance_schedule}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <IconButton onClick={() => handleEditEquipment(equipment)} className="text-blue-500">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteEquipment(equipment.id)} className="text-red-500">
                      <DeleteIcon />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Gym Equipment' : 'Add New Gym Equipment'}</DialogTitle>
        <DialogContent className="space-y-4">
          <TextField
            label="Equipment Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.name}
            onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
            className="mt-2"
          />
          <TextField
            label="Model"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.model}
            onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
            className="mt-2"
          />
          <TextField
            label="Serial Number"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.serial_number}
            onChange={(e) => setNewEquipment({ ...newEquipment, serial_number: e.target.value })}
            className="mt-2"
          />
          <TextField
            label="Purchase Date"
            variant="outlined"
            type="date"
            fullWidth
            margin="dense"
            value={newEquipment.purchase_date}
            onChange={(e) => setNewEquipment({ ...newEquipment, purchase_date: e.target.value })}
            className="mt-2"
          />
          <TextField
            label="Cost"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.cost}
            onChange={(e) => setNewEquipment({ ...newEquipment, cost: e.target.value })}
            className="mt-2"
          />
          <TextField
            label="Depreciation Rate (%)"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.depreciation_rate}
            onChange={(e) => setNewEquipment({ ...newEquipment, depreciation_rate: e.target.value })}
            className="mt-2"
          />
          <TextField
            label="Maintenance Schedule"
            variant="outlined"
            fullWidth
            margin="dense"
            value={newEquipment.maintenance_schedule}
            onChange={(e) => setNewEquipment({ ...newEquipment, maintenance_schedule: e.target.value })}
            className="mt-2"
          />
        </DialogContent>
        <DialogActions className="bg-gray-100">
          <Button onClick={() => setOpenDialog(false)} className="bg-gray-300 text-gray-700 hover:bg-gray-400">
            Cancel
          </Button>
          <Button onClick={handleSaveEquipment} className="bg-blue-500 text-white hover:bg-blue-600">
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
