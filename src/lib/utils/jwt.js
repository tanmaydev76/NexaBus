import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'nexabus-dev-secret-change-in-production';

export function signToken(payload) {
  return jwt.sign(payload, SECRET);
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
