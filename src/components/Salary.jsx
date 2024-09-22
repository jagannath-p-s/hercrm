import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '../supabaseClient';
import { Snackbar, SnackbarContent } from '@mui/material';
import {
  format,
  isBefore,
  parseISO,
  addDays,
  subDays,
} from 'date-fns';
import AddIcon from '@mui/icons-material/Add';

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [selectedStaffSalary, setSelectedStaffSalary] = useState(null);
  const [isSalaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [newSalary, setNewSalary] = useState({
    staff_id: '',
    scheduled_payment_date: '',
    advance_amount: '',
    advance_date: '',
    deductions: '',
    bonuses: '',
    remarks: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    // Set default filter dates to past 30 days to next 30 days
    const today = new Date();
    const priorDate = subDays(today, 30);
    const futureDate = addDays(today, 30);
    setFilterStartDate(format(priorDate, 'yyyy-MM-dd'));
    setFilterEndDate(format(futureDate, 'yyyy-MM-dd'));
    fetchStaffs();
  }, []);

  useEffect(() => {
    fetchSalaries();
  }, [filterStartDate, filterEndDate]);

  const fetchSalaries = async () => {
    try {
      let query = supabase
        .from('staff_salaries')
        .select('*')
        .order('scheduled_payment_date', { ascending: true });

      if (filterStartDate && filterEndDate) {
        query = query
          .gte('scheduled_payment_date', filterStartDate)
          .lte('scheduled_payment_date', filterEndDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSalaries(data);
    } catch (error) {
      console.error('Error fetching salaries:', error);
    }
  };

  const fetchStaffs = async () => {
    try {
      const { data, error } = await supabase
        .from('staffs')
        .select('id, username, salary');

      if (error) throw error;

      setStaffs(data);
    } catch (error) {
      console.error('Error fetching staffs:', error);
    }
  };

  const handleAddSalary = async () => {
    try {
      await supabase.from('staff_salaries').insert([
        {
          staff_id: parseInt(newSalary.staff_id),
          scheduled_payment_date: newSalary.scheduled_payment_date,
          base_salary: selectedStaffSalary,
          advance_amount: parseFloat(newSalary.advance_amount || 0),
          advance_date: newSalary.advance_date || null,
          deductions: parseFloat(newSalary.deductions || 0),
          bonuses: parseFloat(newSalary.bonuses || 0),
          remarks: newSalary.remarks || null,
          status: 'Pending',
        },
      ]);
      setSalaryDialogOpen(false);
      resetNewSalary();
      fetchSalaries();
      showSnackbar('Salary scheduled successfully!');
    } catch (error) {
      console.error('Error adding salary:', error);
      showSnackbar('Error scheduling salary.');
    }
  };

  const resetNewSalary = () => {
    setNewSalary({
      staff_id: '',
      scheduled_payment_date: '',
      advance_amount: '',
      advance_date: '',
      deductions: '',
      bonuses: '',
      remarks: '',
    });
    setSelectedStaffSalary(null);
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const markAsPaid = async (salary) => {
    try {
      // Update salary status and actual payment date
      await supabase
        .from('staff_salaries')
        .update({
          status: 'Paid',
          actual_payment_date: new Date().toISOString(),
        })
        .eq('id', salary.id);

      // Insert into expenses table
      await supabase.from('expenses').insert([
        {
          amount: salary.net_salary,
          description: `Salary payment for staff ID ${salary.staff_id}`,
          expense_date: new Date().toISOString(),
          category_id: null,
          staff_id: salary.staff_id,
          status: 'paid',
          expense_type: 'Salary',
        },
      ]);

      fetchSalaries();
      showSnackbar('Salary marked as paid and recorded in expenses.');
    } catch (error) {
      console.error('Error marking salary as paid:', error);
      showSnackbar('Error marking salary as paid.');
    }
  };

  const handleStaffChange = (staffId) => {
    setNewSalary({ ...newSalary, staff_id: staffId });

    // Get the selected staff's salary
    const staff = staffs.find((s) => s.id === parseInt(staffId));
    setSelectedStaffSalary(staff ? staff.salary : null);
  };

  const getStatusBadge = (salary) => {
    const today = new Date();
    const scheduledDate = parseISO(salary.scheduled_payment_date);

    if (salary.status === 'Paid') {
      return <Badge variant="default">Paid</Badge>;
    } else if (isBefore(scheduledDate, today)) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="p-4">
      <Card className="border">
        <CardHeader>
          <CardTitle>Salary Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center mb-4">
            <div className="mr-4">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div className="mr-4">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <Button
              variant="default"
              onClick={fetchSalaries}
              className="mt-4"
            >
              Filter
            </Button>
          </div>

          <Button
            variant="default"
            className="mb-4"
            onClick={() => setSalaryDialogOpen(true)}
          >
            <AddIcon className="mr-2 h-4 w-4" />
            Schedule Salary Payment
          </Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell>
                    {staffs.find((s) => s.id === salary.staff_id)?.username ||
                      'N/A'}
                  </TableCell>
                  <TableCell>
                    {format(
                      parseISO(salary.scheduled_payment_date),
                      'yyyy-MM-dd'
                    )}
                  </TableCell>
                  <TableCell>₹{salary.base_salary.toFixed(2)}</TableCell>
                  <TableCell>
                    ₹{salary.net_salary ? salary.net_salary.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell>{getStatusBadge(salary)}</TableCell>
                  <TableCell>
                    {salary.status !== 'Paid' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsPaid(salary)}
                      >
                        Mark as Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Salary Dialog */}
      <Dialog open={isSalaryDialogOpen} onOpenChange={setSalaryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule Salary Payment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">Select Staff</label>
              <Select
                value={newSalary.staff_id}
                onValueChange={(value) => handleStaffChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffs.map((staff) => (
                    <SelectItem
                      key={staff.id}
                      value={staff.id.toString()}
                    >
                      {staff.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStaffSalary && (
              <div>
                <label className="text-sm font-medium">Base Salary</label>
                <Input
                  placeholder="Base Salary"
                  type="number"
                  value={selectedStaffSalary}
                  readOnly
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">
                Scheduled Payment Date
              </label>
              <Input
                type="date"
                value={newSalary.scheduled_payment_date}
                onChange={(e) =>
                  setNewSalary({
                    ...newSalary,
                    scheduled_payment_date: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Advance Date</label>
              <Input
                type="date"
                value={newSalary.advance_date}
                onChange={(e) =>
                  setNewSalary({ ...newSalary, advance_date: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Advance Amount</label>
              <Input
                placeholder="Advance Amount"
                type="number"
                value={newSalary.advance_amount}
                onChange={(e) =>
                  setNewSalary({
                    ...newSalary,
                    advance_amount: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Deductions</label>
              <Input
                placeholder="Deductions"
                type="number"
                value={newSalary.deductions}
                onChange={(e) =>
                  setNewSalary({ ...newSalary, deductions: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bonuses</label>
              <Input
                placeholder="Bonuses"
                type="number"
                value={newSalary.bonuses}
                onChange={(e) =>
                  setNewSalary({ ...newSalary, bonuses: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Remarks</label>
              <Input
                placeholder="Remarks"
                value={newSalary.remarks}
                onChange={(e) =>
                  setNewSalary({ ...newSalary, remarks: e.target.value })
                }
              />
            </div>
          </div>
          <Button onClick={handleAddSalary} className="mt-4">
            Schedule Salary
          </Button>
        </DialogContent>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <SnackbarContent message={snackbarMessage} />
      </Snackbar>
    </div>
  );
};

export default Salary;
