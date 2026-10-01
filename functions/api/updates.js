// GET /api/updates
// Public. Returns Studio Updates posts, newest first.

export async function onRequestGet(context) {
  const { env } = context;

  const { results } = await env.DB
    .prepare('SELECT * FROM studio_updates ORDER BY published_at DESC')
    .all();

  return Response.json({ updates: results });
}
