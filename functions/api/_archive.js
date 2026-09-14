// Moves listings (and their bookings) whose end_time has passed into the
// archive tables, so live queries never have to filter old events out.
// Cheap to call on every read: the WHERE clause is empty once nothing new
// has aged out since the last call.
export async function archivePastListings(env) {
  const { results: expired } = await env.DB
    .prepare("SELECT id FROM listings WHERE end_time < datetime('now')")
    .all();

  if (expired.length === 0) return;

  const ids = expired.map(row => row.id);
  const placeholders = ids.map(() => '?').join(',');

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO bookings_archive (id, listing_id, attendee_name, attendee_phone, attendee_line, payment_method, payment_status, confirmed_by, created_at)
      SELECT id, listing_id, attendee_name, attendee_phone, attendee_line, payment_method, payment_status, confirmed_by, created_at
      FROM bookings WHERE listing_id IN (${placeholders})
    `).bind(...ids),
    env.DB.prepare(`
      INSERT INTO listings_archive (id, facilitator_id, space_id, title_en, title_th, description_en, description_th, category, start_time, end_time, price, capacity, status, photo_key, created_at)
      SELECT id, facilitator_id, space_id, title_en, title_th, description_en, description_th, category, start_time, end_time, price, capacity, status, photo_key, created_at
      FROM listings WHERE id IN (${placeholders})
    `).bind(...ids),
    env.DB.prepare(`DELETE FROM bookings WHERE listing_id IN (${placeholders})`).bind(...ids),
    env.DB.prepare(`DELETE FROM listings WHERE id IN (${placeholders})`).bind(...ids),
  ]);
}
