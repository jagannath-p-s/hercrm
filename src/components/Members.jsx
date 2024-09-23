import React, { useState, useEffect, useRef } from 'react'; // Add useRef here

import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Box,
  Snackbar,
  Alert,
  MenuItem,
} from '@mui/material';
import { Edit, Delete ,Print} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { supabase } from '../supabaseClient'; // Import Supabase
import ReceiptComponent from './ReceiptComponent'; // Import ReceiptComponent
import ReactToPrint from 'react-to-print'; 


const theme = createTheme();

function Members() {
  const printRef = useRef(); // Ref for print component
  // State variables
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [openMembershipDialog, setOpenMembershipDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [planFormData, setPlanFormData] = useState({
    id: null,
    name: '',
    duration_in_months: '',
    base_price: '',
  });
  const [membershipFormData, setMembershipFormData] = useState({
    id: null,
    user_id: '',
    membership_plan_id: '',
    payment_mode_id: '',
    start_date: '',
    end_date: '',
    admission_or_renewal_fee: 0,
    additional_fee: 0,
    gst_percentage: 18, // Default GST percentage
    credit_used: 0,
    total_amount: 0,
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

  // Plan dialog functions
  const handleOpenPlanDialog = (plan = null) => {
    setPlanFormData(
      plan || { id: null, name: '', duration_in_months: '', base_price: '' }
    );
    setOpenPlanDialog(true);
  };

  const handleClosePlanDialog = () => {
    setOpenPlanDialog(false);
  };

  const handlePlanFormChange = (e) => {
    const { name, value } = e.target;
    setPlanFormData({ ...planFormData, [name]: value });
  };

  const handlePlanFormSubmit = async () => {
    try {
      if (planFormData.id) {
        const { error } = await supabase
          .from('membership_plans')
          .update({
            name: planFormData.name,
            duration_in_months: planFormData.duration_in_months,
            base_price: planFormData.base_price,
          })
          .eq('id', planFormData.id);
        if (error) throw error;
        showSnackbar('Plan updated successfully', 'success');
      } else {
        const { error } = await supabase.from('membership_plans').insert({
          name: planFormData.name,
          duration_in_months: planFormData.duration_in_months,
          base_price: planFormData.base_price,
        });
        if (error) throw error;
        showSnackbar('Plan created successfully', 'success');
      }
      fetchMembershipPlans();
      handleClosePlanDialog();
    } catch (error) {
      showSnackbar('Error saving plan: ' + error.message, 'error');
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      const { error } = await supabase
        .from('membership_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showSnackbar('Plan deleted successfully', 'success');
      fetchMembershipPlans();
    } catch (error) {
      showSnackbar('Error deleting plan: ' + error.message, 'error');
    }
  };

  // Membership dialog functions
  const handleOpenMembershipDialog = (membership = null) => {
    if (membership) {
      setMembershipFormData({
        id: membership.id,
        user_id: membership.user_id,
        membership_plan_id: membership.membership_plan_id,
        payment_mode_id: membership.payment_mode_id,
        start_date: membership.start_date,
        end_date: membership.end_date,
        admission_or_renewal_fee: membership.admission_or_renewal_fee,
        additional_fee: membership.additional_fee,
        gst_percentage: membership.gst_percentage,
        credit_used: membership.credit_used,
        total_amount: membership.total_amount,
      });
    } else {
      setMembershipFormData({
        id: null,
        user_id: '',
        membership_plan_id: '',
        payment_mode_id: '',
        start_date: '',
        end_date: '',
        admission_or_renewal_fee: 0,
        additional_fee: 0,
        gst_percentage: 18,
        credit_used: 0,
        total_amount: 0,
      });
    }
    setOpenMembershipDialog(true);
  };

  const handleCloseMembershipDialog = () => {
    setOpenMembershipDialog(false);
  };

  // Update total amount dynamically when fields are changed
  useEffect(() => {
    const basePrice =
      membershipPlans.find(
        (plan) => plan.id === parseInt(membershipFormData.membership_plan_id)
      )?.base_price || 0;

    // Set admission_or_renewal_fee based on basePrice when plan is selected
    if (membershipFormData.membership_plan_id && !membershipFormData.id) {
      setMembershipFormData((prev) => ({
        ...prev,
        admission_or_renewal_fee: basePrice,
      }));
    }

    const {
      admission_or_renewal_fee,
      additional_fee,
      gst_percentage,
      credit_used,
    } = membershipFormData;

    const preGSTAmount =
      parseFloat(admission_or_renewal_fee || 0) +
      parseFloat(additional_fee || 0) -
      parseFloat(credit_used || 0);
    const gstAmount = (preGSTAmount * parseFloat(gst_percentage || 0)) / 100;
    const total = preGSTAmount + gstAmount;

    setMembershipFormData((prev) => ({
      ...prev,
      total_amount: total.toFixed(2),
    }));
  }, [
    membershipFormData.admission_or_renewal_fee,
    membershipFormData.additional_fee,
    membershipFormData.gst_percentage,
    membershipFormData.credit_used,
    membershipFormData.membership_plan_id,
  ]);

  const handleMembershipFormChange = (e) => {
    const { name, value } = e.target;
    setMembershipFormData({ ...membershipFormData, [name]: value });

    // Automatically set start and end dates based on the selected plan
    if (name === 'membership_plan_id' && value) {
      const selectedPlan = membershipPlans.find(
        (plan) => plan.id === parseInt(value)
      );
      if (selectedPlan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + selectedPlan.duration_in_months);
        setMembershipFormData((prev) => ({
          ...prev,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          admission_or_renewal_fee: selectedPlan.base_price,
        }));
      }
    }
  };

  const handleMembershipFormSubmit = async () => {
    try {
      // Validate required fields
      if (
        !membershipFormData.user_id ||
        !membershipFormData.membership_plan_id ||
        !membershipFormData.payment_mode_id
      ) {
        showSnackbar('Please fill all required fields.', 'error');
        return;
      }

      const membershipData = {
        user_id: parseInt(membershipFormData.user_id),
        membership_plan_id: parseInt(membershipFormData.membership_plan_id),
        payment_mode_id: parseInt(membershipFormData.payment_mode_id),
        start_date: membershipFormData.start_date,
        end_date: membershipFormData.end_date,
        admission_or_renewal_fee: parseFloat(
          membershipFormData.admission_or_renewal_fee
        ),
        additional_fee: parseFloat(membershipFormData.additional_fee),
        gst_percentage: parseFloat(membershipFormData.gst_percentage),
        credit_used: parseFloat(membershipFormData.credit_used),
        total_amount: parseFloat(membershipFormData.total_amount),
      };

      if (membershipFormData.id) {
        const { error } = await supabase
          .from('memberships')
          .update(membershipData)
          .eq('id', membershipFormData.id);
        if (error) throw error;
        showSnackbar('Membership updated successfully', 'success');
      } else {
        const { error } = await supabase.from('memberships').insert(membershipData);
        if (error) throw error;
        showSnackbar('Membership created successfully', 'success');
      }
      fetchMemberships();
      handleCloseMembershipDialog();
    } catch (error) {
      showSnackbar('Error saving membership: ' + error.message, 'error');
    }
  };

  const handleDeleteMembership = async (id) => {
    try {
      const { error } = await supabase.from('memberships').delete().eq('id', id);
      if (error) throw error;
      showSnackbar('Membership deleted successfully', 'success');
      fetchMemberships();
    } catch (error) {
      showSnackbar('Error deleting membership: ' + error.message, 'error');
    }
  };

  // Snackbar handlers
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Membership Management
        </Typography>

        {/* Membership Plans Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5">Membership Plans</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenPlanDialog()}
            >
              Create New Plan
            </Button>
          </Box>
          {/* Scrollable container for the table */}
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Duration (Months)</TableCell>
                  <TableCell>Base Price (Rs)</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {membershipPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>{plan.duration_in_months}</TableCell>
                    <TableCell>Rs {plan.base_price}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenPlanDialog(plan)}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeletePlan(plan.id)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        {/* Memberships Section */}
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5">Existing Memberships</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenMembershipDialog()}
            >
              Add Membership
            </Button>
          </Box>
          {/* Scrollable container for the table */}
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>User Name</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Payment Mode</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Admission Fee (Rs)</TableCell>
                  <TableCell>Additional Fee (Rs)</TableCell>
                  <TableCell>GST (%)</TableCell>
                  <TableCell>Credit Used (Rs)</TableCell>
                  <TableCell>Total Amount (Rs)</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
  {memberships.map((membership) => (
    <TableRow key={membership.id}>
      <TableCell>{membership.users?.name || 'Unknown User'}</TableCell>
      <TableCell>{membership.membership_plans?.name || 'Unknown Plan'}</TableCell>
      <TableCell>{membership.payment_modes?.name || 'Unknown Mode'}</TableCell>
      <TableCell>{membership.start_date}</TableCell>
      <TableCell>{membership.end_date}</TableCell>
      <TableCell>{membership.admission_or_renewal_fee}</TableCell>
      <TableCell>{membership.additional_fee}</TableCell>
      <TableCell>{membership.gst_percentage}</TableCell>
      <TableCell>{membership.credit_used}</TableCell>
      <TableCell>{membership.total_amount}</TableCell>
      <TableCell align="right">
        <IconButton
          onClick={() => handleOpenMembershipDialog(membership)}
          color="primary"
          size="small"
        >
          <Edit />
        </IconButton>
        <IconButton
          onClick={() => handleDeleteMembership(membership.id)}
          color="error"
          size="small"
        >
          <Delete />
        </IconButton>

        {/* Add ReactToPrint button */}
        <ReactToPrint
          trigger={() => (
            <IconButton color="primary" size="small">
              <Print />
            </IconButton>
          )}
          content={() => printRef.current}
        />
        
        {/* Hidden ReceiptComponent */}
        <Box sx={{ display: 'none' }}>
          <ReceiptComponent ref={printRef} membership={membership} />
        </Box>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

            </Table>
          </Box>
        </Paper>

        {/* Membership Plan Dialog */}
        <Dialog open={openPlanDialog} onClose={handleClosePlanDialog}>
          <DialogTitle>
            {planFormData.id ? 'Edit Membership Plan' : 'Create Membership Plan'}
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Plan Name"
              name="name"
              value={planFormData.name}
              onChange={handlePlanFormChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Duration (Months)"
              name="duration_in_months"
              type="number"
              value={planFormData.duration_in_months}
              onChange={handlePlanFormChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Base Price (Rs)"
              name="base_price"
              type="number"
              value={planFormData.base_price}
              onChange={handlePlanFormChange}
              fullWidth
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePlanDialog}>Cancel</Button>
            <Button
              onClick={handlePlanFormSubmit}
              variant="contained"
              color="primary"
            >
              {planFormData.id ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Membership Dialog */}
        <Dialog
          open={openMembershipDialog}
          onClose={handleCloseMembershipDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {membershipFormData.id ? 'Edit Membership' : 'Add Membership'}
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="User"
              name="user_id"
              select
              value={membershipFormData.user_id}
              onChange={handleMembershipFormChange}
              fullWidth
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              label="Membership Plan"
              name="membership_plan_id"
              select
              value={membershipFormData.membership_plan_id}
              onChange={handleMembershipFormChange}
              fullWidth
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {membershipPlans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              label="Payment Mode"
              name="payment_mode_id"
              select
              value={membershipFormData.payment_mode_id}
              onChange={handleMembershipFormChange}
              fullWidth
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {paymentModes.map((mode) => (
                <MenuItem key={mode.id} value={mode.id}>
                  {mode.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              label="Start Date"
              name="start_date"
              type="date"
              value={membershipFormData.start_date}
              onChange={handleMembershipFormChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              margin="dense"
              label="End Date"
              name="end_date"
              type="date"
              value={membershipFormData.end_date}
              onChange={handleMembershipFormChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              margin="dense"
              label="Admission or Renewal Fee (Rs)"
              name="admission_or_renewal_fee"
              type="number"
              value={membershipFormData.admission_or_renewal_fee}
              onChange={handleMembershipFormChange}
              fullWidth
              InputProps={{ readOnly: true }}
              required
            />
            <TextField
              margin="dense"
              label="Additional Fee (Rs)"
              name="additional_fee"
              type="number"
              value={membershipFormData.additional_fee}
              onChange={handleMembershipFormChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="GST Percentage"
              name="gst_percentage"
              type="number"
              value={membershipFormData.gst_percentage}
              onChange={handleMembershipFormChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Credit Used (Rs)"
              name="credit_used"
              type="number"
              value={membershipFormData.credit_used}
              onChange={handleMembershipFormChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Total Amount (Rs)"
              name="total_amount"
              type="number"
              value={membershipFormData.total_amount}
              fullWidth
              InputProps={{ readOnly: true }}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMembershipDialog}>Cancel</Button>
            <Button
              onClick={handleMembershipFormSubmit}
              variant="contained"
              color="primary"
            >
              {membershipFormData.id ? 'Save Changes' : 'Add Membership'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for success or error messages */}
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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default Members;
