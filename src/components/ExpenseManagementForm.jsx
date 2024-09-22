// ExpenseManagementForm.js
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';
import { supabase } from '../supabaseClient';

const ExpenseManagementForm = ({ onExpenseAdded }) => {
  const form = useForm({
    defaultValues: {
      description: '',
      amount: '',
      status: 'unpaid',
      final_date_to_pay: '',
    },
  });

  const handleSubmit = async (data) => {
    try {
      await supabase.from('expenses').insert([
        {
          description: data.description,
          amount: parseFloat(data.amount),
          status: data.status,
          final_date_to_pay: data.final_date_to_pay || null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
      form.reset();
      onExpenseAdded();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select {...field} className="w-full border p-2">
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="final_date_to_pay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Date to Pay</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <button type="submit" className="mt-4 bg-green-500 text-white p-2">
          Add Expense
        </button>
      </form>
    </Form>
  );
};

export default ExpenseManagementForm;
