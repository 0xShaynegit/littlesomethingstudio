-- Seeds the 28 Sep to 4 Oct 2026 weekly schedule: instructors, sessions,
-- and the two admin accounts. Idempotent: guarded by WHERE NOT EXISTS on
-- email (users) and on title_en + start_time (listings).
-- Run with: npx wrangler d1 execute tls-bookings --file=./weekly-schedule-seed.sql
-- then repeat with --remote

-- Instructors (facilitators)
INSERT INTO users (name, email, role, status)
SELECT 'Shukki', 'shukki@thelittlesomethingstudio.com', 'facilitator', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'shukki@thelittlesomethingstudio.com');

INSERT INTO users (name, email, role, status)
SELECT 'Monika', 'monika@thelittlesomethingstudio.com', 'facilitator', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'monika@thelittlesomethingstudio.com');

INSERT INTO users (name, email, role, status)
SELECT 'Ice', 'ice@thelittlesomethingstudio.com', 'facilitator', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ice@thelittlesomethingstudio.com');

INSERT INTO users (name, email, role, status)
SELECT 'Ong', 'ong@thelittlesomethingstudio.com', 'facilitator', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ong@thelittlesomethingstudio.com');

INSERT INTO users (name, email, role, status)
SELECT 'Alex', 'alex@thelittlesomethingstudio.com', 'facilitator', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'alex@thelittlesomethingstudio.com');

INSERT INTO users (name, email, role, status)
SELECT 'Ley', 'ley@thelittlesomethingstudio.com', 'facilitator', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ley@thelittlesomethingstudio.com');

INSERT INTO users (name, email, role, status)
SELECT 'Jori', 'jori@thelittlesomethingstudio.com', 'facilitator', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jori@thelittlesomethingstudio.com');

-- Admins (also instructors, see session_instructors below)
INSERT INTO users (name, email, role, status)
SELECT 'Aae', 'aae@thelittlesomethingstudio.com', 'admin', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'aae@thelittlesomethingstudio.com');

INSERT INTO users (name, email, role, status)
SELECT 'Anthony', 'anthony@thelittlesomethingstudio.com', 'admin', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'anthony@thelittlesomethingstudio.com');

-- Sessions

INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, status, session_status)
SELECT (SELECT id FROM users WHERE email = 'shukki@thelittlesomethingstudio.com'),
  'BollyX', 'dance', '2026-09-28 07:30:00', '2026-09-28 08:30:00', 'approved', 'class_coming_soon'
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title_en = 'BollyX' AND start_time = '2026-09-28 07:30:00');

INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, status, session_status)
SELECT (SELECT id FROM users WHERE email = 'ice@thelittlesomethingstudio.com'),
  'Contact Improv Class', 'movement-lab', '2026-09-30 11:00:00', '2026-09-30 13:00:00', 'approved', 'class_walkin'
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title_en = 'Contact Improv Class' AND start_time = '2026-09-30 11:00:00');

INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, status, session_status)
SELECT (SELECT id FROM users WHERE email = 'ley@thelittlesomethingstudio.com'),
  'Capoeira', 'capoeira', '2026-09-30 17:00:00', '2026-09-30 18:30:00', 'approved', 'class_coming_soon'
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title_en = 'Capoeira' AND start_time = '2026-09-30 17:00:00');

INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, status, session_status)
SELECT (SELECT id FROM users WHERE email = 'anthony@thelittlesomethingstudio.com'),
  'Gentlemans Yoga', 'yoga', '2026-09-30 19:00:00', '2026-09-30 21:00:00', 'approved', 'class_coming_soon'
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title_en = 'Gentlemans Yoga' AND start_time = '2026-09-30 19:00:00');

INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, status, session_status)
SELECT (SELECT id FROM users WHERE email = 'shukki@thelittlesomethingstudio.com'),
  'BollyX', 'dance', '2026-10-01 07:30:00', '2026-10-01 08:30:00', 'approved', 'class_coming_soon'
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title_en = 'BollyX' AND start_time = '2026-10-01 07:30:00');

INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, status, session_status)
SELECT (SELECT id FROM users WHERE email = 'anthony@thelittlesomethingstudio.com'),
  'Private Booking', NULL, '2026-10-01 17:30:00', '2026-10-01 18:30:00', 'approved', 'private_booking'
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title_en = 'Private Booking' AND start_time = '2026-10-01 17:30:00');

INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, status, session_status)
SELECT (SELECT id FROM users WHERE email = 'aae@thelittlesomethingstudio.com'),
  'Sound Bath', 'sound-healing', '2026-10-02 19:00:00', '2026-10-02 20:00:00', 'approved', 'community_event'
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title_en = 'Sound Bath' AND start_time = '2026-10-02 19:00:00');

INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, status, session_status)
SELECT (SELECT id FROM users WHERE email = 'ice@thelittlesomethingstudio.com'),
  'Contact Improv Class + Jam', 'movement-lab', '2026-10-03 10:00:00', '2026-10-03 13:00:00', 'approved', 'class_walkin'
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title_en = 'Contact Improv Class + Jam' AND start_time = '2026-10-03 10:00:00');

INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, status, session_status)
SELECT (SELECT id FROM users WHERE email = 'jori@thelittlesomethingstudio.com'),
  'Interplay', 'movement-lab', '2026-10-04 12:00:00', '2026-10-04 14:00:00', 'approved', 'class_walkin'
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title_en = 'Interplay' AND start_time = '2026-10-04 12:00:00');

-- Extra instructors on the two Contact Improv sessions (Ice is already
-- primary facilitator_id; Ong and Alex are added here)
INSERT OR IGNORE INTO session_instructors (listing_id, user_id)
SELECT l.id, (SELECT id FROM users WHERE email = 'ong@thelittlesomethingstudio.com')
FROM listings l WHERE l.title_en = 'Contact Improv Class' AND l.start_time = '2026-09-30 11:00:00';

INSERT OR IGNORE INTO session_instructors (listing_id, user_id)
SELECT l.id, (SELECT id FROM users WHERE email = 'alex@thelittlesomethingstudio.com')
FROM listings l WHERE l.title_en = 'Contact Improv Class' AND l.start_time = '2026-09-30 11:00:00';

INSERT OR IGNORE INTO session_instructors (listing_id, user_id)
SELECT l.id, (SELECT id FROM users WHERE email = 'ong@thelittlesomethingstudio.com')
FROM listings l WHERE l.title_en = 'Contact Improv Class + Jam' AND l.start_time = '2026-10-03 10:00:00';

INSERT OR IGNORE INTO session_instructors (listing_id, user_id)
SELECT l.id, (SELECT id FROM users WHERE email = 'alex@thelittlesomethingstudio.com')
FROM listings l WHERE l.title_en = 'Contact Improv Class + Jam' AND l.start_time = '2026-10-03 10:00:00';

-- Studio update post
INSERT INTO studio_updates (title_en, title_th, body_en, body_th, published_at)
SELECT
  'The Ground Beneath Us',
  'พื้นที่อยู่ใต้เรา',
  'We started with the lights.
Then the paint on the walls.
The old floor came out.
And today... the new floor is going in.

There''s something about the word "ground" that I really connect with.

It''s our foundation.
Something beneath us that we don''t always notice, but it''s there, holding us as we stand, walk, move, dance, or simply sit still.

And somehow, it reminds me of us too.

No matter how much we change around us,
sometimes we need to come back to our own ground.
Back to our roots. 🌳

So today, seeing the new floor going into Little Something Studio feels a little more meaningful than just changing a floor. ❤️',
  'เราเริ่มจากเปลี่ยนไฟ
แล้วก็ทาสีผนัง
รื้อพื้นเก่าออก
วันนี้…พื้นใหม่กำลังมา

แอ้รู้สึกกับคำว่า "พื้น" เป็นพิเศษ

เพราะพื้นคือ ground
คือ foundation
คือสิ่งที่เราเหยียบอยู่ทุกวันโดยบางทีเราแทบไม่ได้สังเกตมันเลย

แต่ทุกครั้งที่เรายืน เดิน ขยับ เต้น หรือนั่งนิ่ง ๆ
มันคือสิ่งที่รองรับเราอยู่

เหมือนกับตัวเราเอง
ไม่ว่าเราจะเปลี่ยนอะไรไปแค่ไหน
สุดท้ายก็ยังต้องกลับมาหา ground ของตัวเอง
กลับมาหารากของเรา

วันนี้เลยรู้สึกดีและตื่นเต้นเป็นพิเศษที่ได้เห็น "พื้น" ของ Little Something Studio ค่อย ๆ เปลี่ยนไป ❤️',
  '2026-09-28'
WHERE NOT EXISTS (SELECT 1 FROM studio_updates WHERE title_en = 'The Ground Beneath Us' AND published_at = '2026-09-28');

-- Link Aae as instructor on her Sound Bath session
INSERT OR IGNORE INTO session_instructors (listing_id, user_id)
SELECT l.id, (SELECT id FROM users WHERE email = 'aae@thelittlesomethingstudio.com')
FROM listings l WHERE l.title_en = 'Sound Bath' AND l.start_time = '2026-10-02 19:00:00';
