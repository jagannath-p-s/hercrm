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
import { Badge } from "@/components/ui/badge";
import { supabase } from "../supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, parseISO, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, XCircle, UserCheck } from "lucide-react";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserAttendance, setSelectedUserAttendance] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(""); // To store selected user's name
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [avgCheckIn, setAvgCheckIn] = useState("-");
  const [avgCheckOut, setAvgCheckOut] = useState("-");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    fetchTodayAttendanceData();
  }, []);

  // Fetch attendance for today
  const fetchTodayAttendanceData = async () => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    try {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*");
      if (usersError) throw usersError;

      const { data: accessLogs, error: logsError } = await supabase
        .from("access_logs")
        .select("*")
        .gte("timestamp", todayStart.toISOString())
        .lte("timestamp", todayEnd.toISOString());
      if (logsError) throw logsError;

      let presentCount = 0;
      let absentCount = 0;
      let totalCheckInTime = 0;
      let totalCheckOutTime = 0;

      const attendanceList = usersData.map((user) => {
        const userLogs = accessLogs
          .filter((log) => log.user_id === user.user_id)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        let checkInTime = null;
        let checkOutTime = null;

        if (userLogs.length > 0) {
          checkInTime = parseISO(userLogs[0].timestamp);
          checkOutTime = parseISO(userLogs[userLogs.length - 1].timestamp);

          const checkInTimeStr = format(checkInTime, "HH:mm");
          const checkOutTimeStr = format(checkOutTime, "HH:mm");

          presentCount++;
          totalCheckInTime += checkInTime.getHours() * 60 + checkInTime.getMinutes();
          totalCheckOutTime += checkOutTime.getHours() * 60 + checkOutTime.getMinutes();

          return {
            id: user.user_id,
            name: user.name,
            checkIn: checkInTimeStr,
            checkOut: checkOutTimeStr,
            status: "Present",
          };
        } else {
          absentCount++;
          return {
            id: user.user_id,
            name: user.name,
            checkIn: "-",
            checkOut: "-",
            status: "Absent",
          };
        }
      });

      setAttendanceData(attendanceList);
      setTotalPresent(presentCount);
      setTotalAbsent(absentCount);
      setAvgCheckIn(
        presentCount
          ? `${Math.floor(totalCheckInTime / presentCount / 60)
          }:${totalCheckInTime / presentCount % 60}`
          : "-"
      );
      setAvgCheckOut(
        presentCount
          ? `${Math.floor(totalCheckOutTime / presentCount / 60)
          }:${totalCheckOutTime / presentCount % 60}`
          : "-"
      );
    } catch (error) {
      console.error("Error fetching today's attendance data:", error);
    }
  };

  // Fetch attendance for selected user and month
  const fetchUserAttendanceForMonth = async (userId) => {
    const firstDayOfMonth = startOfMonth(new Date(selectedMonth + "-01"));
    const lastDayOfMonth = endOfMonth(firstDayOfMonth);

    try {
      const { data: userLogs, error } = await supabase
        .from("access_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("timestamp", firstDayOfMonth.toISOString())
        .lte("timestamp", lastDayOfMonth.toISOString());

      if (error) throw error;

      const groupedAttendance = groupLogsByDay(userLogs);
      setSelectedUserAttendance(groupedAttendance);
    } catch (error) {
      console.error("Error fetching user's monthly attendance:", error);
    }
  };

  const groupLogsByDay = (logs) => {
    const grouped = {};

    logs.forEach((log) => {
      const logDate = format(parseISO(log.timestamp), "yyyy-MM-dd");

      if (!grouped[logDate]) {
        grouped[logDate] = { checkIn: null, checkOut: null };
      }

      if (!grouped[logDate].checkIn) {
        grouped[logDate].checkIn = log.timestamp; // First log is check-in
      }

      grouped[logDate].checkOut = log.timestamp; // Last log is check-out
    });

    return Object.entries(grouped).map(([date, times]) => ({
      date,
      checkIn: times.checkIn ? format(parseISO(times.checkIn), "HH:mm") : "-",
      checkOut: times.checkOut ? format(parseISO(times.checkOut), "HH:mm") : "-",
    }));
  };

  const handleOpenDialog = async (userId, userName) => {
    setSelectedUser(userId);
    setSelectedUserName(userName); // Set the selected user's name
    await fetchUserAttendanceForMonth(userId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUserAttendance([]);
    setSelectedUser(null);
  };

  // Fetch user attendance when the selected month changes
  useEffect(() => {
    if (selectedUser) {
      fetchUserAttendanceForMonth(selectedUser);
    }
  }, [selectedMonth, selectedUser]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const filteredAttendanceData = attendanceData.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Summary Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPresent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAbsent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Check-In Time</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCheckIn}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Check-Out Time</CardTitle>
            <ExitToAppIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCheckOut}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Attendance</h1>
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendanceData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === "Present" ? "default" : "destructive"}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => handleOpenDialog(record.id, record.name)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for Viewing Complete Attendance */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUserName}'s Attendance Details</DialogTitle> {/* Display user name */}
          </DialogHeader>
          <div className="mb-4">
            <Input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-[200px]"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedUserAttendance.map((log, index) => (
                <TableRow key={`${log.date}-${index}`}>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.checkIn}</TableCell>
                  <TableCell>{log.checkOut}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Attendance;