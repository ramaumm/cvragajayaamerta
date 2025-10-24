/*
  # Add Transaction Status Field

  1. Changes
    - Add `status` column to `transactions` table with values: 'pending', 'completed', 'cancelled'
    - Default status is 'pending'
    - Add `reserved_stock` jsonb column to track reserved stock for each product

  2. Purpose
    - Track transaction lifecycle (pending -> completed/cancelled)
    - Reserve stock when items added to cart
    - Deduct stock only when transaction is completed
    - Restore stock when transaction is cancelled
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'status'
  ) THEN
    ALTER TABLE transactions ADD COLUMN status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'reserved_stock'
  ) THEN
    ALTER TABLE transactions ADD COLUMN reserved_stock jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;