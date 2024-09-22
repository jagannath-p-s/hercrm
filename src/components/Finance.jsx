// Finance.js

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "../supabaseClient";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AddIcon from "@mui/icons-material/Add";
import { Snackbar, SnackbarContent } from "@mui/material";

const Finance = () => {
  const [financeStats, setFinanceStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
  });

  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    status: "unpaid",
    final_date_to_pay: "",
    category_id: "",
    expense_type: "",
    staff_id: null,
  });

  const [newExpenseType, setNewExpenseType] = useState({
    name: "",
    description: "",
  });

  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [isExpenseTypeDialogOpen, setExpenseTypeDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Fetch finance data
  const fetchFinanceData = async () => {
    try {
      const { data: totalIncomeData } = await supabase
        .from("incomes")
        .select("amount");
      const totalIncome =
        totalIncomeData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

      const { data: totalExpensesData } = await supabase
        .from("expenses")
        .select("amount");
      const totalExpenses =
        totalExpensesData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

      const netBalance = totalIncome - totalExpenses;

      setFinanceStats({
        totalIncome,
        totalExpenses,
        netBalance,
      });

      const { data: expensesData } = await supabase.from("expenses").select("*");
      setExpenses(expensesData);

      const { data: expenseTypesData } = await supabase
        .from("expense_type")
        .select("*");
      setExpenseTypes(expenseTypesData);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    }
  };

  // Expense Dialog handlers
  const handleExpenseDialogClose = () => {
    setExpenseDialogOpen(false);
    resetNewExpense();
  };

  const handleExpenseSubmit = async () => {
    try {
      await supabase.from("expenses").insert([
        {
          description: newExpense.description || null,
          amount: parseFloat(newExpense.amount),
          status: newExpense.status,
          final_date_to_pay: newExpense.final_date_to_pay || null,
          category_id: newExpense.category_id
            ? parseInt(newExpense.category_id)
            : null,
          expense_type: newExpense.expense_type || "",
          staff_id: newExpense.staff_id,
        },
      ]);
      handleExpenseDialogClose();
      fetchFinanceData();
      showSnackbar("Expense added successfully!");
    } catch (error) {
      console.error("Error adding expense:", error);
      showSnackbar("Error adding expense.");
    }
  };

  // Expense Type Dialog handlers
  const handleExpenseTypeDialogClose = () => {
    setExpenseTypeDialogOpen(false);
    resetNewExpenseType();
  };

  const handleExpenseTypeSubmit = async () => {
    try {
      await supabase.from("expense_type").insert([
        {
          name: newExpenseType.name,
          description: newExpenseType.description || null,
        },
      ]);
      handleExpenseTypeDialogClose();
      fetchFinanceData();
      showSnackbar("Expense type added successfully!");
    } catch (error) {
      console.error("Error adding expense type:", error);
      showSnackbar("Error adding expense type.");
    }
  };

  // Reset new expense and expense type data
  const resetNewExpense = () => {
    setNewExpense({
      description: "",
      amount: "",
      status: "unpaid",
      final_date_to_pay: "",
      category_id: "",
      expense_type: "",
      staff_id: null,
    });
  };

  const resetNewExpenseType = () => {
    setNewExpenseType({
      name: "",
      description: "",
    });
  };

  // Snackbar handlers
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  return (
    <div className="p-4">
      <Card className="border">
        <CardHeader>
          <CardTitle>Finance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-4">
            {/* Total Income */}
            <div className="border p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium">Total Income</h2>
                <CurrencyRupeeIcon className="text-green-600" />
              </div>
              <p className="text-2xl font-bold">
                ₹{financeStats.totalIncome.toFixed(2)}
              </p>
            </div>

            {/* Total Expenses */}
            <div className="border p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium">Total Expenses</h2>
                <CurrencyRupeeIcon className="text-red-600" />
              </div>
              <p className="text-2xl font-bold">
                ₹{financeStats.totalExpenses.toFixed(2)}
              </p>
            </div>

            {/* Net Balance */}
            <div className="border p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium">Net Balance</h2>
                <CurrencyRupeeIcon className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold">
                ₹{financeStats.netBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Table */}
      <Card className="mt-4 border">
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.description || "-"}</TableCell>
                  <TableCell>₹{expense.amount}</TableCell>
                  <TableCell>
                    {expenseTypes.find(
                      (type) => type.id === expense.category_id
                    )?.name || expense.expense_type || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        expense.status === "paid" ? "default" : "destructive"
                      }
                    >
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Expense and Add Expense Type Buttons */}
      <div className="flex items-center mt-4">
        <Button
          variant="default"
          className="mr-4"
          onClick={() => setExpenseDialogOpen(true)}
        >
          <AddIcon className="mr-2 h-4 w-4" />
          Add Expense
        </Button>

        <Button
          variant="default"
          onClick={() => setExpenseTypeDialogOpen(true)}
        >
          <AddIcon className="mr-2 h-4 w-4" />
          Add Expense Type
        </Button>
      </div>

      {/* Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
            />
            <Input
              placeholder="Amount"
              type="number"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
            />
            <Input
              placeholder="Final Date to Pay"
              type="date"
              value={newExpense.final_date_to_pay}
              onChange={(e) =>
                setNewExpense({
                  ...newExpense,
                  final_date_to_pay: e.target.value,
                })
              }
            />
            <Select
              value={newExpense.category_id}
              onValueChange={(value) =>
                setNewExpense({ ...newExpense, category_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Expense Type" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Expense Type (if not in list)"
              value={newExpense.expense_type}
              onChange={(e) =>
                setNewExpense({
                  ...newExpense,
                  expense_type: e.target.value,
                })
              }
            />
          </div>
          <Button onClick={handleExpenseSubmit} className="mt-4">
            Add Expense
          </Button>
        </DialogContent>
      </Dialog>

      {/* Expense Type Dialog */}
      <Dialog
        open={isExpenseTypeDialogOpen}
        onOpenChange={setExpenseTypeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense Type</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <Input
              placeholder="Name"
              value={newExpenseType.name}
              onChange={(e) =>
                setNewExpenseType({ ...newExpenseType, name: e.target.value })
              }
            />
            <Input
              placeholder="Description"
              value={newExpenseType.description}
              onChange={(e) =>
                setNewExpenseType({
                  ...newExpenseType,
                  description: e.target.value,
                })
              }
            />
          </div>
          <Button onClick={handleExpenseTypeSubmit} className="mt-4">
            Add Expense Type
          </Button>
        </DialogContent>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <SnackbarContent message={snackbarMessage} />
      </Snackbar>
    </div>
  );
};

export default Finance;
