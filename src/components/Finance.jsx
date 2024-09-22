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
import Pagination from "@mui/material/Pagination";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Finance = () => {
  const [financeStats, setFinanceStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalEarnings: 0,
  });

  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [incomes, setIncomes] = useState([]);

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    status: "unpaid",
    final_date_to_pay: "",
    category_id: "",
    expense_type: "",
    staff_id: null,
  });

  const [newIncome, setNewIncome] = useState({
    amount: "",
    description: "",
    income_date: "",
  });

  const [newExpenseType, setNewExpenseType] = useState({
    name: "",
    description: "",
  });

  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [isExpenseTypeDialogOpen, setExpenseTypeDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expensesPerPage] = useState(5);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFinanceData();
  }, [currentPage, dateFilter]);

  // Fetch finance data
  const fetchFinanceData = async () => {
    try {
      // Build date filters for expenses and incomes
      let expenseQuery = supabase
        .from("expenses")
        .select("*", { count: "exact" })
        .order("final_date_to_pay", { ascending: false });

      let incomeQuery = supabase
        .from("incomes")
        .select("*")
        .order("income_date", { ascending: false });

      if (dateFilter.startDate) {
        expenseQuery = expenseQuery.gte(
          "final_date_to_pay",
          dateFilter.startDate
        );
        incomeQuery = incomeQuery.gte("income_date", dateFilter.startDate);
      }
      if (dateFilter.endDate) {
        expenseQuery = expenseQuery.lte(
          "final_date_to_pay",
          dateFilter.endDate
        );
        incomeQuery = incomeQuery.lte("income_date", dateFilter.endDate);
      }

      // Fetch Expenses with Pagination
      const { data: expensesData, count } = await expenseQuery.range(
        (currentPage - 1) * expensesPerPage,
        currentPage * expensesPerPage - 1
      );

      setExpenses(expensesData || []);

      // Set total pages for pagination
      const totalExpensesCount = count || expensesData.length;
      setTotalPages(Math.ceil(totalExpensesCount / expensesPerPage));

      // Fetch Incomes
      const { data: incomesData } = await incomeQuery;
      setIncomes(incomesData || []);

      // Calculate Totals
      const totalIncome =
        incomesData?.reduce(
          (acc, curr) => acc + parseFloat(curr.amount || 0),
          0
        ) || 0;
      const totalExpenses =
        expensesData?.reduce(
          (acc, curr) => acc + parseFloat(curr.amount || 0),
          0
        ) || 0;
      const totalEarnings = totalIncome - totalExpenses;

      setFinanceStats({
        totalIncome,
        totalExpenses,
        totalEarnings,
      });

      // Fetch Expense Types
      const { data: expenseTypesData } = await supabase
        .from("expense_type")
        .select("*");
      setExpenseTypes(expenseTypesData || []);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    }
  };

  // Handle Expense Submit
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
      setExpenseDialogOpen(false);
      resetNewExpense();
      fetchFinanceData();
      showSnackbar("Expense added successfully!");
    } catch (error) {
      console.error("Error adding expense:", error);
      showSnackbar("Error adding expense.");
    }
  };

  // Handle Income Submit
  const handleIncomeSubmit = async () => {
    try {
      await supabase.from("incomes").insert([
        {
          description: newIncome.description || null,
          amount: parseFloat(newIncome.amount),
          income_date: newIncome.income_date || null,
        },
      ]);
      setIncomeDialogOpen(false);
      resetNewIncome();
      fetchFinanceData();
      showSnackbar("Income added successfully!");
    } catch (error) {
      console.error("Error adding income:", error);
      showSnackbar("Error adding income.");
    }
  };

  // Handle Expense Type Submit
  const handleExpenseTypeSubmit = async () => {
    try {
      await supabase.from("expense_type").insert([
        {
          name: newExpenseType.name,
          description: newExpenseType.description || null,
        },
      ]);
      setExpenseTypeDialogOpen(false);
      resetNewExpenseType();
      fetchFinanceData();
      showSnackbar("Expense type added successfully!");
    } catch (error) {
      console.error("Error adding expense type:", error);
      showSnackbar("Error adding expense type.");
    }
  };

  // Reset new expense, income, and expense type data
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

  const resetNewIncome = () => {
    setNewIncome({
      amount: "",
      description: "",
      income_date: "",
    });
  };

  const resetNewExpenseType = () => {
    setNewExpenseType({
      name: "",
      description: "",
    });
  };

  // Pagination Handlers
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Snackbar Handlers
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  // Handle Expense Status Toggle
  const toggleExpenseStatus = async (expenseId, currentStatus) => {
    try {
      const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
      await supabase
        .from("expenses")
        .update({ status: newStatus })
        .eq("id", expenseId);
      fetchFinanceData();
      showSnackbar(`Expense marked as ${newStatus}.`);
    } catch (error) {
      console.error("Error updating expense status:", error);
      showSnackbar("Error updating expense status.");
    }
  };

  // Prepare data for charts
  const incomeChartData = incomes.reduce((acc, income) => {
    const key = income.description || "Other";
    acc[key] = (acc[key] || 0) + parseFloat(income.amount || 0);
    return acc;
  }, {});

  const expenseChartData = expenses.reduce((acc, expense) => {
    const key =
      expenseTypes.find((type) => type.id === expense.category_id)?.name ||
      expense.expense_type ||
      "Other";
    acc[key] = (acc[key] || 0) + parseFloat(expense.amount || 0);
    return acc;
  }, {});

  const incomeDataForChart = Object.entries(incomeChartData).map(
    ([name, value]) => ({ name, value })
  );
  const expenseDataForChart = Object.entries(expenseChartData).map(
    ([name, value]) => ({ name, value })
  );

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

            {/* Total Earnings */}
            <div className="border p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium">Total Earnings</h2>
                <CurrencyRupeeIcon className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold">
                ₹{financeStats.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Filter */}
      <div className="flex space-x-4 my-4">
        <Input
          type="date"
          placeholder="Start Date"
          value={dateFilter.startDate}
          onChange={(e) =>
            setDateFilter({ ...dateFilter, startDate: e.target.value })
          }
        />
        <Input
          type="date"
          placeholder="End Date"
          value={dateFilter.endDate}
          onChange={(e) =>
            setDateFilter({ ...dateFilter, endDate: e.target.value })
          }
        />
        <Button
          onClick={() => {
            setCurrentPage(1);
            fetchFinanceData();
          }}
        >
          Filter
        </Button>
      </div>

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
                    )?.name ||
                      expense.expense_type ||
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      onClick={() =>
                        toggleExpenseStatus(expense.id, expense.status)
                      }
                    >
                      <Badge
                        variant={
                          expense.status === "paid" ? "default" : "destructive"
                        }
                      >
                        {expense.status}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>
                    {expense.final_date_to_pay
                      ? new Date(expense.final_date_to_pay).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* Add Expense and Add Income Buttons */}
      <div className="flex items-center mt-4">
        <Button
          variant="default"
          className="mr-4"
          onClick={() => setExpenseDialogOpen(true)}
        >
          <AddIcon className="mr-2 h-4 w-4" />
          Add Expense
        </Button>

        <Button variant="default" onClick={() => setIncomeDialogOpen(true)}>
          <AddIcon className="mr-2 h-4 w-4" />
          Add Income
        </Button>

        <Button
          variant="default"
          className="ml-4"
          onClick={() => setExpenseTypeDialogOpen(true)}
        >
          <AddIcon className="mr-2 h-4 w-4" />
          Add Expense Type
        </Button>
      </div>

      {/* Income Dialog */}
      <Dialog open={isIncomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Income</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <Input
              placeholder="Description"
              value={newIncome.description}
              onChange={(e) =>
                setNewIncome({ ...newIncome, description: e.target.value })
              }
            />
            <Input
              placeholder="Amount"
              type="number"
              value={newIncome.amount}
              onChange={(e) =>
                setNewIncome({ ...newIncome, amount: e.target.value })
              }
            />
            <Input
              type="date"
              placeholder="Income Date"
              value={newIncome.income_date}
              onChange={(e) =>
                setNewIncome({
                  ...newIncome,
                  income_date: e.target.value,
                })
              }
            />
          </div>
          <Button onClick={handleIncomeSubmit} className="mt-4">
            Add Income
          </Button>
        </DialogContent>
      </Dialog>

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

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 my-4">
        <Card className="border">
          <CardHeader>
            <CardTitle>Income Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={400}>
              <Pie
                data={incomeDataForChart}
                cx={200}
                cy={200}
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {incomeDataForChart.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={400}>
              <Pie
                data={expenseDataForChart}
                cx={200}
                cy={200}
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {expenseDataForChart.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>
      </div>

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
