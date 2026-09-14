-- The Little Something Studio booking system schema
-- Run with: npx wrangler d1 execute tls-bookings --file=./schema.sql

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'facilitator')),
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved')),
  photo_key TEXT,
  line_id TEXT,
  promptpay_id TEXT,
  bio TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  hourly_rate REAL,
  capacity INTEGER,
  amenities TEXT
);

CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  facilitator_id INTEGER NOT NULL REFERENCES users(id),
  space_id INTEGER REFERENCES spaces(id),
  title_en TEXT NOT NULL,
  title_th TEXT,
  description_en TEXT,
  description_th TEXT,
  category TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  price REAL,
  capacity INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  photo_key TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL REFERENCES listings(id),
  attendee_name TEXT NOT NULL,
  attendee_phone TEXT,
  attendee_line TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'promptpay')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed')),
  confirmed_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS space_rentals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  facilitator_id INTEGER NOT NULL REFERENCES users(id),
  space_id INTEGER REFERENCES spaces(id),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  rental_status TEXT DEFAULT 'pending' CHECK (rental_status IN ('pending', 'approved', 'declined')),
  rental_fee REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings_archive (
  id INTEGER PRIMARY KEY,
  facilitator_id INTEGER NOT NULL,
  space_id INTEGER,
  title_en TEXT NOT NULL,
  title_th TEXT,
  description_en TEXT,
  description_th TEXT,
  category TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  price REAL,
  capacity INTEGER,
  status TEXT,
  photo_key TEXT,
  created_at TEXT,
  archived_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings_archive (
  id INTEGER PRIMARY KEY,
  listing_id INTEGER NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_phone TEXT,
  attendee_line TEXT,
  payment_method TEXT,
  payment_status TEXT,
  confirmed_by INTEGER,
  created_at TEXT,
  archived_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Seed the one physical space (guarded: schema.sql is re-run against
-- existing databases when new IF NOT EXISTS tables are added, and this
-- insert has no such guard of its own)
INSERT INTO spaces (name, hourly_rate, capacity, amenities)
SELECT 'The Little Something Studio - 3rd Floor', NULL, 20, 'Air-conditioned, wooden floor, mountain views, drinking water, toilets, parking'
WHERE NOT EXISTS (SELECT 1 FROM spaces);
