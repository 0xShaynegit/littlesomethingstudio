// POST /api/auth/signup
// multipart/form-data: name, email, password, bio, photo (file)
// Public. Creates a facilitator account with status 'pending'; it cannot log
// in and does not appear on facilitators.html until an admin approves it.

import { hashPassword, passwordError } from '../_password.js';
import { uploadPhoto } from '../_upload.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  const form = await request.formData();

  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = form.get('password');
  const bio = String(form.get('bio') || '').trim();
  const photo = form.get('photo');

  if (!name || !email || !password) {
    return Response.json({ error: 'Name, email, and password are required' }, { status: 400 });
  }
  if (name.length > 80 || bio.length > 1000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Please check your name, email, and bio' }, { status: 400 });
  }

  const pwError = passwordError(password);
  if (pwError) {
    return Response.json({ error: pwError }, { status: 400 });
  }

  const existing = await env.DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first();
  if (existing) {
    return Response.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  let photoKey = null;
  if (photo && photo.size > 0) {
    const result = await uploadPhoto(env, photo, 'facilitators');
    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    photoKey = result.key;
  }

  const passwordHash = await hashPassword(password);

  const result = await env.DB
    .prepare(`
      INSERT INTO users (name, email, role, status, photo_key, bio, password_hash)
      VALUES (?, ?, 'facilitator', 'pending', ?, ?, ?)
    `)
    .bind(name, email, photoKey, bio || null, passwordHash)
    .run();

  return Response.json(
    { success: true, id: result.meta.last_row_id, status: 'pending' },
    { status: 201 }
  );
}
