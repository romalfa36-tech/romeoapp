-- =============================================================
-- Beeforce Management System - Notification Sync Database Migration
-- Run this in your Supabase SQL Editor
-- =============================================================

-- Add read_notifications column to store read notification IDs per user
ALTER TABLE users ADD COLUMN IF NOT EXISTS read_notifications TEXT[] DEFAULT '{}';

-- Add created_by_id column to keep track of who created each notification (prevents self-toasts)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by_id UUID REFERENCES users(id) ON DELETE SET NULL;
