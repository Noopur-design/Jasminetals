"use client";

import { useAuth } from "@/components/auth/auth-provider";

/** Signs out of Firebase and clears the session cookie, then routes home. */
export function LogoutButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  return (
    <button type="button" onClick={() => logout()} className={className}>
      {children}
    </button>
  );
}
