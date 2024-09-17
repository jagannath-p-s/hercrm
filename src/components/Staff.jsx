// src/components/Staff.jsx
import React from 'react';
import { staffData } from '../mockData';

const Staff = () => {
  return (
    <div>
      <h2>Staff Attendance & Payroll</h2>
      {staffData.map(staff => (
        <div key={staff.id}>
          <h3>{staff.firstName} {staff.lastName}</h3>
          <p>Position: {staff.position}</p>
          <p>Attendance: {staff.attendance}</p>
        </div>
      ))}
    </div>
  );
};

export default Staff;
