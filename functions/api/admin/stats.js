// GET /api/admin/stats
// Admin only. Real revenue and booking counts from actual booking data.

import { getSessionUser } from '../_auth-helper.js';

export async function onRequestGet(context) {
  const { env } = context;
  const user = await getSessionUser(context);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const revenueRow = await env.DB
    .prepare(`
      SELECT COALESCE(SUM(listings.price), 0) AS total_revenue, COUNT(bookings.id) AS total_bookings
      FROM bookings
      JOIN listings ON bookings.listing_id = listings.id
      WHERE bookings.payment_status = 'confirmed'
    `)
    .first();

  const pendingPaymentRow = await env.DB
    .prepare(`SELECT COUNT(*) AS count FROM bookings WHERE payment_status = 'pending'`)
    .first();

  const facilitatorCountRow = await env.DB
    .prepare(`SELECT COUNT(*) AS count FROM users WHERE role = 'facilitator' AND status = 'approved'`)
    .first();

  return Response.json({
    total_revenue: revenueRow.total_revenue,
    total_bookings: revenueRow.total_bookings,
    pending_payment_bookings: pendingPaymentRow.count,
    active_facilitators: facilitatorCountRow.count
  });
}
