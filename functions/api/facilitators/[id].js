// GET /api/facilitators/:id
export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  const facilitator = await env.DB
    .prepare('SELECT id, name, bio, line_id, promptpay_id FROM users WHERE id = ? AND role = ?')
    .bind(id, 'facilitator')
    .first();

  if (!facilitator) {
    return Response.json({ error: 'Facilitator not found' }, { status: 404 });
  }

  const { results: listings } = await env.DB
    .prepare(`
      SELECT * FROM listings
      WHERE facilitator_id = ? AND status = 'approved'
      ORDER BY start_time ASC
    `)
    .bind(id)
    .all();

  return Response.json({ facilitator, listings });
}
