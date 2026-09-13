-- Password reset tokens: admin-generated links, no email dependency yet.
-- Run with: npx wrangler d1 execute tls-bookings --file=./password-reset-migration.sql --remote

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
