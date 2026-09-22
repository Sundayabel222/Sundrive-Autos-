import { jwtVerify, SignJWT } from "jose";

/**
 * Session-token primitives. Deliberately free of `next/headers` and bcrypt so
 * this module can also be imported from `src/proxy.ts` (which runs before the
 * app and cannot use request-scoped APIs).
 */

export const SESSION_COOKIE = "sundrive_session";

/** Kept short-lived; the admin re-authenticates rather than staying signed in forever. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Copy .env.example to .env and set a long random value.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

/** Returns null for any invalid/expired/tampered token rather than throwing. */
export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: String(payload.role ?? "ADMIN"),
    };
  } catch {
    return null;
  }
}
