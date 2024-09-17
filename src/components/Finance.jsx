// src/components/Finance.jsx
import React from 'react';
import { paymentsData } from '../mockData';

const Finance = () => {
  return (
    <div>
      <h2>Daily and Weekly Collections</h2>
      {paymentsData.map(payment => (
        <div key={payment.id}>
          <p>Member ID: {payment.memberId}</p>
          <p>Amount: ${payment.amount}</p>
          <p>Date: {payment.date}</p>
          <p>Payment Mode: {payment.mode}</p>
        </div>
      ))}
    </div>
  );
};

export default Finance;
