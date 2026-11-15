"use client";
import { useState } from "react";
import type { DrawerProps } from "./drawer.types";
import UserDrawerShell from "./user-drawer-shell";
import { useUserDrawer } from "../store/use-user-drawer";

const COPY = {
  terminate: {
    title: "Terminate account",
    body: "This blocks the user from logging in. Their data is kept and you can reinstate the account later.",
    word: "TERMINATE",
    cta: "Terminate",
  },
  delete: {
    title: "Delete account",
    body: "The account moves to the bin and is permanently removed after the retention period. You can restore it until then.",
    word: "DELETE",
    cta: "Move to bin",
  },
} as const;

export default function ConfirmActionDrawer({ userId, action = "delete" }: DrawerProps) {
  const back = useUserDrawer((s) => s.back);
  const closeAll = useUserDrawer((s) => s.closeAll);
  const [typed, setTyped] = useState("");
  const copy = COPY[action];
  const ready = typed.trim().toUpperCase() === copy.word;

  const onConfirm = () => {
    // TODO: call the admin API for `userId`, then close.
    closeAll();
  };

  return (
    <UserDrawerShell title={copy.title}>
      <div className="ud-card">{copy.body}</div>
      <input
        className="ud-input"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={`Type ${copy.word} to confirm`}
        autoComplete="off"
      />
      <div className="ud-actions">
        <button
          type="button"
          className="ud-btn is-danger"
          disabled={!ready}
          onClick={onConfirm}
        >
          {copy.cta}
        </button>
        <button type="button" className="ud-btn is-ghost" onClick={back}>
          Cancel
        </button>
      </div>
    </UserDrawerShell>
  );
}


