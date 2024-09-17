// src/components/Attendance.jsx
import React from 'react';
import { attendanceData } from '../mockData';

const Attendance = () => {
  return (
    <div>
      <h2>Daily Attendance Tracking</h2>
      {attendanceData.map(log => (
        <div key={log.id}>
          <p>Member ID: {log.memberId}</p>
          <p>Date: {log.date}</p>
          <p>Status: {log.status}</p>
        </div>
      ))}
    </div>
  );
};

export default Attendance;
