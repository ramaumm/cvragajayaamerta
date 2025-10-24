/*
  # Fix Product Deletion Foreign Key Constraint

  1. Changes
    - Drop existing foreign key constraint on transaction_items.product_id
    - Add new foreign key constraint with ON DELETE SET NULL
    - Add deleted_at column to products for soft delete
    
  2. Reasoning
    - We want to keep historical transaction data even if product is deleted
    - Use soft delete approach: mark products as deleted instead of removing them
    - If hard delete is needed, set product_id to NULL in transaction_items
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transaction_items_product_id_fkey'
    AND table_name = 'transaction_items'
  ) THEN
    ALTER TABLE transaction_items DROP CONSTRAINT transaction_items_product_id_fkey;
  END IF;

  ALTER TABLE transaction_items
    ADD CONSTRAINT transaction_items_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE SET NULL;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE products ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;