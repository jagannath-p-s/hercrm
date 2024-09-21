// Staff.jsx

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
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  Clock,
  XCircle,
  MoreVertical,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { Input } from "@/components/ui/input";

import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  min,
  endOfDay,
} from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Staff = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [present, setPresent] = useState(0);
  const [absent, setAbsent] = useState(0);
  const [late, setLate] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStaffName, setNewStaffName] = useState("");
  const [selectedStaff, setSelectedStaff] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return format(now, "MMMM yyyy");
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Office start time and late threshold
  const officeStartTime = "09:00";
  const lateThreshold = "09:15";

  useEffect(() => {
    fetchAttendanceDataForMonth();
  }, [selectedMonth]);

  const fetchAttendanceDataForMonth = async () => {
    const [month, year] = selectedMonth.split(" ");
    const firstDay = startOfMonth(new Date(`${month} 1, ${year}`));
    const lastDay = endOfMonth(firstDay);
    const today = new Date();
    const lastRelevantDay = min([lastDay, today]);
    const daysInMonth = eachDayOfInterval({
      start: firstDay,
      end: lastRelevantDay,
    });

    try {
      // Fetch staff members from the 'staffs' table
      const { data: staffsData, error: staffsError } = await supabase
        .from("staffs")
        .select("*");
      if (staffsError) throw staffsError;

      // Fetch access logs for the selected month
      const { data: accessLogs, error: logsError } = await supabase
        .from("access_logs")
        .select("*")
        .gte("timestamp", firstDay.toISOString())
        .lte("timestamp", lastRelevantDay.toISOString());
      if (logsError) throw logsError;

      // Create a map to hold attendance data per staff member
      const attendanceMap = staffsData.reduce((acc, staff) => {
        acc[staff.user_id] = {
          id: staff.user_id,
          name: staff.username,
          role: staff.role || "Staff",
          daysPresent: 0,
          daysLate: 0,
          daysAbsent: daysInMonth.length,
          totalCheckInMinutes: 0,
          checkInCount: 0,
          status: "Absent",
          checkIn: "-",
          checkOut: "-",
        };
        return acc;
      }, {});

      // Process each day in the month
      for (const day of daysInMonth) {
        for (const staff of staffsData) {
          const staffLogs = accessLogs
            .filter(
              (log) =>
                log.user_id === staff.user_id &&
                isSameDay(parseISO(log.timestamp), day)
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          if (staffLogs.length > 0) {
            let checkInTime = null;
            let checkOutTime = null;
            let isCheckIn = true;

            // Process logs in pairs
            for (let i = 0; i < staffLogs.length; i++) {
              const log = staffLogs[i];
              const timestamp = parseISO(log.timestamp);

              if (isCheckIn) {
                // Check-in
                if (!checkInTime || timestamp < checkInTime) {
                  checkInTime = timestamp;
                }
              } else {
                // Check-out
                if (!checkOutTime || timestamp > checkOutTime) {
                  checkOutTime = timestamp;
                }
              }

              isCheckIn = !isCheckIn; // Toggle between check-in and check-out
            }

            // Handle unmatched check-in (odd number of logs)
            if (!checkOutTime && checkInTime) {
              checkOutTime = endOfDay(checkInTime);
            }

            const checkInTimeStr = checkInTime
              ? format(checkInTime, "HH:mm")
              : "-";
            const checkOutTimeStr = checkOutTime
              ? format(checkOutTime, "HH:mm")
              : "-";

            // Determine status based on check-in time
            const checkInTotalMinutes =
              checkInTime.getHours() * 60 + checkInTime.getMinutes();

            const [lateThresholdHours, lateThresholdMinutes] = lateThreshold
              .split(":")
              .map(Number);
            const lateThresholdTotalMinutes =
              lateThresholdHours * 60 + lateThresholdMinutes;

            const status =
              checkInTotalMinutes <= lateThresholdTotalMinutes
                ? "Present"
                : "Late";

            // Update attendance data
            attendanceMap[staff.user_id].daysAbsent -= 1;
            attendanceMap[staff.user_id].daysPresent += 1;
            if (status === "Late") {
              attendanceMap[staff.user_id].daysLate += 1;
            }
            attendanceMap[staff.user_id].totalCheckInMinutes +=
              checkInTotalMinutes;
            attendanceMap[staff.user_id].checkInCount += 1;

            if (isSameDay(day, today)) {
              attendanceMap[staff.user_id].status = status;
              attendanceMap[staff.user_id].checkIn = checkInTimeStr;
              attendanceMap[staff.user_id].checkOut = checkOutTimeStr;
            }
          }
        }
      }

      // Calculate average check-in time
      Object.values(attendanceMap).forEach((staff) => {
        if (staff.checkInCount > 0) {
          const avgCheckInMinutes = Math.round(
            staff.totalCheckInMinutes / staff.checkInCount
          );
          const avgHours = Math.floor(avgCheckInMinutes / 60);
          const avgMinutes = avgCheckInMinutes % 60;
          staff.averageCheckIn = `${String(avgHours).padStart(2, "0")}:${String(
            avgMinutes
          ).padStart(2, "0")}`;
        } else {
          staff.averageCheckIn = "-";
        }
      });

      const attendanceList = Object.values(attendanceMap);
      const presentCount = attendanceList.filter(
        (staff) => staff.status === "Present" || staff.status === "Late"
      ).length;
      const lateCount = attendanceList.filter(
        (staff) => staff.status === "Late"
      ).length;
      const absentCount = attendanceList.filter(
        (staff) => staff.status === "Absent"
      ).length;

      setAttendanceData(attendanceList);
      setTotalStaff(staffsData.length);
      setPresent(presentCount);
      setLate(lateCount);
      setAbsent(absentCount);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const handleAddStaff = async () => {
    if (newStaffName.trim()) {
      const newUserId = `USR${Math.floor(Math.random() * 1000000)}`;

      const { data, error } = await supabase.from("staffs").insert([
        {
          username: newStaffName.trim(),
          useremail: `${newStaffName
            .trim()
            .toLowerCase()
            .replace(" ", ".")}@example.com`,
          password: "password123", // In production, hash the password
          role: "Staff",
          mobile_number: "0000000000",
          employee_code: `EMP${Math.floor(Math.random() * 1000000)}`,
          start_date: new Date().toISOString(),
          end_date: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString(),
          user_id: newUserId,
          active: true,
        },
      ]);
      if (error) {
        console.error("Error adding new staff:", error);
      } else {
        setNewStaffName("");
        setIsDialogOpen(false); // Close the dialog after saving
        fetchAttendanceDataForMonth(); // Refresh attendance data after adding a staff member
      }
    }
  };

  const handleEditStaff = async () => {
    if (selectedStaff.name) {
      const { error } = await supabase
        .from("staffs")
        .update({
          username: selectedStaff.name,
        })
        .eq("user_id", selectedStaff.id);

      if (error) {
        console.error("Error updating staff:", error);
      } else {
        setIsEditDialogOpen(false);
        fetchAttendanceDataForMonth(); // Refresh attendance data
      }
    }
  };

  const handleDeleteStaff = async () => {
    if (selectedStaff) {
      const { error } = await supabase
        .from("staffs")
        .delete()
        .eq("user_id", selectedStaff.id);
      if (error) {
        console.error("Error deleting staff:", error);
      } else {
        setIsAlertDialogOpen(false);
        fetchAttendanceDataForMonth(); // Refresh attendance data
      }
    }
  };

  const openEditDialog = (staff) => {
    setSelectedStaff(staff); // Set the selected staff's full details
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (staff) => {
    setSelectedStaff(staff);
    setIsAlertDialogOpen(true);
  };

  const handleViewReport = (staffId) => {
    navigate(`/home/attendance/${staffId}`); // Redirect to individual attendance report
  };

  const filteredAttendanceData = attendanceData.filter((staff) =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      options.push(format(date, "MMMM yyyy"));
    }
    return options;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold ml-2 md:-ml-0">Staff Attendance</h1>
        <div className="flex items-center space-x-4"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{present}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{late}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absent}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>Attendance Details</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Search staff"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">Add Staff</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Staff</DialogTitle>
                    <DialogDescription>
                      Fill in the details of the new staff member.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="Staff Name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="mb-4"
                  />
                  <Button onClick={handleAddStaff}>Add Staff</Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Current Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days Present</TableHead>
                <TableHead>Days Absent</TableHead>
                <TableHead>Days Late</TableHead>
                <TableHead>Avg Check-in</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendanceData.map((record) => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>
                    {format(new Date(), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.status === "Present"
                          ? "default"
                          : record.status === "Late"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {record.daysPresent}
                  </TableCell>
                  <TableCell className="text-center">
                    {record.daysAbsent}
                  </TableCell>
                  <TableCell className="text-center">
                    {record.daysLate}
                  </TableCell>
                  <TableCell className="text-center">
                    {record.averageCheckIn}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <MoreVertical className="h-5 w-5 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          className="cursor-pointer font-medium"
                          onClick={() => handleViewReport(record.id)}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium"
                          onClick={() => openEditDialog(record)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium"
                          onClick={() => openDeleteDialog(record)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>
              Update the details of the staff member.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Staff Name"
            value={selectedStaff?.name || ""}
            onChange={(e) =>
              setSelectedStaff({ ...selectedStaff, name: e.target.value })
            }
            className="mb-4"
          />
          <Button onClick={handleEditStaff}>Save</Button>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Alert Dialog */}
      <AlertDialog
        open={isAlertDialogOpen}
        onOpenChange={setIsAlertDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this staff member?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and will permanently delete the staff
              member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Staff;
