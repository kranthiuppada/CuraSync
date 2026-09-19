// Minimal demo auth + profile store. In-memory, no external deps. Accepts any well-formed
// credentials (hackathon demo) and issues an opaque token; sessions persist for the process.
import { randomBytes } from 'node:crypto';

const users = new Map();     // email -> user
const sessions = new Map();  // token -> email

const DEFAULT_PROFILE = { age: 34, plan: 'CuraSync Plus', sex: 'F' };

function nameFromEmail(email) {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ');
  return local.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Patient';
}

export function login({ email, password }) {
  email = String(email ?? '').trim().toLowerCase();
  password = String(password ?? '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'invalid_email' };
  if (password.length < 4) return { error: 'weak_password' };

  let user = users.get(email);
  if (!user) {
    user = { id: 'u_' + randomBytes(4).toString('hex'), email, name: nameFromEmail(email), ...DEFAULT_PROFILE };
    users.set(email, user);
  }
  const token = 't_' + randomBytes(12).toString('hex');
  sessions.set(token, email);
  return { token, user };
}

export function userForToken(token) {
  const email = sessions.get(token ?? '');
  return email ? users.get(email) : null;
}

export function updateProfile(token, patch) {
  const user = userForToken(token);
  if (!user) return null;
  const allowed = ['name', 'age', 'plan', 'sex'];
  for (const k of allowed) if (patch[k] != null) user[k] = patch[k];
  return user;
}

export function logout(token) {
  sessions.delete(token ?? '');
}

/** Express middleware — attaches req.user from the Bearer token (does not reject). */
export function withUser(req, _res, next) {
  const h = req.headers.authorization ?? '';
  req.token = h.startsWith('Bearer ') ? h.slice(7) : null;
  req.user = userForToken(req.token);
  next();
}
