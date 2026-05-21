-- =======================================================
-- Beeforce Management System - Shared Notifications Setup
-- Run this SQL in your Supabase SQL Editor
-- =======================================================

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow select/modify policies for everyone and authenticated users
DROP POLICY IF EXISTS "Notifications are viewable by everyone" ON notifications;
DROP POLICY IF EXISTS "Notifications can be modified by authenticated users" ON notifications;
CREATE POLICY "Notifications are viewable by everyone" ON notifications FOR SELECT USING (true);
CREATE POLICY "Notifications can be modified by authenticated users" ON notifications FOR ALL USING (true);

-- Enable Supabase Realtime Replication for Instant Synced Notifications
begin;
  -- Drop first if exists to prevent "already member of publication" error, then add safely
  alter publication supabase_realtime drop table if exists notifications;
  alter publication supabase_realtime add table notifications;
commit;
