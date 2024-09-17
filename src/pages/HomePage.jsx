import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  CardMembership as CardMembershipIcon,
  AccountBalance as AccountBalanceIcon,
  Work as WorkIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import CoPresentIcon from '@mui/icons-material/CoPresent'; // New icon for Attendance
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; // New icon for Equipment
import { Tooltip, Menu, MenuItem, Snackbar, Alert, Badge, CircularProgress } from '@mui/material';
import SearchBar from '../components/SearchBar';
import Dashboard from '../components/Dashboard';
import Members from '../components/Members';
import Memberships from '../components/Memberships';
import Finance from '../components/Finance';
import Attendance from '../components/Attendance';
import Staff from '../components/Staff';
import Equipment from '../components/Equipment';
import { supabase } from '../supabaseClient';

const HomePage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeComponent, setActiveComponent] = useState('Dashboard'); // Default to Dashboard
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const sidebarRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.expiry > Date.now()) {
      setUser(storedUser);
      fetchUserPermissions(storedUser.id);
    } else {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    setLoading(false);
  }, []);

  const fetchUserPermissions = async (userId) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      if (error) throw error;
      setUser((prevUser) => ({ ...prevUser, ...data }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
    } catch (error) {
      showSnackbar(`Error fetching user permissions: ${error.message}`, 'error');
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddMenuOpen = (event) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchorEl(null);
  };

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleClickOutside = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsExpanded(false);
    }
  }, []);

  const handleSearchClick = useCallback((term) => {
    setActiveComponent('SearchComponent');
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const navItems = [
    { icon: <DashboardIcon />, tooltip: "Dashboard", component: 'Dashboard' },
    { icon: <GroupIcon />, tooltip: "Members", component: 'Members' },
    { icon: <CardMembershipIcon />, tooltip: "Memberships", component: 'Memberships' },
    { icon: <AccountBalanceIcon />, tooltip: "Finance", component: 'Finance' },
    { icon: <CoPresentIcon />, tooltip: "Attendance", component: 'Attendance' }, // New icon for Attendance
    { icon: <WorkIcon />, tooltip: "Staff", component: 'Staff' },
    { icon: <FitnessCenterIcon />, tooltip: "Equipment", component: 'Equipment' }, // New icon for Equipment
  ];

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Members':
        return <Members />;
      case 'Memberships':
        return <Memberships />;
      case 'Finance':
        return <Finance />;
      case 'Attendance':
        return <Attendance />;
      case 'Staff':
        return <Staff />;
      case 'Equipment':
        return <Equipment />;
      case 'SearchComponent':
        return <div>Search Results for "{searchTerm}"</div>;
      default:
        return <Dashboard />;
    }
  };

  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!user) {
    return null; // or redirect to login
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sticky top-0 h-screen bg-white shadow-lg flex flex-col items-start py-4 px-3 border-r border-gray-200 transition-all duration-300 ${
          isExpanded ? 'w-48' : 'w-20 items-center'
        }`}
      >
        <div className="flex items-center justify-center mt-6 mb-6 w-full">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/43/Logo-WS.png" alt="Logo" className="w-10 h-10" />
        </div>
        <nav className={`flex flex-col w-full ${isExpanded ? 'space-y-1' : 'space-y-1 items-center'}`}>
          {navItems.map((item, index) => (
            <Tooltip key={index} title={!isExpanded ? item.tooltip : ''} placement="right">
              <button
                onClick={() => setActiveComponent(item.component)}
                className={`p-2 uppercase rounded-lg hover:bg-blue-100 transition duration-200 flex items-center ${
                  isExpanded ? 'pl-2 pr-3' : 'justify-center'
                } ${activeComponent === item.component ? 'bg-blue-100' : ''}`}
              >
                {React.cloneElement(item.icon, { className: "text-gray-600", style: { fontSize: '1.75rem' } })}
                {isExpanded && <span className="ml-3 text-xs font-semibold text-gray-700">{item.tooltip}</span>}
              </button>
            </Tooltip>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-x-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-300 w-full">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3" style={{ width: '100%' }}>
              <div className="flex items-center space-x-4">
                <Tooltip title="Toggle Sidenav">
                  <button onClick={handleToggle} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                    <MenuIcon />
                  </button>
                </Tooltip>
                <SearchBar onSearch={handleSearchClick} currentUserId={user.id} />
              </div>
              <div className="flex items-center space-x-4">
                <button className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-lg font-bold uppercase" onClick={handleMenuOpen}>
                  {user.username[0].toUpperCase()}
                </button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleMenuClose} className="flex items-center">
                    <SettingsIcon className="mr-2" style={{ fontSize: '20px' }} />
                    <span className="text-sm">Settings</span>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="flex items-center"
                  >
                    <ExitToAppIcon className="mr-2" style={{ fontSize: '20px' }} />
                    <span className="text-sm">Logout</span>
                  </MenuItem>
                </Menu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="max-w-full">
            {renderComponent()}
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

export default HomePage;
