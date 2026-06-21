"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User,
} from "firebase/auth";
import { ref, set, update } from "firebase/database";
import { auth, db, googleProvider } from "@/lib/firebase/client";

type Mode = "login" | "signup";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  role: string | null;
  modalOpen: boolean;
  mode: Mode;
  openAuth: (mode?: Mode) => void;
  closeAuth: () => void;
  setMode: (m: Mode) => void;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (input: {
    name: string;
    phone: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signInGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

function readRoleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )jt_role=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [role, setRole] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("login");

  // Read role from cookie on mount (covers admin-login sessions with no Firebase user).
  React.useEffect(() => {
    setRole(readRoleCookie());
  }, []);

  // Keep our httpOnly session cookie in sync with Firebase's token.
  React.useEffect(() => {
    return onIdTokenChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        try {
          const idToken = await u.getIdToken();
          await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          // Re-read AFTER the POST so the UI reflects the actual session role,
          // not a stale cookie value from before the server updated it.
          setRole(readRoleCookie());
        } catch {
          /* network hiccup — cookie refresh will retry on next token change */
        }
      } else {
        // No Firebase user — still might have a valid admin-login session.
        setRole(readRoleCookie());
      }
    });
  }, []);

  /** After a successful Firebase sign-in: mint the cookie, then route to dashboard. */
  async function finishAuth() {
    const u = auth.currentUser;
    if (!u) return;
    const idToken = await u.getIdToken(true);
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = (await res.json()) as { ok: boolean; redirectTo?: string };
    setModalOpen(false);
    // Always go to the server-determined dashboard — never to a ?next= URL.
    router.push(data.redirectTo ?? "/portal");
    router.refresh();
  }

  const value: AuthContextValue = {
    user,
    loading,
    role,
    modalOpen,
    mode,
    openAuth: (m = "login") => {
      setMode(m);
      setModalOpen(true);
    },
    closeAuth: () => setModalOpen(false),
    setMode,
    signInEmail: async (email, password) => {
      // First try an admin-issued client password (works on the public /login page
      // with no Firebase account and no email verification). Falls through to
      // Firebase for Google-created / self-signed-up accounts.
      try {
        const res = await fetch("/api/client-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        if (res.ok) {
          const data = (await res.json().catch(() => ({}))) as { redirectTo?: string };
          setRole(readRoleCookie());
          setModalOpen(false);
          router.push(data.redirectTo ?? "/portal");
          router.refresh();
          return;
        }
      } catch {
        /* network hiccup — fall through to Firebase */
      }
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await finishAuth();
    },
    signUpEmail: async ({ name, phone, email, password }) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() }).catch(() => {});
      // Best-effort profile save — never let a DB write block sign-up.
      try {
        await set(ref(db, `users/${cred.user.uid}`), {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          createdAt: Date.now(),
        });
      } catch {
        /* DB rules / network — profile syncs later */
      }
      // Require email verification before entering the app. This is what stops a
      // fresh, unverified account from auto-claiming a client portal it was
      // assigned by email. Send the link, then sign back out so there's no
      // half-session — the caller shows a "check your email" message.
      await sendEmailVerification(cred.user).catch(() => {});
      await signOut(auth);
    },
    signInGoogle: async () => {
      const cred = await signInWithPopup(auth, googleProvider);
      try {
        await update(ref(db, `users/${cred.user.uid}`), {
          name: cred.user.displayName ?? "",
          email: (cred.user.email ?? "").toLowerCase(),
          photo: cred.user.photoURL ?? "",
          lastLogin: Date.now(),
        });
      } catch {
        /* best-effort profile save; login still proceeds */
      }
      await finishAuth();
    },
    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email.trim());
    },
    logout: async () => {
      await signOut(auth);
      await fetch("/api/session", { method: "DELETE" });
      setUser(null);
      setRole(null);
      router.push("/");
      router.refresh();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
