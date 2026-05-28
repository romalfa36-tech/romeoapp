-- ==========================================================
-- Beeforce Storage Setup - Receipts Bucket and RLS Policies
-- PLEASE RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR
-- ==========================================================

-- 1. Create the receipts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy to allow anyone to read files from receipts bucket
DROP POLICY IF EXISTS "Public Access Receipts" ON storage.objects;
CREATE POLICY "Public Access Receipts" ON storage.objects
    FOR SELECT USING (bucket_id = 'receipts');

-- 3. Policy to allow uploads (insert) to receipts bucket
DROP POLICY IF EXISTS "Anyone can upload receipts" ON storage.objects;
CREATE POLICY "Anyone can upload receipts" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'receipts');

-- 4. Policy to allow deletes in receipts bucket
DROP POLICY IF EXISTS "Anyone can delete receipts" ON storage.objects;
CREATE POLICY "Anyone can delete receipts" ON storage.objects
    FOR DELETE USING (bucket_id = 'receipts');
