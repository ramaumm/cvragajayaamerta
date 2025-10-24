/*
  # Add Unit Fields to Products

  1. Changes to Products Table
    - Add `units` JSONB column to store available units with their quantities
      - Example: [{"name": "buah", "quantity": 1}, {"name": "box", "quantity": 50}, {"name": "karton", "quantity": 100}]
    - Add `stock_unit` text column to store the unit type for stock (e.g., "buah", "box", "karton")
    - Add `stock_unit_quantity` integer column to store quantity per stock unit (default 1)
    
  2. Notes
    - Uses JSONB for flexible unit storage
    - Stock calculations will be based on base unit (buah)
    - Backwards compatible with existing products (default to "buah" with quantity 1)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'units'
  ) THEN
    ALTER TABLE products ADD COLUMN units JSONB DEFAULT '[{"name": "buah", "quantity": 1}]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_unit'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_unit TEXT DEFAULT 'buah';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_unit_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_unit_quantity INTEGER DEFAULT 1;
  END IF;
END $$;