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

  const listing = await env.DB
    .prepare('SELECT id, capacity FROM listings WHERE id = ? AND status = ?')
    .bind(listing_id, 'approved')
    .first();

  if (!listing) {
    return Response.json({ error: 'Listing not found or not approved' }, { status: 404 });
  }

  if (listing.capacity != null) {
    const { count } = await env.DB
      .prepare('SELECT COUNT(*) as count FROM bookings WHERE listing_id = ?')
      .bind(listing_id)
      .first();

    if (count >= listing.capacity) {
      return Response.json({ error: 'This class is fully booked' }, { status: 409 });
    }
  }

  const result = await env.DB
    .prepare(`
      INSERT INTO bookings (listing_id, attendee_name, attendee_phone, attendee_line, payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `)
    .bind(listing_id, attendee_name, attendee_phone || null, attendee_line || null, payment_method)
    .run();

  return Response.json({ success: true, booking_id: result.meta.last_row_id }, { status: 201 });
}
