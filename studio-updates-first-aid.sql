-- Studio Updates post for the One-Day First Aid Course on 6 Oct 2026, linked to the listing.
-- Idempotent: guarded by WHERE NOT EXISTS on title_en + published_at.
-- Requires studio-updates-gallery-migration.sql first.
-- Run with: npx wrangler d1 execute tls-bookings --file=./studio-updates-first-aid.sql
-- then repeat with --remote

INSERT INTO studio_updates (title_en, title_th, body_en, body_th, published_at, photo_path, extra_photos, listing_id)
SELECT
  'One-Day Emergency Response First Aid Training',
  'อบรมปฐมพยาบาลฉุกเฉินหนึ่งวัน',
  'Would you know what to do when an emergency happens?
What if someone collapsed? Had a severe bleed? A burn? A break? Or needed an AED?

Join us on Tuesday 6 October for a one-day Emergency Response First Aid Training, designed to give you the skills, confidence and practical know-how to respond when it matters most.

You will learn Basic Life Support (BLS), including how to use an AED, as well as how to manage:
Severe bleeding
Burns
Breaks and injuries
Anaphylaxis
Diabetes-related emergencies
And other common emergency situations

The photos here are from a previous training we attended.

Certified training by ExpertCare Training Center
Certification valid for 2 years
The Little Something Studio, Mae Hia
9:00am to 4:00pm, snacks included
2,000 THB (the early bird price of 1,500 THB ended on 30 September)

Limited spaces available. Don''t wait until an emergency happens to wish you knew what to do.
Register: https://forms.gle/bUDEmYhsxvpP4Lx8A
Questions? Send us a message.',
  'รู้ไหมว่าต้องทำอย่างไรเมื่อเกิดเหตุฉุกเฉิน?
ถ้ามีคนล้มลง เลือดออกมาก ถูกไฟลวก กระดูกหัก หรือต้องใช้เครื่อง AED

มาร่วมอบรมปฐมพยาบาลฉุกเฉินหนึ่งวันกับเราในวันอังคารที่ 6 ตุลาคม เพื่อให้คุณมีทักษะ ความมั่นใจ และความรู้ที่นำไปใช้ได้จริงในวินาทีที่สำคัญที่สุด

คุณจะได้เรียนการช่วยชีวิตขั้นพื้นฐาน (BLS) รวมถึงวิธีใช้เครื่อง AED และการรับมือกับ
เลือดออกมาก
แผลไฟไหม้
กระดูกหักและการบาดเจ็บ
ภาวะแพ้รุนแรง (Anaphylaxis)
ภาวะฉุกเฉินที่เกี่ยวกับโรคเบาหวาน
และสถานการณ์ฉุกเฉินทั่วไปอื่น ๆ

ภาพในโพสต์นี้มาจากการอบรมครั้งก่อนที่เราเข้าร่วม

ผู้สอนที่ได้รับการรับรองจาก ExpertCare Training Center
ใบรับรองมีอายุ 2 ปี
The Little Something Studio แม่เหียะ
เวลา 9:00 ถึง 16:00 น. มีของว่างให้
2,000 บาท (ราคา Early Bird 1,500 บาท สิ้นสุดวันที่ 30 กันยายน)

จำนวนที่นั่งจำกัด อย่ารอให้เกิดเหตุฉุกเฉินแล้วค่อยนึกเสียใจที่ไม่รู้วิธีช่วย
ลงทะเบียน: https://forms.gle/bUDEmYhsxvpP4Lx8A
สอบถามเพิ่มเติมส่งข้อความหาเราได้เลย',
  '2026-10-01',
  'images/updates/thelittlesomethingstudio-the-little-something-studio-first-aid-cpr-practice-manikins-800w.webp',
  '[{"src":"images/updates/thelittlesomethingstudio-the-little-something-studio-first-aid-cpr-hand-placement-demo-800w.webp","alt":"The instructor kneeling to demonstrate CPR hand placement on a manikin beside a slide on correct hand placement.","w":800,"h":670},{"src":"images/updates/thelittlesomethingstudio-the-little-something-studio-first-aid-recovery-position-practice-800w.webp","alt":"The instructor supporting a volunteer lying on the floor while a participant watches.","w":800,"h":672},{"src":"images/updates/thelittlesomethingstudio-the-little-something-studio-first-aid-choking-demonstration-590w.webp","alt":"A participant clutching his throat in a choking demonstration while the instructor looks on.","w":590,"h":495},{"src":"images/updates/thelittlesomethingstudio-the-little-something-studio-first-aid-instructor-explaining-800w.webp","alt":"The ExpertCare first aid instructor explaining a point to the class, hands raised, in the studio.","w":800,"h":672}]',
  (SELECT id FROM listings WHERE title_en LIKE 'One-Day First Aid Course%' AND start_time = '2026-10-06 09:00:00')
WHERE NOT EXISTS (SELECT 1 FROM studio_updates WHERE title_en = 'One-Day Emergency Response First Aid Training' AND published_at = '2026-10-01');
