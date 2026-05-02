const crypto = require('crypto');

const AUTH_SECRET = process.env.AUTH_SECRET || 'please_change_this_secret';
const AUTH_TOKEN_EXPIRES_IN = parseInt(process.env.AUTH_TOKEN_EXPIRES_IN || '3600', 10);

function createAuthToken(payload) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + AUTH_TOKEN_EXPIRES_IN
  };

  const payloadBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payloadBase64).digest('base64url');

  return `${payloadBase64}.${signature}`;
}

function verifyAuthToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token inválido');
  }

  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) {
    throw new Error('Formato de token inválido');
  }

  const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(payloadBase64).digest('base64url');
  const receivedSignature = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (receivedSignature.length !== expectedSignatureBuffer.length || !crypto.timingSafeEqual(receivedSignature, expectedSignatureBuffer)) {
    throw new Error('Firma de token inválida');
  }

  const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
  const payload = JSON.parse(payloadJson);

  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expirado');
  }

  return payload;
}

module.exports = {
  createAuthToken,
  verifyAuthToken
};