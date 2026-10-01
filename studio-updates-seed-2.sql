-- Adds 3 more Studio Updates posts and a photo on the existing floor post.
-- Idempotent: guarded by WHERE NOT EXISTS on title_en + published_at.
-- Run with: npx wrangler d1 execute tls-bookings --file=./studio-updates-seed-2.sql
-- then repeat with --remote

UPDATE studio_updates SET photo_path = 'images/updates/thelittlesomethingstudio-the-little-something-studio-new-wooden-floor-finished-1600w.webp'
WHERE title_en = 'The Ground Beneath Us' AND published_at = '2026-09-28' AND photo_path IS NULL;

INSERT INTO studio_updates (title_en, title_th, body_en, body_th, published_at, photo_path)
SELECT
  'The Curtains Are Here',
  'ม่านมาแล้ว',
  'I''ve been really looking forward to today... the curtains are finally here! 🤎

Close for privacy.
Open for natural light.
Cover the mirrors when we don''t need our reflection, and open them again when we do.
They also help soften the sound in the room.

Almost there... I''ll show you again when everything is finished!',
  'วันนี้ตื่นเต้นเป็นพิเศษ เพราะรอวันนี้มานาน…
ม่านมาแล้ว
อีกหนึ่งขั้นตอนที่ใกล้จะเสร็จแล้ว

ปิด ได้เมื่อต้องการความเป็นส่วนตัว
เปิด รับแสงธรรมชาติได้เมื่อต้องการ
บัง เงาของเราในกระจก แล้วเปิดออกเมื่อต้องการใช้กระจก
และยังช่วย ซับเสียง ให้ห้องนุ่มขึ้นอีกนิด

ปิด • เปิด • บัง • ซับเสียง
ทำให้เราเลือกได้ว่า ในแต่ละช่วงเวลาอยากให้พื้นที่เป็นแบบไหน

เดี๋ยวไว้ติดเสร็จแล้ว มาโชว์กันอีกที 😊',
  '2026-09-29',
  'images/updates/thelittlesomethingstudio-the-little-something-studio-curtains-delivered-1600w.webp'
WHERE NOT EXISTS (SELECT 1 FROM studio_updates WHERE title_en = 'The Curtains Are Here' AND published_at = '2026-09-29');

INSERT INTO studio_updates (title_en, title_th, body_en, body_th, published_at, photo_path)
SELECT
  'Free Tibetan Sound Bowl Session',
  'Free Tibetan Sound Bowl Session',
  'Happening this evening! ✨

Aae & Ploy are trying something new, and we''d love to invite you to experience it with us.
Join us for a FREE Tibetan Sound Bowl Session 🔔

Come as you are, get comfortable, slow down, and enjoy the sounds together.

🕕 Today at 6:00 PM
📍 The Little Something Studio, Mali Place, Mae Hia
✨ Free session

If you''re free this evening, come and join us. 🤍
A warm place for all.',
  'เสิร์ฟร้อน ๆ เย็นนี้เลยค่ะ ✨

เราสองคน อยากชวนทุกคนมาลองไปด้วยกัน
Free Tibetan Sound Bowl Session

มานั่งๆ นอนๆ สบาย ๆ ผ่อนคลาย และรับฟังเสียงจากขันทิเบตไปด้วยกันกับ แอ้ & พลอย

🕕 วันนี้ เวลา 18:00 น.
📍 The Little Something Studio, Mali Place แม่เหียะ
✨ ฟรี ไม่มีค่าใช้จ่าย

ใครว่างเย็นนี้ แวะมาร่วมวงกันนะคะ 🤍',
  '2026-08-15',
  'images/updates/thelittlesomethingstudio-the-little-something-studio-sound-bath-session-1600w.webp'
WHERE NOT EXISTS (SELECT 1 FROM studio_updates WHERE title_en = 'Free Tibetan Sound Bowl Session' AND published_at = '2026-08-15');

INSERT INTO studio_updates (title_en, title_th, body_en, body_th, published_at, photo_path)
SELECT
  'Sound Healing With Ploy',
  'Sound Healing With Ploy',
  'It was wonderful to share the sounds of the Tibetan bowls with our community as I learn and develop my own skills as a facilitator.

Thank you to Ploy for joining me as we practice together.
Thank you to everyone who came and allowed me to practice.

Stay connected for more sound healing sessions coming soon. ✨',
  'เป็นความรู้สึกที่ดีมาก ที่ได้เชิญเสียงอันไพเราะของขันธิเบตที่สตูดิโอ แอ้เองก็กำลังเรียนรู้และพัฒนาทักษะในการเป็นผู้ดูแลการทำ Sound Healing ไปด้วย

ขอบคุณน้องพลอยมากๆ ที่มาร่วมกันในครั้งนี้ และก็ได้ฝึกฝนและเรียนรู้ไปด้วยกัน 🤍
ขอบคุณทุกท่านนะคะ ที่มาร่วมงานด่วน ที่แอ้คิดเลยทำเลย และเปิดโอกาสให้แอ้ได้ฝึกฝนและเรียนรู้ไปพร้อมกับทุกคน

ฝากติดตามกันไว้ แล้วพบกับ Sound Healing Sessions ครั้งต่อไปเร็ว ๆ นี้นะคะ ✨',
  '2026-08-16',
  'images/updates/thelittlesomethingstudio-the-little-something-studio-sound-healing-group-1600w.webp'
WHERE NOT EXISTS (SELECT 1 FROM studio_updates WHERE title_en = 'Sound Healing With Ploy' AND published_at = '2026-08-16');
