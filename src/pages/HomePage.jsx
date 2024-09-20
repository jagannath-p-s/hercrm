// HomePage.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  CardMembership as CardMembershipIcon,
  AccountBalance as AccountBalanceIcon,
  Work as WorkIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import CoPresentIcon from '@mui/icons-material/CoPresent'; // Icon for Attendance
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; // Icon for Equipment
import { Tooltip, Menu, MenuItem, Snackbar, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { supabase } from '../supabaseClient';

import Dashboard from '../components/Dashboard';
import Contacts from '../components/Contacts';
import Members from '../components/Members';
import Finance from '../components/Finance';
import Attendance from '../components/Attendance';
import Staff from '../components/Staff';
import Equipment from '../components/Equipment';

const HomePage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeComponent, setActiveComponent] = useState('Dashboard'); // Default to Dashboard
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const sidebarRef = useRef(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const storedStaff = JSON.parse(localStorage.getItem('staff'));
    if (storedStaff && storedStaff.expiry > Date.now()) {
      setStaff(storedStaff);
      fetchStaffData(storedStaff.id); // Fetch staff data from 'public.staffs' table
    } else {
      localStorage.removeItem('staff');
      navigate('/login'); // Use navigate instead of window.location.href
    }
  }, [navigate]);

  const fetchStaffData = async (staffId) => {
    try {
      const { data, error } = await supabase.from('staffs').select('*').eq('id', staffId).single();
      if (error) throw error;
      setStaff((prevStaff) => ({ ...prevStaff, ...data }));

      // Update the expiry time when refreshing staff data
      const expirationDate = Date.now() + 15 * 24 * 60 * 60 * 1000; // 15 days from now
      localStorage.setItem('staff', JSON.stringify({ ...data, expiry: expirationDate }));
    } catch (error) {
      showSnackbar(`Error fetching staff data: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClickOutside = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsExpanded(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const navItems = [
    { icon: <DashboardIcon />, tooltip: 'Dashboard', component: 'Dashboard' },
    { icon: <GroupIcon />, tooltip: 'Contacts', component: 'Contacts' },
    { icon: <CardMembershipIcon />, tooltip: 'Members', component: 'Members' },
    { icon: <AccountBalanceIcon />, tooltip: 'Finance', component: 'Finance' },
    { icon: <CoPresentIcon />, tooltip: 'Attendance', component: 'Attendance' },
    { icon: <WorkIcon />, tooltip: 'Staff', component: 'Staff' },
    { icon: <FitnessCenterIcon />, tooltip: 'Equipment', component: 'Equipment' },
  ];

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Contacts':
        return <Contacts />;
      case 'Members':
        return <Members />;
      case 'Finance':
        return <Finance />;
      case 'Attendance':
        return <Attendance />;
      case 'Staff':
        return <Staff />;
      case 'Equipment':
        return <Equipment />;
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

  const getComponentTitle = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return 'Dashboard';
      case 'Contacts':
        return 'Contacts';
      case 'Members':
        return 'Members';
      case 'Finance':
        return 'Finance';
      case 'Attendance':
        return 'Attendance';
      case 'Staff':
        return 'Staff';
      case 'Equipment':
        return 'Equipment';
      default:
        return 'Dashboard';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!staff) {
    return null; // or navigate to login
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`sticky top-0 h-screen bg-white shadow-lg flex flex-col py-4 px-3 border-r border-gray-200 transition-all duration-1000 ${
          isExpanded ? 'w-48' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-center mt-6 mb-6 w-full">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/43/Logo-WS.png"
            alt="Logo"
            className="w-10 h-10"
          />
        </div>
        <nav className="flex flex-col w-full space-y-2">
          {navItems.map((item, index) => (
            <Tooltip key={index} title={!isExpanded ? item.tooltip : ''} placement="right">
              <div className="w-full">
                <button
                  onClick={() => setActiveComponent(item.component)}
                  className={`p-2 rounded-lg hover:bg-blue-100 transition duration-200 w-full flex items-center ${
                    activeComponent === item.component ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex justify-start items-center">
                    {React.cloneElement(item.icon, {
                      className: 'text-gray-600',
                      style: { fontSize: '1.75rem' },
                    })}
                    {isExpanded && (
                      <motion.span
                        className="ml-3 text-xs font-semibold text-gray-700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isExpanded ? 1 : 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        {item.tooltip}
                      </motion.span>
                    )}
                  </div>
                </button>
              </div>
            </Tooltip>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-x-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-300 w-full">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <h1 className="text-lg font-semibold">{getComponentTitle()}</h1>
              <div className="flex items-center space-x-4 ml-auto">
                <button
                  className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-lg font-bold uppercase"
                  onClick={handleMenuOpen}
                >
                  {staff?.username ? staff.username[0].toUpperCase() : 'S'}
                </button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem onClick={handleMenuClose} className="flex items-center">
                    <SettingsIcon className="mr-2" style={{ fontSize: '20px' }} />
                    <span className="text-sm">Settings</span>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      localStorage.removeItem('staff');
                      navigate('/login'); // Use navigate instead of window.location.href
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
          <div className="max-w-full">{renderComponent()}</div>
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
