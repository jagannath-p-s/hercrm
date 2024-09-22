import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash } from "lucide-react";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select"; // Add SelectValue
import { supabase } from '../supabaseClient';

function ExistingMemberships({
  memberships,
  users,
  membershipPlans,
  paymentModes,
  fetchMemberships,
  showSnackbar,
}) {
  const [openMembershipDialog, setOpenMembershipDialog] = useState(false);
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

  const handleOpenMembershipDialog = (membership = null) => {
    if (membership) {
      // Populate form with the selected membership details
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
      // Reset form for a new membership
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
      fetchMemberships(); // Refetch the memberships
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
      fetchMemberships(); // Refetch the memberships
    } catch (error) {
      showSnackbar('Error deleting membership: ' + error.message, 'error');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Existing Memberships</CardTitle>
        <Button className="ml-auto" onClick={() => handleOpenMembershipDialog()}>Add Membership</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Admission Fee</TableHead>
              <TableHead>Additional Fee</TableHead>
              <TableHead>GST (%)</TableHead>
              <TableHead>Credit Used</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
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
                <TableCell className="text-right">
                    <div className="flex">
                  <Button variant="outline" onClick={() => handleOpenMembershipDialog(membership)}>
                    <Pencil className="h-4 w-4 " /> 
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteMembership(membership.id)} className="ml-2">
                    <Trash className="h-4 w-4 " /> 
                  </Button></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Membership Dialog */}
      <Dialog open={openMembershipDialog} onOpenChange={setOpenMembershipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{membershipFormData.id ? 'Edit Membership' : 'Add Membership'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* User Selection */}
            <div>
              <label htmlFor="user_id" className="block mb-1 text-sm font-medium">User</label>
              <Select
                id="user_id"
                value={membershipFormData.user_id}
                onChange={(value) => handleMembershipFormChange({ target: { name: 'user_id', value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select User" /> {/* Display selected user */}
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Membership Plan Selection */}
            <div>
              <label htmlFor="membership_plan_id" className="block mb-1 text-sm font-medium">Membership Plan</label>
              <Select
                id="membership_plan_id"
                value={membershipFormData.membership_plan_id}
                onChange={(value) => handleMembershipFormChange({ target: { name: 'membership_plan_id', value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan" /> {/* Display selected plan */}
                </SelectTrigger>
                <SelectContent>
                  {membershipPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Mode Selection */}
            <div>
              <label htmlFor="payment_mode_id" className="block mb-1 text-sm font-medium">Payment Mode</label>
              <Select
                id="payment_mode_id"
                value={membershipFormData.payment_mode_id}
                onChange={(value) => handleMembershipFormChange({ target: { name: 'payment_mode_id', value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Mode" /> {/* Display selected payment mode */}
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>{mode.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="start_date" className="block mb-1 text-sm font-medium">Start Date</label>
              <Input
                id="start_date"
                type="date"
                value={membershipFormData.start_date}
                onChange={handleMembershipFormChange}
                name="start_date"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="end_date" className="block mb-1 text-sm font-medium">End Date</label>
              <Input
                id="end_date"
                type="date"
                value={membershipFormData.end_date}
                onChange={handleMembershipFormChange}
                name="end_date"
                required
              />
            </div>

            {/* Admission Fee */}
            <div>
              <label htmlFor="admission_or_renewal_fee" className="block mb-1 text-sm font-medium">Admission Fee</label>
              <Input
                id="admission_or_renewal_fee"
                type="number"
                value={membershipFormData.admission_or_renewal_fee}
                name="admission_or_renewal_fee"
                onChange={handleMembershipFormChange}
                required
                disabled
              />
            </div>

            {/* Additional Fee */}
            <div>
              <label htmlFor="additional_fee" className="block mb-1 text-sm font-medium">Additional Fee</label>
              <Input
                id="additional_fee"
                type="number"
                value={membershipFormData.additional_fee}
                name="additional_fee"
                onChange={handleMembershipFormChange}
              />
            </div>

            {/* GST Percentage */}
            <div>
              <label htmlFor="gst_percentage" className="block mb-1 text-sm font-medium">GST Percentage</label>
              <Input
                id="gst_percentage"
                type="number"
                value={membershipFormData.gst_percentage}
                name="gst_percentage"
                onChange={handleMembershipFormChange}
                required
              />
            </div>

            {/* Credit Used */}
            <div>
              <label htmlFor="credit_used" className="block mb-1 text-sm font-medium">Credit Used</label>
              <Input
                id="credit_used"
                type="number"
                value={membershipFormData.credit_used}
                name="credit_used"
                onChange={handleMembershipFormChange}
              />
            </div>

            {/* Total Amount */}
            <div>
              <label htmlFor="total_amount" className="block mb-1 text-sm font-medium">Total Amount</label>
              <Input
                id="total_amount"
                type="number"
                value={membershipFormData.total_amount}
                name="total_amount"
                required
                disabled
              />
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleCloseMembershipDialog}>Cancel</Button>
            <Button className="ml-4" onClick={handleMembershipFormSubmit}>
              {membershipFormData.id ? 'Save Changes' : 'Add Membership'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ExistingMemberships;
