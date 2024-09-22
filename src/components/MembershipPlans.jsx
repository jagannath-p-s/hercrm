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
import { supabase } from '../supabaseClient';  // Make sure to import your Supabase client

function MembershipPlans({ membershipPlans, fetchMembershipPlans, showSnackbar }) {
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    id: null,
    name: '',
    duration_in_months: '',
    base_price: '',
  });

  // Open dialog for creating or editing a plan
  const handleOpenPlanDialog = (plan = null) => {
    setPlanFormData(
      plan || { id: null, name: '', duration_in_months: '', base_price: '' }
    );
    setOpenPlanDialog(true);
  };

  const handleClosePlanDialog = () => {
    setOpenPlanDialog(false);
  };

  // Handle form change
  const handlePlanFormChange = (e) => {
    const { name, value } = e.target;
    setPlanFormData({ ...planFormData, [name]: value });
  };

  // Handle form submit (add or update)
  const handlePlanFormSubmit = async () => {
    try {
      if (planFormData.id) {
        // Edit an existing plan
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
        // Add a new plan
        const { error } = await supabase.from('membership_plans').insert({
          name: planFormData.name,
          duration_in_months: planFormData.duration_in_months,
          base_price: planFormData.base_price,
        });
        if (error) throw error;
        showSnackbar('Plan created successfully', 'success');
      }
      fetchMembershipPlans();  // Refresh the list
      handleClosePlanDialog();  // Close the dialog
    } catch (error) {
      showSnackbar('Error saving plan: ' + error.message, 'error');
    }
  };

  // Handle delete
  const handleDeletePlan = async (id) => {
    try {
      const { error } = await supabase
        .from('membership_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showSnackbar('Plan deleted successfully', 'success');
      fetchMembershipPlans();  // Refresh the list
    } catch (error) {
      showSnackbar('Error deleting plan: ' + error.message, 'error');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Membership Plans</CardTitle>
        <Button className="ml-auto" onClick={() => handleOpenPlanDialog()}>Create New Plan</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Duration (Months)</TableHead>
              <TableHead className="text-center">Base Price (Rs)</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membershipPlans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell className="text-center" >{plan.duration_in_months}</TableCell>
                <TableCell className="text-center">Rs {plan.base_price}</TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" onClick={() => handleOpenPlanDialog(plan)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeletePlan(plan.id)} className="ml-2">
                    <Trash className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Plan Dialog */}
      <Dialog open={openPlanDialog} onOpenChange={setOpenPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{planFormData.id ? 'Edit Membership Plan' : 'Create Membership Plan'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <Input
              label="Plan Name"
              placeholder="Enter plan name"
              value={planFormData.name}
              onChange={handlePlanFormChange}
              name="name"
              required
            />
            <Input
              label="Duration (Months)"
              placeholder="Enter duration in months"
              type="number"
              value={planFormData.duration_in_months}
              onChange={handlePlanFormChange}
              name="duration_in_months"
              required
            />
            <Input
              label="Base Price (Rs)"
              placeholder="Enter base price"
              type="number"
              value={planFormData.base_price}
              onChange={handlePlanFormChange}
              name="base_price"
              required
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleClosePlanDialog}>Cancel</Button>
            <Button className="ml-4" onClick={handlePlanFormSubmit}>
              {planFormData.id ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default MembershipPlans;
