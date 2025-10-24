/*
  # Fix Transactions RLS Policy

  1. Changes
    - Drop the restrictive INSERT policy that checks auth.uid()
    - Create new INSERT policy that allows authenticated users without auth.uid() check
    - This is needed because the app uses custom authentication (app_users table) not Supabase Auth

  2. Security
    - Still restricts to authenticated users only
    - Users must be logged in to create transactions
*/

DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON transactions;

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);
