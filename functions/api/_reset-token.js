// Shared helper: creates a one-time password reset token (valid 24 hours)
// and returns the full URL, used by both the reset-link endpoint and
// new-user creation.
export async function createResetToken(env, request, userId) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await env.DB
    .prepare('INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, userId, expiresAt)
    .run();

  const url = new URL(request.url);
  const resetUrl = `${url.origin}/reset-password.html?token=${token}`;

  return { reset_url: resetUrl, expires_at: expiresAt };
}
