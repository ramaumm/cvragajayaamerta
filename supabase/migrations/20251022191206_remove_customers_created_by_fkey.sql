/*
  # Remove Foreign Key Constraint on Customers

  1. Changes
    - Drop the foreign key constraint on customers.created_by that references auth.users
    - This is needed because the app uses custom authentication (app_users table) not Supabase Auth
    - The created_by field will remain but without the foreign key constraint

  2. Security
    - RLS policies still protect the customers table
    - Only authenticated users can insert/view customers
*/

ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_created_by_fkey;
