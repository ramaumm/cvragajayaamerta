/*
  # Add Discount Columns to Products Table

  1. Changes
    - Add `base_price` column to store original price before discounts
    - Add `discount_tiers` column to store tiered discount configurations as JSON
  
  2. Details
    - `base_price`: Numeric column for storing the base price of products
    - `discount_tiers`: JSONB column for storing array of discount tier objects
    - Both columns have default values for existing records
*/

-- Add base_price column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'base_price'
  ) THEN
    ALTER TABLE products ADD COLUMN base_price numeric(10,2) DEFAULT 0;
    
    -- Update existing products to use current price as base_price
    UPDATE products SET base_price = price WHERE base_price = 0;
  END IF;
END $$;

-- Add discount_tiers column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'discount_tiers'
  ) THEN
    ALTER TABLE products ADD COLUMN discount_tiers jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
