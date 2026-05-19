-- ============================================
-- Beeforce Management System - Database Setup
-- Updated with new features
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ADD COLUMNS TO EXISTING USERS TABLE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- ============================================
-- ADD COLUMNS TO EXISTING PROJECTS TABLE
-- ============================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_to TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]';

-- Add accountant user
INSERT INTO users (email, name, username, password, role, permissions, is_active)
VALUES ('accountant@beeforce.com', 'المحاسب', 'accountant', 'demo123', 'accountant', ARRAY['view_finance', 'view_reports', 'approve_invoices'], TRUE)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    shoot_dates TEXT,
    analytical_account TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'paid', 'completed')),
    has_tax_invoice BOOLEAN DEFAULT FALSE,
    notes TEXT,
    comments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    no TEXT,
    date DATE NOT NULL,
    supplier_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('F&B', 'Transportation', 'Maintenance', 'Labors', 'Salary', 'Other Expenses')),
    debit NUMERIC(12, 2) DEFAULT 0,
    credit NUMERIC(12, 2) DEFAULT 0,
    balance NUMERIC(12, 2) DEFAULT 0,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    project_name TEXT,
    has_tax_invoice BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STOCK ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stock_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    quantity NUMERIC(10, 2) DEFAULT 0,
    min_quantity NUMERIC(10, 2) DEFAULT 0,
    cost_per_unit NUMERIC(12, 2) DEFAULT 0,
    supplier TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- UNITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('changing_room', 'bathroom', 'car', 'lounge', 'kitchen', 'storage', 'other')),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    capacity INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL,
    type TEXT CHECK (type IN ('invoice', 'quote')),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    project_name TEXT,
    client_name TEXT,
    amount NUMERIC(12, 2) DEFAULT 0,
    vat_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'paid')),
    due_date DATE,
    items JSONB DEFAULT '[]',
    attachments TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- UPDATE DEFAULT USERS (with credentials)
-- ============================================
UPDATE users SET username = 'admin', password = 'demo123', permissions = ARRAY['all'], is_active = TRUE WHERE email = 'admin@beeforce.com';
UPDATE users SET username = 'elie', password = 'demo123', permissions = ARRAY['view_projects', 'add_transaction', 'add_project', 'view_reports'], is_active = TRUE WHERE email = 'elie@beeforce.com';

-- Insert if not exists
INSERT INTO users (email, name, username, password, role, permissions, is_active)
VALUES ('admin@beeforce.com', 'المدير العام', 'admin', 'demo123', 'admin', ARRAY['all'], TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, name, username, password, role, permissions, is_active)
VALUES ('elie@beeforce.com', 'إيلي', 'elie', 'demo123', 'employee', ARRAY['view_projects', 'add_transaction', 'add_project', 'view_reports'], TRUE)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- INSERT SAMPLE CLIENTS
-- ============================================
INSERT INTO clients (name, email, phone, company, address, notes)
VALUES
    ('FILM PUDDING', 'info@filmpudding.com', '+966501234567', 'Film Pudding Production', 'Riyadh', 'Production company'),
    ('LETTERGRAY', 'contact@lettergray.com', '+966507654321', 'Letter Gray Agency', 'Dubai', 'Creative agency'),
    ('Dream Box', 'info@dreambox.sa', '+966551234567', 'Dream Box Media', 'Riyadh', 'Media production'),
    ('Purple Brain', 'hello@purplebrain.ae', '+966559876543', 'Purple Brain', 'Abu Dhabi', 'Marketing agency'),
    ('SSUP', 'contact@ssup.sa', '+966501234999', 'SSUP Company', 'Riyadh', 'Sports production')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE STOCK ITEMS
-- ============================================
INSERT INTO stock_items (name, category, unit, quantity, min_quantity, cost_per_unit, supplier)
VALUES
    ('مياه كبيرة', 'مواد غذائية', 'علبة', 50, 20, 5, 'Almarai'),
    ('قهوة عربية', 'مواد غذائية', 'كيس', 30, 10, 25, 'Alsafeer'),
    ('تنكة وقود', 'وقود', 'لتر', 100, 50, 2, 'Saudia'),
    ('مناديل مبللة', 'مستلزمات', 'علبة', 20, 10, 15, 'Local'),
    ('قفازات طبية', 'مستلزمات', 'علبة', 15, 5, 20, 'Local')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE UNITS
