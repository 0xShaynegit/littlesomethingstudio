// POST /api/admin/listings/:id/status
// Admin only. Body: { status: "approved" | "declined", confirm_conflict?: true }
// Approving checks for overlapping approved listings first. If conflicts exist and
// confirm_conflict is not true, returns 409 with the conflict list instead of approving.

import { getSessionUser } from '../../../_auth-helper.js';

export async function onRequestPost(context) {
  const { env, params, request } = context;
  const user = await getSessionUser(context);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { status, confirm_conflict } = await request.json();
  if (!['approved', 'declined'].includes(status)) {
    return Response.json({ error: 'status must be approved or declined' }, { status: 400 });
  }

  const listingId = params.id;

  const listing = await env.DB
    .prepare('SELECT id, start_time, end_time FROM listings WHERE id = ?')
    .bind(listingId)
    .first();

  if (!listing) {
    return Response.json({ error: 'Listing not found' }, { status: 404 });
  }

  if (status === 'approved' && !confirm_conflict) {
    const { results: conflicts } = await env.DB
      .prepare(`
        SELECT listings.id, listings.title_en, listings.start_time, listings.end_time, users.name AS facilitator_name
        FROM listings
        JOIN users ON listings.facilitator_id = users.id
        WHERE listings.status = 'approved'
          AND listings.id != ?
          AND listings.start_time < ?
          AND listings.end_time > ?
      `)
      .bind(listingId, listing.end_time, listing.start_time)
      .all();

    if (conflicts.length > 0) {
      return Response.json({ error: 'Time conflict with existing approved listing', conflicts }, { status: 409 });
    }
  }

  await env.DB
    .prepare('UPDATE listings SET status = ? WHERE id = ?')
    .bind(status, listingId)
    .run();

  return Response.json({ success: true, id: listingId, status });
}
