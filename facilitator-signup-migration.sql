-- Facilitator self-signup migration: adds approval status and photo storage
-- Run with: npx wrangler d1 execute tls-bookings --file=./facilitator-signup-migration.sql --remote

ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved'));
ALTER TABLE users ADD COLUMN photo_key TEXT;
ALTER TABLE listings ADD COLUMN photo_key TEXT;
