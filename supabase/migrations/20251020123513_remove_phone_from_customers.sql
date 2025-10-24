/*
  # Remove phone field from customers table

  1. Changes
    - Drop `phone` column from customers table
    - Customers will only have name and address
  
  2. Notes
    - This aligns with the requirement to only track name and address
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'phone'
  ) THEN
    ALTER TABLE customers DROP COLUMN phone;
  END IF;
END $$;