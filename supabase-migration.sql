-- ============================================
-- Medical Equipment Sales System Database Schema
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk membuat semua tabel dan konfigurasi yang diperlukan
-- ============================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT '',
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  sku text UNIQUE,
  base_price numeric(10,2) DEFAULT 0,
  discount_tiers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add columns to existing products table (if already created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'base_price'
  ) THEN
    ALTER TABLE products ADD COLUMN base_price numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'discount_tiers'
  ) THEN
    ALTER TABLE products ADD COLUMN discount_tiers jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text DEFAULT '',
  customer_address text DEFAULT '',
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_number ON transactions(transaction_number);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table
CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for transactions table
CREATE POLICY "Authenticated users can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for transaction_items table
CREATE POLICY "Authenticated users can view all transaction items"
  ON transaction_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transaction items"
  ON transaction_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transaction items"
  ON transaction_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transaction items"
  ON transaction_items FOR DELETE
  TO authenticated
  USING (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert dummy data produk alat kesehatan
INSERT INTO products (name, category, description, price, stock, sku) VALUES
('Tensimeter Digital', 'Alat Diagnostik', 'Tensimeter digital otomatis dengan layar LCD besar', 450000, 25, 'MED-TEN-001'),
('Thermometer Infrared', 'Alat Diagnostik', 'Thermometer non-kontak infrared akurat', 350000, 40, 'MED-THR-001'),
('Stetoskop Littmann', 'Alat Diagnostik', 'Stetoskop premium untuk pemeriksaan jantung dan paru', 1200000, 15, 'MED-STE-001'),
('Nebulizer Portable', 'Alat Terapi', 'Nebulizer portabel untuk terapi pernapasan', 800000, 20, 'MED-NEB-001'),
('Pulse Oximeter', 'Alat Diagnostik', 'Alat ukur saturasi oksigen dan detak jantung', 250000, 50, 'MED-PUL-001'),
('Timbangan Bayi Digital', 'Alat Ukur', 'Timbangan digital khusus bayi dengan akurasi tinggi', 650000, 12, 'MED-TIM-001'),
('Kursi Roda Lipat', 'Alat Bantu', 'Kursi roda lipat aluminium ringan', 1500000, 8, 'MED-KUR-001'),
('Tongkat Kruk Aluminium', 'Alat Bantu', 'Tongkat kruk aluminium adjustable', 200000, 30, 'MED-TON-001'),
('Masker N95', 'APD', 'Masker pelindung standar N95', 15000, 500, 'MED-MAS-001'),
('Sarung Tangan Lateks', 'APD', 'Sarung tangan lateks steril per box (100 pcs)', 85000, 100, 'MED-SAR-001'),
('Alkohol 70%', 'Antiseptik', 'Alkohol antiseptik 70% 1 liter', 50000, 80, 'MED-ALK-001'),
('Perban Elastis', 'Perawatan Luka', 'Perban elastis 10cm x 4.5m', 25000, 150, 'MED-PER-001'),
('Plester Luka', 'Perawatan Luka', 'Plester luka hipoalergenik berbagai ukuran', 35000, 120, 'MED-PLE-001'),
('Kasa Steril', 'Perawatan Luka', 'Kasa steril 10x10cm per pack (10 pcs)', 20000, 200, 'MED-KAS-001'),
('Infus Set', 'Alat Medis', 'Infus set disposable steril', 15000, 250, 'MED-INF-001')
ON CONFLICT (sku) DO NOTHING;

-- Setup Storage Bucket untuk gambar produk
-- Jalankan ini setelah tabel dibuat
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy untuk storage bucket
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
