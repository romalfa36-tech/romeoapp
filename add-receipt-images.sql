-- Add receipt_images column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_images TEXT[] DEFAULT '{}';
