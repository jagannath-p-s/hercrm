// src/mockData.js

export const membersData = [
    {
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      bloodGroup: 'O+',
      medicalConditions: 'Asthma',
      allergies: 'None',
      injuries: 'Knee issues',
      medications: 'Inhaler',
      fitnessGoals: 'Weight loss',
      membershipExpiry: '2024-01-15',
      pendingBalance: 50,
    },
    {
      id: 2,
      firstName: 'John',
      lastName: 'Smith',
      bloodGroup: 'A+',
      medicalConditions: 'None',
      allergies: 'Peanuts',
      injuries: 'None',
      medications: 'None',
      fitnessGoals: 'Muscle building',
      membershipExpiry: '2023-12-20',
      pendingBalance: 0,
    },
  ];
  
  export const paymentsData = [
    { id: 1, memberId: 1, amount: 100, date: '2023-12-01', mode: 'Credit Card' },
    { id: 2, memberId: 2, amount: 120, date: '2023-12-10', mode: 'Cash' },
  ];
  
  export const attendanceData = [
    { id: 1, memberId: 1, date: '2023-12-15', status: 'Check-in' },
    { id: 2, memberId: 2, date: '2023-12-16', status: 'Check-in' },
  ];
  
  export const staffData = [
    { id: 1, firstName: 'Alice', lastName: 'Green', position: 'Trainer', attendance: 'Present' },
    { id: 2, firstName: 'Bob', lastName: 'Brown', position: 'Admin', attendance: 'Absent' },
  ];
  
  export const equipmentData = [
    { id: 1, name: 'Treadmill', maintenanceDue: '2024-01-10' },
    { id: 2, name: 'Dumbbells', maintenanceDue: '2024-02-15' },
  ];
  