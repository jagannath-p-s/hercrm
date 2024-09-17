import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
const supabaseUrl = "https://btkcswhboimzhaeyujlc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a2Nzd2hib2ltemhhZXl1amxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUyNjA5MzAsImV4cCI6MjA0MDgzNjkzMH0.zgZX8hiODJfxuF9PGIMIO6IEh_bIeKMld9Hcdju_TdQ";

export const supabase = createClient(supabaseUrl, supabaseKey);


// Admin user data
const adminUser = {
  username: 'AdminUser', 
  useremail: 'admin@example.com',
  password: 'adminpassword', 
  role: 'Admin', 
  mobile_number: '9999999999', 
  can_edit_staff: true,
  can_edit_pipeline: true,
  can_edit_product: true,
  can_edit_files: true,
  can_edit_enquiries: true,
  can_edit_stock: true,
  can_edit_product_enquiry: true,
  can_edit_service_enquiry: true,
  can_edit_sales: true,
  can_see_performance: true,
  employee_code: 'ADM001', // Employee code for admin
};

// Function to hash the password and insert the user data
async function insertUser(user) {
  try {
    // Hash the password
    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = bcrypt.hashSync(user.password, salt);

    // Insert user data with hashed password
    const { data, error } = await supabase
      .from('users')
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
