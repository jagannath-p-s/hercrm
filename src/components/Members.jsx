// Members.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Import Supabase
import MembershipPlans from './MembershipPlans';
import ExistingMemberships from './ExistingMemberships';
import { Container, Typography, Snackbar, Alert } from '@mui/material';

function Members() {
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch data from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchMembershipPlans(),
      fetchMemberships(),
      fetchUsers(),
      fetchPaymentModes(),
    ]);
  };

  const fetchMembershipPlans = async () => {
    const { data, error } = await supabase.from('membership_plans').select('*');
    if (error) console.error('Error fetching membership plans:', error);
    else setMembershipPlans(data);
  };

  const fetchMemberships = async () => {
    const { data, error } = await supabase
      .from('memberships')
      .select(
        `
        id,
        user_id,
        membership_plan_id,
        payment_mode_id,
        start_date,
        end_date,
        admission_or_renewal_fee,
        additional_fee,
        gst_percentage,
        credit_used,
        total_amount,
        users (id, name),
        membership_plans (id, name),
        payment_modes (id, name)
      `
      );
    if (error) console.error('Error fetching memberships:', error);
    else setMemberships(data);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error('Error fetching users:', error);
    else setUsers(data);
  };

  const fetchPaymentModes = async () => {
    const { data, error } = await supabase.from('payment_modes').select('*');
    if (error) console.error('Error fetching payment modes:', error);
    else setPaymentModes(data);
  };

  // Snackbar handlers
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>


      <MembershipPlans
        membershipPlans={membershipPlans}
        fetchMembershipPlans={fetchMembershipPlans}
        showSnackbar={showSnackbar}
      />

      <ExistingMemberships
        memberships={memberships}
        users={users}
        membershipPlans={membershipPlans}
        paymentModes={paymentModes}
        fetchMemberships={fetchMemberships}
        fetchUsers={fetchUsers}
        showSnackbar={showSnackbar}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled" // Optional: Adds a filled variant for better visibility
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Members;
