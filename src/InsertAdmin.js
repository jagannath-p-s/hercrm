import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Supabase credentials
const supabaseUrl = "https://prhanfqprvkkzapufmec.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaGFuZnFwcnZra3phcHVmbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4MDk2NTgsImV4cCI6MjA0MjM4NTY1OH0.dc7x6-RRfz7rRuz8F6FB0mvhM-kDK5rxc2WpJxfs5TU";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Sample admin user data for 'public.staffs' table
const adminUser = {
  employee_code: 'ADM001',  // Unique employee code
  username: 'Admin User',   // Name of the staff
  useremail: 'admin@example.com',  // Admin email
  mobile_number: '9999999999',  // Admin mobile number
  role: 'Admin',  // Admin role
  password: '123',  // Placeholder password (will be hashed)
  user_id: 'USR001', // Unique user ID
  start_date: new Date(),  // Current start date
  end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))  // 1 year from now as end date
};

// Function to hash the password and insert the user data into 'public.staffs'
async function insertUser(user) {
  try {
    // Hash the password
    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = bcrypt.hashSync(user.password, salt);

    // Insert user data into the 'public.staffs' table with hashed password
    const { data, error } = await supabase
      .from('staffs')
      .insert([{
        employee_code: user.employee_code,
        username: user.username,
        useremail: user.useremail,
        mobile_number: user.mobile_number,
        role: user.role,
        password: hashedPassword,  // Store the hashed password
        user_id: user.user_id,  // Insert the unique user_id
        active: true,  // Default to active
        start_date: user.start_date,  // Start date
        end_date: user.end_date  // End date (1 year from now)
      }]);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Admin staff inserted successfully');
  } catch (err) {
    console.error('Error inserting admin staff:', err.message || err);
  }
}

// Insert the sample admin staff
insertUser(adminUser);
