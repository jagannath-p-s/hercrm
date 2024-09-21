import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../supabaseClient';

const Equipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [newEquipment, setNewEquipment] = useState({
    equipment_name: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    cost: '',
    depreciation_rate: '',
    maintenance_schedule: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null); // For download menu

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    applySearch();
  }, [searchTerm, equipmentList]);

  // Fetch equipment data from Supabase
  const fetchEquipment = async () => {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('equipment_name', { ascending: true });

    if (error) {
      showSnackbar(`Error fetching equipment: ${error.message}`, 'error');
    } else {
      // Calculate current value for each equipment
      const updatedData = data.map((item) => {
        const currentValue = calculateCurrentValue(
          item.cost,
          item.depreciation_rate,
          item.purchase_date
        );
        return { ...item, current_value: currentValue };
      });
      setEquipmentList(updatedData);
      setFilteredEquipment(updatedData);
    }
  };

  // Calculate current value based on cost, depreciation rate, and time since purchase
  const calculateCurrentValue = (cost, depreciationRate, purchaseDate) => {
    if (!cost || !depreciationRate || !purchaseDate) return null;
    const yearsElapsed = (new Date() - new Date(purchaseDate)) / (1000 * 60 * 60 * 24 * 365.25);
    const depreciationAmount = cost * (depreciationRate / 100) * yearsElapsed;
    const currentValue = cost - depreciationAmount;
    return currentValue > 0 ? currentValue.toFixed(2) : '0.00';
  };

  // Apply search filter
  const applySearch = () => {
    if (!searchTerm) {
      setFilteredEquipment(equipmentList);
      return;
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const filtered = equipmentList.filter((item) => {
      const itemString = `
        ${item.equipment_name}
        ${item.model}
        ${item.serial_number}
        ${item.purchase_date}
        ${item.cost}
        ${item.depreciation_rate}
        ${item.current_value}
        ${item.maintenance_schedule}
        ${item.last_maintenance_date}
        ${item.next_maintenance_date}
      `
        .toString()
        .toLowerCase();

      return itemString.includes(lowercasedSearchTerm);
    });

    setFilteredEquipment(filtered);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setEditMode(false);
    setNewEquipment({
      equipment_name: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      cost: '',
      depreciation_rate: '',
      maintenance_schedule: '',
      last_maintenance_date: '',
      next_maintenance_date: '',
    });
  };

  const handleEditEquipment = (item) => {
    setSelectedEquipment(item);
    setNewEquipment({
      equipment_name: item.equipment_name || '',
      model: item.model || '',
      serial_number: item.serial_number || '',
      purchase_date: item.purchase_date ? item.purchase_date.split('T')[0] : '',
      cost: item.cost || '',
      depreciation_rate: item.depreciation_rate || '',
      maintenance_schedule: item.maintenance_schedule || '',
      last_maintenance_date: item.last_maintenance_date ? item.last_maintenance_date.split('T')[0] : '',
      next_maintenance_date: item.next_maintenance_date ? item.next_maintenance_date.split('T')[0] : '',
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteEquipment = async (id) => {
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) {
      showSnackbar(`Error deleting equipment: ${error.message}`, 'error');
    } else {
      showSnackbar('Equipment deleted successfully', 'success');
      fetchEquipment();
    }
  };

  const handleSaveEquipment = async () => {
    const fieldsToSave = {
      equipment_name: newEquipment.equipment_name,
      model: newEquipment.model,
      serial_number: newEquipment.serial_number,
      purchase_date: newEquipment.purchase_date || null,
      cost: newEquipment.cost ? parseFloat(newEquipment.cost) : null,
      depreciation_rate: newEquipment.depreciation_rate ? parseFloat(newEquipment.depreciation_rate) : null,
      maintenance_schedule: newEquipment.maintenance_schedule,
      last_maintenance_date: newEquipment.last_maintenance_date || null,
      next_maintenance_date: newEquipment.next_maintenance_date || null,
    };

    let response;
    if (editMode) {
      response = await supabase.from('equipment').update(fieldsToSave).eq('id', selectedEquipment.id);
    } else {
      response = await supabase.from('equipment').insert([fieldsToSave]);
    }

    const { error } = response;
    if (error) {
      showSnackbar(`Error saving equipment: ${error.message}`, 'error');
    } else {
      showSnackbar('Equipment saved successfully', 'success');
      fetchEquipment();
      setOpenDialog(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  // **Calculate total current value of all equipment instead of total cost**
  const totalCurrentValue = equipmentList.reduce((sum, item) => sum + (parseFloat(item.current_value) || 0), 0).toFixed(2);

  // Download menu handling
  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = (format) => {
    if (format === 'CSV') {
      downloadCSV();
    } else if (format === 'PDF') {
      downloadPDF();
    }
    handleDownloadClose();
  };

  // Download as CSV
  const downloadCSV = () => {
    const headers = [
      'Serial Number',
      'Equipment Name',
      'Model',
      'Serial Number',
      'Purchase Date',
      'Cost',
      'Depreciation Rate (%)',
      'Current Value',
      'Maintenance Schedule',
      'Last Maintenance Date',
      'Next Maintenance Date',
    ];
    const rows = equipmentList.map((item, index) => [
      index + 1,
      item.equipment_name,
      item.model,
      item.serial_number,
      item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : '',
      item.cost !== null ? item.cost : '',
      item.depreciation_rate !== null ? item.depreciation_rate : '',
      item.current_value !== null ? item.current_value : '',
      item.maintenance_schedule,
      item.last_maintenance_date ? new Date(item.last_maintenance_date).toLocaleDateString() : '',
      item.next_maintenance_date ? new Date(item.next_maintenance_date).toLocaleDateString() : '',
    ]);

    let csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'equipment_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Equipment Data', 14, 20);
    const tableColumn = [
      'Serial No.',
      'Equipment Name',
      'Model',
      'Serial Number',
      'Purchase Date',
      'Cost',
      'Depreciation Rate (%)',
      'Current Value',
      'Maintenance Schedule',
      'Last Maintenance Date',
      'Next Maintenance Date',
    ];
    const tableRows = [];

    equipmentList.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.equipment_name,
        item.model,
        item.serial_number,
        item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : '',
        item.cost !== null ? item.cost : '',
        item.depreciation_rate !== null ? item.depreciation_rate : '',
        item.current_value !== null ? item.current_value : '',
        item.maintenance_schedule,
        item.last_maintenance_date ? new Date(item.last_maintenance_date).toLocaleDateString() : '',
        item.next_maintenance_date ? new Date(item.next_maintenance_date).toLocaleDateString() : '',
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 7 },
    });
    doc.save('equipment_data.pdf');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3">
            <div className="flex flex-col sm:flex-row items-center">
            
              <div className="ml-0 sm:ml-4 text-gray-600">
                {/* Display Total Equipment and Total Current Value */}
                <span> Equipments : {equipmentList.length}</span>
                <span className="ml-4"> Current Value : ₹{totalCurrentValue}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TextField
                variant="outlined"
                placeholder="Search..."
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Tooltip title="Download Data">
                <IconButton
                  onClick={handleDownloadClick}
                  style={{ backgroundColor: '#e3f2fd', color: '#1e88e5', borderRadius: '12px' }}
                >
                  <GetAppIcon style={{ fontSize: '1.75rem' }} />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleDownloadClose}
              >
                <MenuItem onClick={() => handleDownload('CSV')}>Download as CSV</MenuItem>
                <MenuItem onClick={() => handleDownload('PDF')}>Download as PDF</MenuItem>
              </Menu>
              <Tooltip title="Add new equipment">
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
      </div>

      {/* Equipment Table */}
      <div className="flex-grow p-4 space-x-4 overflow-x-auto">
        <TableContainer component={Paper} className="shadow-md sm:rounded-lg overflow-auto">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell style={{ minWidth: '50px', textAlign: 'center' }}>S.No</TableCell>
                <TableCell style={{ minWidth: '150px' }}>Equipment Name</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Depreciation Rate (%)</TableCell>
                <TableCell>Current Value</TableCell>
                <TableCell>Maintenance Schedule</TableCell>
                <TableCell>Last Maintenance Date</TableCell>
                <TableCell>Next Maintenance Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEquipment.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell style={{ textAlign: 'center' }}>{index + 1}</TableCell>
                  <TableCell>{item.equipment_name || 'N/A'}</TableCell>
                  <TableCell>{item.model || 'N/A'}</TableCell>
                  <TableCell>{item.serial_number || 'N/A'}</TableCell>
                  <TableCell>
                    {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{item.cost !== null ? item.cost : 'N/A'}</TableCell>
                  <TableCell>
                    {item.depreciation_rate !== null ? item.depreciation_rate : 'N/A'}
                  </TableCell>
                  <TableCell>{item.current_value !== null ? item.current_value : 'N/A'}</TableCell>
                  <TableCell>{item.maintenance_schedule || 'N/A'}</TableCell>
                  <TableCell>
                    {item.last_maintenance_date
                      ? new Date(item.last_maintenance_date).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.next_maintenance_date
                      ? new Date(item.next_maintenance_date).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditEquipment(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteEquipment(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEquipment.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Dialog for Adding/Editing Equipment */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <TextField
              label="Equipment Name"
              variant="outlined"
              fullWidth
              value={newEquipment.equipment_name}
              onChange={(e) => setNewEquipment({ ...newEquipment, equipment_name: e.target.value })}
              required
            />
            <TextField
              label="Model"
              variant="outlined"
              fullWidth
              value={newEquipment.model}
              onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
            />
            <TextField
              label="Serial Number"
              variant="outlined"
              fullWidth
              value={newEquipment.serial_number}
              onChange={(e) => setNewEquipment({ ...newEquipment, serial_number: e.target.value })}
            />
            <TextField
              label="Purchase Date"
              variant="outlined"
              type="date"
              fullWidth
              value={newEquipment.purchase_date}
              onChange={(e) => setNewEquipment({ ...newEquipment, purchase_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Cost"
              variant="outlined"
              fullWidth
              type="number"
              value={newEquipment.cost}
              onChange={(e) => setNewEquipment({ ...newEquipment, cost: e.target.value })}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
            <TextField
              label="Depreciation Rate (%)"
              variant="outlined"
              fullWidth
              type="number"
              value={newEquipment.depreciation_rate}
              onChange={(e) => setNewEquipment({ ...newEquipment, depreciation_rate: e.target.value })}
              InputProps={{ inputProps: { min: 0, max: 100, step: 0.01 } }}
            />
            <TextField
              label="Maintenance Schedule"
              variant="outlined"
              fullWidth
              value={newEquipment.maintenance_schedule}
              onChange={(e) => setNewEquipment({ ...newEquipment, maintenance_schedule: e.target.value })}
            />
            <TextField
              label="Last Maintenance Date"
              variant="outlined"
              type="date"
              fullWidth
              value={newEquipment.last_maintenance_date}
              onChange={(e) => setNewEquipment({ ...newEquipment, last_maintenance_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Next Maintenance Date"
              variant="outlined"
              type="date"
              fullWidth
              value={newEquipment.next_maintenance_date}
              onChange={(e) => setNewEquipment({ ...newEquipment, next_maintenance_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            {/* Current Value is calculated and not editable */}
            <TextField
              label="Current Value"
              variant="outlined"
              fullWidth
              value={
                calculateCurrentValue(
                  newEquipment.cost,
                  newEquipment.depreciation_rate,
                  newEquipment.purchase_date
                ) || ''
              }
              disabled
            />
          </div>
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

      {/* Snackbar for Notifications */}
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
