/*
  # Change payment_terms_days to text type

  1. Changes
    - Change `payment_terms_days` column type from integer to text
    - This allows flexible formats like:
      - "14 Hari (1 November 2025)"
      - "14 hari"
      - "30 hari (November 2025)"
  
  2. Notes
    - More flexible for different payment term formats
    - Can include custom text and dates
*/

DO $$
BEGIN
  -- Change column type from integer to text
  ALTER TABLE transactions ALTER COLUMN payment_terms_days TYPE text USING payment_terms_days::text;
END $$;