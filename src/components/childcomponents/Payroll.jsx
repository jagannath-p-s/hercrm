// Payroll.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { supabase } from "../../supabaseClient";
import { format } from "date-fns";

const Payroll = () => {
  const [payrollData, setPayrollData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      // Fetch staff salaries and related staff info
      const { data, error } = await supabase
        .from("staff_salaries")
        .select(`
          *,
          staffs (username)
        `);
      if (error) throw error;
      setPayrollData(data);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
    }
  };

  return (
    <div className="m-4">
      <Button variant="outline" onClick={() => navigate('/home/staff')}>
        Back to Staff
      </Button>
      <h1 className="text-2xl font-bold mt-4">Payroll Management</h1>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Payroll Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Scheduled Payment Date</TableHead>
                <TableHead>Actual Payment Date</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Bonuses</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Advance Amount</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.staffs.username}</TableCell>
                  <TableCell>{format(new Date(record.scheduled_payment_date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{record.actual_payment_date ? format(new Date(record.actual_payment_date), 'yyyy-MM-dd') : '-'}</TableCell>
                  <TableCell>{record.base_salary}</TableCell>
                  <TableCell>{record.bonuses}</TableCell>
                  <TableCell>{record.deductions}</TableCell>
                  <TableCell>{record.advance_amount}</TableCell>
                  <TableCell>{record.net_salary}</TableCell>
                  <TableCell>{record.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;
