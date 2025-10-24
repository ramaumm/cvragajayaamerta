/*
  # Add purchase price to products table

  1. Changes
    - Add `purchase_price` column to products table
    - This represents the cost price (harga beli) from supplier
    - Used to calculate profit margins
  
  2. Notes
    - Default value is 0
    - This is separate from `price` (selling price/harga jual)
    - Allows distributors to track cost vs selling price
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'purchase_price'
  ) THEN
    ALTER TABLE products ADD COLUMN purchase_price NUMERIC DEFAULT 0;
  END IF;
END $$;