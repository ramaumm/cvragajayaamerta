/*
  # Add payment_terms_days column to transactions table

  1. Changes
    - Add `payment_terms_days` column to `transactions` table
      - Type: integer (nullable)
      - Stores the number of days for payment terms
      - NULL means no specific payment term
  
  2. Notes
    - This column will be used to calculate due dates on invoices
    - Examples: 14, 30, 60 days
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_terms_days'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_terms_days integer;
  END IF;
END $$;