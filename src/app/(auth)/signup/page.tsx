"use client";

import * as React from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  const [mode, setMode] = React.useState<"login" | "signup">("signup");
  return (
    <div className="rise-in">
      <AuthForm mode={mode} onSwitchMode={setMode} />
    </div>
  );
}
