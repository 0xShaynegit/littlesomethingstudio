-- Weekly schedule migration: session status badges, multi-instructor
-- support, and the Studio Updates post table.
-- Run with: npx wrangler d1 execute tls-bookings --file=./weekly-schedule-migration.sql
-- then repeat with --remote

ALTER TABLE listings ADD COLUMN session_status TEXT
  CHECK (session_status IN ('event', 'class_walkin', 'class_coming_soon', 'private_booking', 'community_event', 'open_slot'));

CREATE TABLE IF NOT EXISTS session_instructors (
  listing_id INTEGER NOT NULL REFERENCES listings(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (listing_id, user_id)
);

CREATE TABLE IF NOT EXISTS studio_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_en TEXT NOT NULL,
  title_th TEXT,
  body_en TEXT NOT NULL,
  body_th TEXT NOT NULL,
  published_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
