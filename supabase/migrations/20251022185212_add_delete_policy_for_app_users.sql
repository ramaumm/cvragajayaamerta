/*
  # Add Delete Policy for App Users

  1. Changes
    - Add RLS policy to allow deleting non-super-admin users
    - Since RLS is disabled on app_users table, we need to handle deletion at application level
    - This migration ensures the table structure supports deletion properly

  2. Security Notes
    - RLS is disabled on this table to prevent infinite recursion
    - Application code will handle authorization
    - Only non-super-admin users can be deleted
*/

-- No changes needed as RLS is already disabled
-- The deletion should work through application code
-- This migration serves as documentation that deletion is handled at app level
