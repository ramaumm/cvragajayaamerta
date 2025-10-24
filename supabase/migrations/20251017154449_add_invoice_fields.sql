/*
  # Add Invoice Fields

  1. Changes to transactions table
    - Add `shipping_address` (text) - Alamat kirim
    - Add `payment_term` (text) - Term of payment
    - Add `payment_method` (text) - Metode pembayaran (default: Bank Transfer)
    
  2. Changes to transaction_items table
    - Add `unit` (text) - Satuan (box/buah/karton)
    - Add `discount_amount` (numeric) - Jumlah diskon per item
    - Add `discount_percent` (numeric) - Persentase diskon
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE transactions ADD COLUMN shipping_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_term'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_term text DEFAULT 'Cash';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_method text DEFAULT 'Bank Transfer';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transaction_items' AND column_name = 'unit'
  ) THEN
    ALTER TABLE transaction_items ADD COLUMN unit text DEFAULT 'buah';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transaction_items' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE transaction_items ADD COLUMN discount_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transaction_items' AND column_name = 'discount_percent'
  ) THEN
    ALTER TABLE transaction_items ADD COLUMN discount_percent numeric DEFAULT 0;
  END IF;
END $$;