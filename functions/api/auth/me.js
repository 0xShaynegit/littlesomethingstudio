// GET /api/auth/me
// Returns the currently logged-in user based on session cookie, or 401 if not logged in

import { getSessionUser } from '../_auth-helper.js';

export async function onRequestGet(context) {
  const user = await getSessionUser(context);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  return Response.json({ user });
}
