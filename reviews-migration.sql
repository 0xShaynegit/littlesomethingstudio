-- Reviews shown on the main page. No author name required (public reviews
-- often arrive without one attached).
-- Run with: npx wrangler d1 execute tls-bookings --file=./reviews-migration.sql
-- then repeat with --remote

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT,
  body TEXT NOT NULL,
  published_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO reviews (author_name, body, published_at)
SELECT 'Michel',
  'Wow! This was my first sound bath and I was impressed at how quickly I connected to that inner vibration and awareness of the inside that usually takes longer to reach during sitting meditation. A "Little Something" that reenergised me!',
  '2026-08-15'
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE body = 'Wow! This was my first sound bath and I was impressed at how quickly I connected to that inner vibration and awareness of the inside that usually takes longer to reach during sitting meditation. A "Little Something" that reenergised me!');

INSERT INTO reviews (author_name, body, published_at)
SELECT 'Jori',
  'There is nothing more satisfying than having a sound bath experience so close to home! This community space is so needed in the Mae Hia/Hang Dong area!! Thank you for creating this beautiful space for us!!! Big love and appreciation!',
  '2026-08-15'
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE body = 'There is nothing more satisfying than having a sound bath experience so close to home! This community space is so needed in the Mae Hia/Hang Dong area!! Thank you for creating this beautiful space for us!!! Big love and appreciation!');
