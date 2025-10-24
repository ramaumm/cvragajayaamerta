/*
  # Add stock entries support to products table

  1. Changes
    - Add `stock_entries` JSONB column to products table to store multiple stock entries
    - Each stock entry contains unit and quantity
    - This allows products to have multiple stock levels for different units

  2. Notes
    - Existing `stock`, `stock_unit`, and `stock_unit_quantity` columns are kept for backward compatibility
    - New `stock_entries` field will be the primary way to manage stock going forward
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_entries'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_entries JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;