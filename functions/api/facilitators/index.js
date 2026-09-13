// GET /api/facilitators
export async function onRequestGet(context) {
  const { env } = context;
  const { results: facilitators } = await env.DB
    .prepare('SELECT id, name, bio FROM users WHERE role = ? ORDER BY id')
    .bind('facilitator')
    .all();

  const { results: cats } = await env.DB
    .prepare(`
      SELECT DISTINCT facilitator_id, category
      FROM listings
      WHERE status = 'approved' AND category IS NOT NULL
    `)
    .all();

  const catsByFacilitator = {};
  for (const row of cats) {
    (catsByFacilitator[row.facilitator_id] ??= []).push(row.category);
  }

  const withCats = facilitators.map(f => ({
    ...f,
    categories: catsByFacilitator[f.id] || []
  }));

  return Response.json({ facilitators: withCats });
}
