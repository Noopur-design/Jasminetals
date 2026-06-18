"use client";

import * as React from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  return (
    <div className="rise-in">
      <AuthForm mode={mode} onSwitchMode={setMode} />
    </div>
  );
}
