/*
  # Create App Users Table with PIN-based Authentication

  1. New Tables
    - `app_users`
      - `id` (uuid, primary key)
      - `username` (text, unique, not null) - Display name for user
      - `pin` (text, not null) - 4-6 digit PIN for authentication
      - `is_super_admin` (boolean, default false) - Super admin flag
      - `created_at` (timestamptz, default now())
      - `created_by` (uuid, references app_users) - Who created this user
      - `last_login` (timestamptz) - Last login timestamp

  2. Security
    - Enable RLS on `app_users` table
    - Super admin can read all users
    - Super admin can insert new users
    - Users can read their own data
    - Users can update their last_login

  3. Initial Data
    - Create default super admin with PIN "1234"
*/

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  pin text NOT NULL,
  is_super_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES app_users(id),
  last_login timestamptz
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can read all users"
  ON app_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users AS au
      WHERE au.id = (current_setting('app.current_user_id', true))::uuid
      AND au.is_super_admin = true
    )
    OR id = (current_setting('app.current_user_id', true))::uuid
  );

CREATE POLICY "Super admin can insert users"
  ON app_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users AS au
      WHERE au.id = (current_setting('app.current_user_id', true))::uuid
      AND au.is_super_admin = true
    )
  );

CREATE POLICY "Users can update their last login"
  ON app_users FOR UPDATE
  USING (id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (id = (current_setting('app.current_user_id', true))::uuid);

INSERT INTO app_users (username, pin, is_super_admin)
VALUES ('Super Admin', '1234', true)
ON CONFLICT (username) DO NOTHING;
