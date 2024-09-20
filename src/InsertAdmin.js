import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Supabase credentials
const supabaseUrl = "https://prhanfqprvkkzapufmec.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaGFuZnFwcnZra3phcHVmbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4MDk2NTgsImV4cCI6MjA0MjM4NTY1OH0.dc7x6-RRfz7rRuz8F6FB0mvhM-kDK5rxc2WpJxfs5TU";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin user data
const adminUser = {
  username: 'AdminUser', 
  useremail: 'admin@example.com',
  password: '123', 
  role: 'Admin', 
  mobile_number: '9999999999', 
  employee_code: 'ADM001' // Employee code for admin
};

// Function to hash the password and insert the user data
async function insertUser(user) {
  try {
    // Hash the password
    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = bcrypt.hashSync(user.password, salt);

    // Insert user data with hashed password into the 'staffs' table
    const { data, error } = await supabase
      .from('staffs')
      .insert([{ ...user, password: hashedPassword }]);

    if (error) {
      throw error;
    }

    console.log('Admin user inserted successfully');
  } catch (err) {
    console.error('Error inserting admin user:', err);
  }
}

// Insert the admin user
insertUser(adminUser);
