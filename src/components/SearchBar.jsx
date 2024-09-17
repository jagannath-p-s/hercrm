import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { Menu, MenuItem, Box, Snackbar, Alert } from '@mui/material';
import AddEnquiryDialog from '../dialogs/searchdialogs/AddEnquiryDialog';
import AddServiceEnquiryDialog from '../dialogs/searchdialogs/AddServiceEnquiryDialog';

const SearchBar = ({ onSearch, currentUserId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
      <div className="flex items-center w-full max-w-md bg-white rounded-full border border-gray-300 shadow-sm">
        <div className="pl-4 pr-2 py-2">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="flex-grow py-2 px-2 bg-transparent outline-none text-sm"
          placeholder="Search"
          value={searchTerm}
          onChange={handleInputChange}
        />
        {searchTerm && (
          <div className="pr-2 py-1.5">
            <button
              type="button"
              className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2"
              onClick={handleAddClick}
            >
              <AddIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleDialogOpen('service')}>Add Service Enquiry</MenuItem>
        <MenuItem onClick={() => handleDialogOpen('product')}>Add Product Enquiry</MenuItem>
      </Menu>

      {dialogType === 'service' ? (
        <AddServiceEnquiryDialog
          dialogOpen={dialogOpen}
          handleDialogClose={handleDialogClose}
          currentUserId={currentUserId}
          showSnackbar={showSnackbar}
        />
      ) : (
        <AddEnquiryDialog
          dialogOpen={dialogOpen}
          dialogType={dialogType}
          handleDialogClose={handleDialogClose}
          currentUserId={currentUserId}
        />
      )}

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
    </Box>
  );
};

export default SearchBar;
