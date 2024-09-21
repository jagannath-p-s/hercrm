// Dashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '../supabaseClient';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { Users, UserCheck, DollarSign, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    joinedToday: 0,
    joinedThisWeek: 0,
    joinedThisMonth: 0,
    joinedThisYear: 0,
    currentlyPresent: 0,
    presentToday: 0,
    subscriptionsSoldToday: 0,
    totalCredit: 0,
    totalRevenue: 0,
    totalEquipmentValue: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get current date and time intervals
      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Assuming week starts on Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);

      // 1. Number of people who joined today
      const { data: joinedTodayData, error: joinedTodayError } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());
      if (joinedTodayError) throw joinedTodayError;
      const joinedToday = joinedTodayData.length;

      // 2. Number of people who joined this week
      const { data: joinedThisWeekData, error: joinedThisWeekError } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());
      if (joinedThisWeekError) throw joinedThisWeekError;
      const joinedThisWeek = joinedThisWeekData.length;

      // 3. Number of people who joined this month
      const { data: joinedThisMonthData, error: joinedThisMonthError } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());
      if (joinedThisMonthError) throw joinedThisMonthError;
      const joinedThisMonth = joinedThisMonthData.length;

      // 4. Number of people who joined this year
      const { data: joinedThisYearData, error: joinedThisYearError } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', yearStart.toISOString())
        .lte('created_at', yearEnd.toISOString());
      if (joinedThisYearError) throw joinedThisYearError;
      const joinedThisYear = joinedThisYearData.length;

      // 5. Members currently present at the gym
      const { data: currentAccessLogs, error: currentAccessLogsError } = await supabase
        .from('access_logs')
        .select('user_id, timestamp')
        .gte('timestamp', todayStart.toISOString())
        .lte('timestamp', now.toISOString());
      if (currentAccessLogsError) throw currentAccessLogsError;

      // Process current presence
      const presenceMap = {};
      currentAccessLogs.forEach((log) => {
        if (!presenceMap[log.user_id]) {
          presenceMap[log.user_id] = [];
        }
        presenceMap[log.user_id].push(log.timestamp);
      });

      let currentlyPresent = 0;
      for (const userId in presenceMap) {
        const timestamps = presenceMap[userId]
          .map((ts) => new Date(ts))
          .sort((a, b) => a - b);
        if (timestamps.length % 2 !== 0) {
          // Odd number of logs means the member is currently in the gym
          currentlyPresent += 1;
        }
      }

      // 6. Number of members who were present today
      const presentToday = Object.keys(presenceMap).length;

      // 7. Number of subscriptions or membership plans sold today
      const { data: subscriptionsTodayData, error: subscriptionsTodayError } = await supabase
        .from('subscriptions')
        .select('id')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());
      if (subscriptionsTodayError) throw subscriptionsTodayError;
      const subscriptionsSoldToday = subscriptionsTodayData.length;

      // 8. Total credit (assuming total amount owed by members)
      const { data: totalCreditData, error: totalCreditError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending');
      if (totalCreditError) throw totalCreditError;
      const totalCredit = totalCreditData.reduce((acc, curr) => acc + curr.amount, 0);

      // 9. Total revenue (sum of all payments)
      const { data: totalRevenueData, error: totalRevenueError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');
      if (totalRevenueError) throw totalRevenueError;
      const totalRevenue = totalRevenueData.reduce((acc, curr) => acc + curr.amount, 0);

      // 10. Current value of all equipment
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipments')
        .select('value, quantity');
      if (equipmentError) throw equipmentError;
      const totalEquipmentValue = equipmentData.reduce(
        (acc, curr) => acc + curr.value * curr.quantity,
        0
      );

      setStats({
        joinedToday,
        joinedThisWeek,
        joinedThisMonth,
        joinedThisYear,
        currentlyPresent,
        presentToday,
        subscriptionsSoldToday,
        totalCredit,
        totalRevenue,
        totalEquipmentValue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {/* Joined Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Joined Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.joinedToday}</div>
          </CardContent>
        </Card>

        {/* Joined This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Joined This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.joinedThisWeek}</div>
          </CardContent>
        </Card>

        {/* Joined This Month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Joined This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.joinedThisMonth}</div>
          </CardContent>
        </Card>

        {/* Joined This Year */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Joined This Year</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.joinedThisYear}</div>
          </CardContent>
        </Card>

        {/* Currently Present */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Currently Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentlyPresent}</div>
          </CardContent>
        </Card>

        {/* Present Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentToday}</div>
          </CardContent>
        </Card>

        {/* Subscriptions Sold Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions Sold Today</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subscriptionsSoldToday}</div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        {/* Total Credit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCredit.toFixed(2)}</div>
          </CardContent>
        </Card>

        {/* Total Equipment Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalEquipmentValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
