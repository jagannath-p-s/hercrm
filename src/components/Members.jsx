// src/components/Members.jsx
import React from 'react';
import { membersData } from '../mockData';

const Members = () => {
  return (
    <div>
      <h2>Active Members</h2>
      {membersData.map(member => (
        <div key={member.id}>
          <h3>{member.firstName} {member.lastName}</h3>
          <p>Blood Group: {member.bloodGroup}</p>
          <p>Medical Conditions: {member.medicalConditions}</p>
          <p>Fitness Goals: {member.fitnessGoals}</p>
          <p>Membership Expiry: {member.membershipExpiry}</p>
          <p>Pending Balance: ${member.pendingBalance}</p>
        </div>
      ))}
    </div>
  );
};

export default Members;