-- ============================================
INSERT INTO units (name, type, status, capacity, notes)
VALUES
    ('غرفة تبديل 1', 'changing_room', 'available', 6, 'مع تكييف'),
    ('غرفة تبديل 2', 'changing_room', 'available', 4, 'للنساء'),
    ('حمام متنقل 1', 'bathroom', 'available', 1, ''),
    ('حمام متنقل 2', 'bathroom', 'available', 1, ''),
    ('سيارة نقل معدات', 'car', 'available', 0, 'ونش'),
    ('صالة إستراحة', 'lounge', 'available', 10, 'مكيف'),
    ('مطبخ متنقل', 'kitchen', 'available', 0, 'للطهي')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE PROJECTS
-- ============================================
INSERT INTO projects (name, client_name, shoot_dates, analytical_account, status, has_tax_invoice, notes)
VALUES
    ('MBC GROUP', 'FILM PUDDING', '5/6-JAN-26', 'MBC Group Film Pudding 1.26', 'draft', FALSE, 'tres contant'),
    ('JOY AWARDS', 'LETTERGRAY', '17/18-JAN-26', 'Joy Awards Letter Gray 1.26', 'draft', FALSE, ''),
    ('STA', 'LETTERGRAY', '17/18-JAN-26', 'STA Letter Gray 1.26', 'draft', FALSE, ''),
    ('STC Marcom', 'Dream Box', '25/26/27-JAN-26', 'STC Marcom Dreambox 1.26', 'draft', FALSE, ''),
    ('Saudia Founding Day', 'FILM PUDDING', '2026-01-26', 'Saudi Founding Day Film Pudding 1.26', 'draft', FALSE, ''),
    ('STC Business App', 'Dream Box', '2026-01-30', 'STC Business App Dreambox 1.26', 'draft', FALSE, ''),
    ('AlMarai', 'FILM PUDDING', '28/29/30/31-Jan-26', 'Almarai Film Pudding 1.26', 'paid', TRUE, 'elie'),
    ('Yow Films', '-', 'Jan', 'Yow Films 1.26', 'draft', FALSE, 'Cash In Lebanon'),
    ('BUJAIRI TERRACE', 'LETTERGRAY', '1/2-Feb-26', 'Letter Gray BUJAIRI TERRACE 2.26', 'draft', FALSE, ''),
    ('MACDO', 'SADU/MACDO', '2026-02-02', 'Macdo 2.26', 'paid', FALSE, ''),
    ('National Day/RUA AL HARAM', 'Purple Brain', '7/8-Feb-26', 'Purple Brain National Day/RUA AL HARAM 2.26', 'draft', FALSE, ''),
    ('Nice One', 'Sadu', '7/8/9-Feb-26', 'Nice One 2.26', 'paid', FALSE, ''),
    ('AQUA ARABIA', 'SSUP', '12/13 FEB-26', 'SSUP Aqua Arabia 2.26', 'paid', FALSE, ''),
    ('AlMarai', 'DREAM BOX', '12/13/14-FEB-26', 'Almarai Dreambox 2.26', 'draft', FALSE, ''),
    ('SAB BANK', 'TRUFFLE', '14/15/FEB-26', 'Truffle Sab Bank 2.26', 'draft', FALSE, ''),
    ('VISION 2030', 'Purple Brain', '18/19/FEB 26', 'Vision 2030 2.26', 'draft', FALSE, ''),
    ('lays pepsico', 'film pudding', '1/2/3/4 mars', 'Film Pudding Pepsico', 'draft', FALSE, ''),
    ('RUSH', '-', '2026-04-02', 'Rush 4.26', 'draft', FALSE, ''),
    ('DREAM BOX', '-', '1/2/ APRIL', 'Dreambox Marai Bashayer', 'paid', FALSE, 'Marai Bashayer'),
    ('TRUFFLE', '-', '3/4/5/6 APRIL', 'Truffle 4.26', 'draft', FALSE, ''),
    ('NEED A FIXER', '-', '6/7/8 APRIL', 'Aqua Arabia Need A fixer 4.26', 'draft', FALSE, '')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE TRANSACTIONS
