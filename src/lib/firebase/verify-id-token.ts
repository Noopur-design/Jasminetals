import { jwtVerify, createRemoteJWKSet } from "jose";

/**
 * Verifies a Firebase ID token server-side WITHOUT the Admin SDK by checking
 * Google's published public keys + the issuer/audience claims. Edge-safe.
 */
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

import type { Permissions } from "@/lib/permissions";

export type FirebaseIdentity = {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  // Custom claims set by the admin (via Admin SDK) ride along in the token.
  claimRole?: "client" | "team" | "admin";
  claimPermissions?: Permissions;
};

export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<FirebaseIdentity | null> {
  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    if (!payload.sub || typeof payload.email !== "string") return null;
    const r = payload.role;
    const claimRole =
      r === "admin" ? "admin" : r === "team" ? "team" : r === "client" ? "client" : undefined;
    return {
      uid: payload.sub,
      email: (payload.email as string).toLowerCase(),
      emailVerified: Boolean(payload.email_verified),
      name: typeof payload.name === "string" ? payload.name : undefined,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
      claimRole: claimRole as "client" | "team" | "admin" | undefined,
      claimPermissions: (payload.permissions as Permissions) ?? undefined,
    };
  } catch {
    return null;
  }
}
