-- ==============================================================================
-- TEDxICEAS 2026 - COMPLETE UPDATED SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Copy and paste this script into your Supabase SQL Editor to set up or update
-- all required tables, columns, indexes, and initial settings.
-- ==============================================================================

-- 1. TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    category TEXT NOT NULL,
    ticket_count INTEGER DEFAULT 1,
    price_paid NUMERIC DEFAULT 0,
    screenshot_path TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    ticket_code TEXT UNIQUE,
    rejection_reason TEXT,
    clerk_user_id TEXT,
    group_id TEXT,
    usn TEXT,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    food_claimed BOOLEAN DEFAULT FALSE,
    food_claimed_at TIMESTAMPTZ,
    goodie_claimed BOOLEAN DEFAULT FALSE,
    goodie_claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all required columns exist (for safe migrations on existing databases)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='usn') THEN
        ALTER TABLE public.tickets ADD COLUMN usn TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='checked_in') THEN
        ALTER TABLE public.tickets ADD COLUMN checked_in BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='checked_in_at') THEN
        ALTER TABLE public.tickets ADD COLUMN checked_in_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='food_claimed') THEN
        ALTER TABLE public.tickets ADD COLUMN food_claimed BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='food_claimed_at') THEN
        ALTER TABLE public.tickets ADD COLUMN food_claimed_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='goodie_claimed') THEN
        ALTER TABLE public.tickets ADD COLUMN goodie_claimed BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='goodie_claimed_at') THEN
        ALTER TABLE public.tickets ADD COLUMN goodie_claimed_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='group_id') THEN
        ALTER TABLE public.tickets ADD COLUMN group_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='clerk_user_id') THEN
        ALTER TABLE public.tickets ADD COLUMN clerk_user_id TEXT;
    END IF;
END $$;


-- 2. PRE-AUTHORIZED USNS TABLE
CREATE TABLE IF NOT EXISTS public.authorized_usns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usn TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. EVENT SETTINGS TABLE (Dynamic Available Seat Capacity)
CREATE TABLE IF NOT EXISTS public.event_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default total seat capacity setting (100 seats) if not present
INSERT INTO public.event_settings (key, value, updated_at)
VALUES ('total_seats', '100', NOW())
ON CONFLICT (key) DO NOTHING;


-- 4. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_tickets_email ON public.tickets(email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_code ON public.tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_usn ON public.tickets(usn);
CREATE INDEX IF NOT EXISTS idx_tickets_clerk_user_id ON public.tickets(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_authorized_usns_usn ON public.authorized_usns(usn);


-- 5. STORAGE BUCKET SETUP (Payment Screenshots)
-- Create bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Grant public read access to payment screenshots bucket
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-screenshots');

-- Enable service role & authenticated users upload access
CREATE POLICY "Allow Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payment-screenshots');
