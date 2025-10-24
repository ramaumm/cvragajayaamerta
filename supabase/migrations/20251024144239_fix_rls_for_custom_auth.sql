/*
  # Fix RLS for Custom Authentication System

  This migration disables RLS on tables that are accessed by the application's custom authentication system.
  The application uses a PIN-based auth with the `app_users` table instead of Supabase Auth,
  so users don't have the 'authenticated' role that the RLS policies check for.

  ## Changes
  - Disable RLS on `products` table
  - Disable RLS on `customers` table
  - Disable RLS on `transactions` table
  - Disable RLS on `transaction_items` table

  ## Security Note
  The application's security is handled at the application layer through the custom PIN authentication system.
*/

-- Disable RLS on products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Disable RLS on customers table
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Disable RLS on transactions table
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on transaction_items table
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
