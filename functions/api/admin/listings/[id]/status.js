// POST /api/admin/listings/:id/status
// Admin only. Body: { status: "approved" | "declined" }

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

  const { status } = await request.json();
  if (!['approved', 'declined'].includes(status)) {
    return Response.json({ error: 'status must be approved or declined' }, { status: 400 });
  }

  const listingId = params.id;

  const listing = await env.DB
    .prepare('SELECT id FROM listings WHERE id = ?')
    .bind(listingId)
    .first();

  if (!listing) {
    return Response.json({ error: 'Listing not found' }, { status: 404 });
  }

  await env.DB
    .prepare('UPDATE listings SET status = ? WHERE id = ?')
    .bind(status, listingId)
    .run();

  return Response.json({ success: true, id: listingId, status });
}
