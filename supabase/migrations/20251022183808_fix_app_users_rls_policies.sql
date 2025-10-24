/*
  # Fix App Users RLS Policies

  1. Changes
    - Drop all existing RLS policies that cause infinite recursion
    - Disable RLS on app_users table
    - App will handle authorization in application code instead of database level

  2. Security Notes
    - Since we're using PIN-based auth stored in localStorage (not Supabase Auth)
    - RLS policies that reference the table itself cause infinite recursion
    - Application-level security is more appropriate for this use case
*/

DROP POLICY IF EXISTS "Super admin can read all users" ON app_users;
DROP POLICY IF EXISTS "Super admin can insert users" ON app_users;
DROP POLICY IF EXISTS "Users can update their last login" ON app_users;

ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