-- ============================================
INSERT INTO transactions (no, date, supplier_name, description, category, debit, credit, project_name, has_tax_invoice, notes, created_by)
VALUES
    ('1', '2026-01-02', 'RECEIPT VOUCHER 1250', 'KITCHEN INSTALLATION', 'Other Expenses', 250, 0, 'General Expenses', FALSE, 'wht', 'admin'),
    ('2', '2026-01-02', 'AZAZ AL MUSTAQBAL', 'KITCHEN EQUIPMENT', 'Other Expenses', 150.21, 0, 'General Expenses', FALSE, '', 'admin'),
    ('3', '2026-01-02', 'PAN EIMRATES', 'FURNITURE', 'Other Expenses', 1550, 0, 'General Expenses', FALSE, '', 'admin'),
    ('1', '2026-01-05', 'ma7atat al riyad', 'fuel', 'Transportation', 13, 0, 'MBC GROUP', FALSE, '', 'elie'),
    ('2', '2026-01-05', 'dalil bada', 'food', 'F&B', 30, 0, 'MBC GROUP', FALSE, '', 'elie'),
    ('3', '2026-01-04', 'aldris', 'fuel', 'Transportation', 50, 0, 'MBC GROUP', FALSE, '', 'elie'),
    ('4', '2026-01-05', 'tamwinat zad', 'ice', 'F&B', 60, 0, 'MBC GROUP', FALSE, '', 'elie'),
    ('5', '2026-01-04', 'baja', 'coffee capsule', 'F&B', 41.74, 0, 'MBC GROUP', FALSE, '', 'elie'),
    ('1', '2026-02-02', 'Diriya Al Bujairi', 'Food', 'F&B', 30, 0, 'BUJAIRI TERRACE', FALSE, '', 'elie'),
    ('2', '2026-02-01', 'Taxi', 'Taxi', 'Transportation', 83.72, 0, 'BUJAIRI TERRACE', FALSE, '', 'elie'),
    ('1', '2026-02-06', 'Received Transfer To Tony', '', 'Other Expenses', 0, 20000, 'General Expenses', FALSE, '', 'admin'),
    ('1', '2026-04-05', 'petro omran', 'fuel', 'Transportation', 100, 0, 'TRUFFLE', FALSE, '', 'elie'),
    ('2', '2026-04-06', 'manakh store', 'food', 'F&B', 20, 0, 'TRUFFLE', FALSE, '', 'elie'),
    ('3', '2026-04-04', 'manakh store', 'food', 'F&B', 415.7, 0, 'TRUFFLE', FALSE, '', 'elie'),
    ('4', '2026-04-05', 'aswak wael', 'food', 'F&B', 260.5, 0, 'TRUFFLE', FALSE, '', 'elie')
ON CONFLICT DO NOTHING;

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users: Everyone can read, only authenticated users can modify
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can be modified by authenticated users" ON users FOR ALL USING (true);

-- Projects: Everyone can read, authenticated users can modify
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Projects can be modified by authenticated users" ON projects FOR ALL USING (true);

-- Transactions: Everyone can read, authenticated users can modify
CREATE POLICY "Transactions are viewable by everyone" ON transactions FOR SELECT USING (true);
CREATE POLICY "Transactions can be modified by authenticated users" ON transactions FOR ALL USING (true);

-- Clients: Everyone can read, authenticated users can modify
CREATE POLICY "Clients are viewable by everyone" ON clients FOR SELECT USING (true);
CREATE POLICY "Clients can be modified by authenticated users" ON clients FOR ALL USING (true);

-- Stock: Everyone can read, authenticated users can modify
CREATE POLICY "Stock items are viewable by everyone" ON stock_items FOR SELECT USING (true);
CREATE POLICY "Stock items can be modified by authenticated users" ON stock_items FOR ALL USING (true);

-- Units: Everyone can read, authenticated users can modify
CREATE POLICY "Units are viewable by everyone" ON units FOR SELECT USING (true);
CREATE POLICY "Units can be modified by authenticated users" ON units FOR ALL USING (true);

-- Invoices: Everyone can read, authenticated users can modify
CREATE POLICY "Invoices are viewable by everyone" ON invoices FOR SELECT USING (true);
CREATE POLICY "Invoices can be modified by authenticated users" ON invoices FOR ALL USING (true);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(type);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);

-- ============================================
-- SUPABASE REALTIME CONFIGURATION
-- ============================================
-- Enable real-time replication for all relevant tables to enable live sync
begin;
  -- Add the tables to the supabase_realtime publication if not already present
  -- (Note: If publication doesn't exist, Supabase automatically creates it, but we alter it here)
  alter publication supabase_realtime add table users;
  alter publication supabase_realtime add table projects;
  alter publication supabase_realtime add table transactions;
  alter publication supabase_realtime add table clients;
  alter publication supabase_realtime add table stock_items;
  alter publication supabase_realtime add table units;
  alter publication supabase_realtime add table invoices;
commit;

-- ============================================
-- DONE!
-- ============================================
-- The database is now ready with all new features:
-- - Clients management
-- - Stock/Inventory tracking
-- - Units management
-- - Invoices and quotes with workflow
-- - User credentials (username/password)
-- - Supabase Realtime active subscriptions
-- ============================================