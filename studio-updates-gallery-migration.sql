-- Adds extra photos and an event link to Studio Updates posts.
-- extra_photos: JSON array of {src, alt, w, h}. listing_id: the event the post is about.
-- Run with: npx wrangler d1 execute tls-bookings --file=./studio-updates-gallery-migration.sql
-- then repeat with --remote

ALTER TABLE studio_updates ADD COLUMN extra_photos TEXT;
ALTER TABLE studio_updates ADD COLUMN listing_id INTEGER REFERENCES listings(id);
