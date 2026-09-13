// GET /api/facilitators
export async function onRequestGet(context) {
  const { env } = context;
  const { results } = await env.DB
    .prepare('SELECT id, name, bio FROM users WHERE role = ?')
    .bind('facilitator')
    .all();
  return Response.json({ facilitators: results });
}
