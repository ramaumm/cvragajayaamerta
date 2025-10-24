/*
  # Remove Foreign Key Constraint on Transactions

  1. Changes
    - Drop the foreign key constraint on transactions.created_by that references auth.users
    - This is needed because the app uses custom authentication (app_users table) not Supabase Auth
    - The created_by field will remain but without the foreign key constraint

  2. Security
    - RLS policies still protect the transactions table
    - Only authenticated users can insert/view transactions
*/

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_created_by_fkey;
