const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(credential) {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  return {
    googleId: payload.sub,
    email: String(payload.email || '').toLowerCase(),
    emailVerified: Boolean(payload.email_verified),
    name: payload.name || '',
    avatarUrl: payload.picture || null,
  };
}

module.exports = {
  verifyGoogleToken,
};