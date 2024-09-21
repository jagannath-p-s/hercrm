// Attendance.jsx

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

import {
  format,
  parseISO,
  isSameDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  min,
} from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return format(now, "MMMM yyyy");
  });

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
      // Fetch users from the 'users' table
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*");
      if (usersError) throw usersError;

      // Fetch staff members from the 'staffs' table
      const { data: staffsData, error: staffsError } = await supabase
        .from("staffs")
        .select("*");
      if (staffsError) throw staffsError;

      // Merge users and staff data
      const combinedData = [];

      // Map users data
      usersData.forEach((user) => {
        combinedData.push({
          id: user.user_id, // Use user_id for consistency
          name: user.name,
          role: user.role || "User",
        });
      });

      // Map staff data and avoid duplicates
      staffsData.forEach((staff) => {
        const exists = combinedData.find((item) => item.id === staff.user_id);
        if (!exists) {
          combinedData.push({
            id: staff.user_id,
            name: staff.username,
            role: staff.role || "Staff",
          });
        }
      });

      // Fetch access logs for the selected month
      const { data: accessLogs, error: logsError } = await supabase
        .from("access_logs")
        .select("*")
        .gte("timestamp", firstDay.toISOString())
        .lte("timestamp", lastRelevantDay.toISOString());
      if (logsError) throw logsError;

      // Prepare attendance data
      const attendanceList = [];

      for (const day of daysInMonth) {
        for (const person of combinedData) {
          const personLogs = accessLogs
            .filter(
              (log) =>
                log.user_id === person.id &&
                isSameDay(parseISO(log.timestamp), day)
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          if (personLogs.length > 0) {
            let checkInTime = null;
            let checkOutTime = null;
            let isCheckIn = true;

            // Process logs in pairs
            for (let i = 0; i < personLogs.length; i++) {
              const log = personLogs[i];
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

            attendanceList.push({
              id: person.id,
              name: person.name,
              role: person.role,
              date: format(day, "yyyy-MM-dd"),
              checkIn: checkInTimeStr,
              checkOut: checkOutTimeStr,
            });
          } else {
            // Absent
            attendanceList.push({
              id: person.id,
              name: person.name,
              role: person.role,
              date: format(day, "yyyy-MM-dd"),
              checkIn: "-",
              checkOut: "-",
            });
          }
        }
      }

      setAttendanceData(attendanceList);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const filteredAttendanceData = attendanceData.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold ml-2 md:-ml-0">Attendance Records</h1>
        <div className="flex items-center space-x-4"></div>
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
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendanceData.map((record, index) => (
                <TableRow key={`${record.id}-${index}`}>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{record.role}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.checkIn !== "-" ? "default" : "destructive"
                      }
                    >
                      {record.checkIn !== "-" ? "Present" : "Absent"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
