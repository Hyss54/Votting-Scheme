# Database Setup Guide

This guide will help you set up the Supabase database for the Awards Voting System.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: Awards Voting System
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created

## 2. Get Project Credentials

1. Go to Project Settings → API
2. Copy the following values to your `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Public Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Run SQL Migrations

Go to SQL Editor in your Supabase dashboard and run the following SQL commands:

### Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'voter', 'nominee')),
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  vote_price DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'ended')) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Positions table
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nominees table
CREATE TABLE nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, position_id, name)
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('paystack', 'mtn_momo', 'hubtel')),
  transaction_reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_id UUID REFERENCES users(id),
  nominee_id UUID REFERENCES nominees(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_nominees_event ON nominees(event_id);
CREATE INDEX idx_nominees_position ON nominees(position_id);
CREATE INDEX idx_votes_nominee ON votes(nominee_id);
CREATE INDEX idx_votes_voter ON votes(voter_id);
CREATE INDEX idx_votes_event ON votes(event_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_user ON payments(user_id);
```

### Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Everyone can view active events" ON events
  FOR SELECT USING (status = 'active' OR auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

CREATE POLICY "Only admins can insert events" ON events
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

CREATE POLICY "Only admins can update events" ON events
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

CREATE POLICY "Only admins can delete events" ON events
  FOR DELETE USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

-- Positions policies
CREATE POLICY "Everyone can view positions" ON positions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage positions" ON positions
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

-- Nominees policies
CREATE POLICY "Everyone can view nominees" ON nominees
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage nominees" ON nominees
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

CREATE POLICY "Service role can manage payments" ON payments
  FOR ALL USING (true);

-- Votes policies
CREATE POLICY "Users can view own votes" ON votes
  FOR SELECT USING (auth.uid() = voter_id OR auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

CREATE POLICY "Authenticated users can insert votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Admins can view all votes" ON votes
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));
```

### Create Functions and Triggers

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nominees_updated_at BEFORE UPDATE ON nominees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4. Seed Data (Optional)

For testing, you can add sample data:

```sql
-- Create admin user (first register via the app, then update role)
-- After registering at /register, run:
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- Create sample event
INSERT INTO events (name, description, vote_price, start_date, end_date, status)
VALUES (
  'Excellence Awards 2024',
  'Annual awards celebrating outstanding achievements',
  5.00,
  NOW(),
  NOW() + INTERVAL '30 days',
  'active'
);

-- Get the event ID and create positions
INSERT INTO positions (name, event_id, display_order)
VALUES
  ('Best Artist', (SELECT id FROM events LIMIT 1), 1),
  ('Best Actor', (SELECT id FROM events LIMIT 1), 2),
  ('Best Director', (SELECT id FROM events LIMIT 1), 3);

-- Add sample nominees
INSERT INTO nominees (name, bio, event_id, position_id)
VALUES
  (
    'John Doe',
    'Talented artist with 10 years experience',
    (SELECT id FROM events LIMIT 1),
    (SELECT id FROM positions WHERE name = 'Best Artist' LIMIT 1)
  ),
  (
    'Jane Smith',
    'Award-winning performer',
    (SELECT id FROM events LIMIT 1),
    (SELECT id FROM positions WHERE name = 'Best Artist' LIMIT 1)
  );
```

## 5. Enable Realtime

1. Go to Database → Replication
2. Enable replication for the following tables:
   - `votes`
   - `events`
   - `nominees`
   - `payments`

## 6. Configure Storage (Optional)

If you want to support nominee image uploads:

1. Go to Storage
2. Create a bucket named `nominee-images`
3. Set bucket to public
4. Add RLS policies:

```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'nominee-images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'nominee-images' AND
    auth.role() = 'authenticated'
  );
```

## 7. Verify Setup

Run these queries to verify your setup:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Verify indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public';
```

## Backup and Restore

### Create Backup

```bash
# From Supabase dashboard: Database → Backups
# Or use pg_dump
pg_dump -h db.xxxxx.supabase.co -U postgres database_name > backup.sql
```

### Restore Backup

```bash
psql -h db.xxxxx.supabase.co -U postgres database_name < backup.sql
```

## Troubleshooting

### RLS Blocking Queries

If queries are being blocked:
1. Check RLS policies are set correctly
2. Verify user is authenticated
3. Check user role in `users` table
4. Temporarily disable RLS for debugging (NOT in production):

```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Connection Issues

- Verify Supabase URL and keys are correct
- Check project is not paused
- Ensure network allows connections to Supabase

### Performance Issues

- Add more indexes as needed
- Use `EXPLAIN ANALYZE` to check query performance
- Consider materialized views for complex reports

## Migration Strategy

For future schema changes:

1. Create migration file in `supabase/migrations/`
2. Test in development
3. Apply to production via Supabase CLI or dashboard
4. Document changes in this file

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
