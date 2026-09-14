// POST /api/bookings
export async function onRequestPost(context) {
  const { env, request } = context;
  const body = await request.json();
  const { listing_id, attendee_name, attendee_phone, attendee_line, payment_method } = body;

  if (!listing_id || !attendee_name || !payment_method) {
    return Response.json(
      { error: 'listing_id, attendee_name, and payment_method are required' },
      { status: 400 }
    );
  }

  if (!['cash', 'promptpay'].includes(payment_method)) {
    return Response.json({ error: 'payment_method must be cash or promptpay' }, { status: 400 });
  }

  const listing = await env.DB
    .prepare("SELECT id, capacity FROM listings WHERE id = ? AND status = 'approved' AND end_time > datetime('now', '+7 hours')")
    .bind(listing_id)
    .first();

  if (!listing) {
    return Response.json({ error: 'Listing not found, not approved, or already finished' }, { status: 404 });
  }

  // Capacity check and insert in one statement so two simultaneous bookings
  // cannot both pass a separate count-then-insert check.
  const result = await env.DB
    .prepare(`
      INSERT INTO bookings (listing_id, attendee_name, attendee_phone, attendee_line, payment_method, payment_status)
      SELECT ?, ?, ?, ?, ?, 'pending'
      WHERE ? IS NULL OR (SELECT COUNT(*) FROM bookings WHERE listing_id = ?) < ?
    `)
    .bind(
      listing_id, String(attendee_name).trim(), attendee_phone || null, attendee_line || null, payment_method,
      listing.capacity, listing_id, listing.capacity
    )
    .run();

  if (result.meta.changes === 0) {
    return Response.json({ error: 'This class is fully booked' }, { status: 409 });
  }

  return Response.json({ success: true, booking_id: result.meta.last_row_id }, { status: 201 });
}
