"use client";
import { useState } from "react";
import SigninModals from "./signin-modals";

export default function SignInPage() {
  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<"signin"|"signup">("signin");

  return (
    <SigninModals 
      isOpen={open}
      mode={mode}
      onClose={() => setOpen(false)}
      onSwitchMode={setMode}
      onSuccess={(user) => console.log("logged", user)}
    />
  );
}
