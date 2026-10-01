-- Adds a photo to Studio Updates posts.
-- Run with: npx wrangler d1 execute tls-bookings --file=./studio-updates-photo-migration.sql
-- then repeat with --remote

ALTER TABLE studio_updates ADD COLUMN photo_path TEXT;
