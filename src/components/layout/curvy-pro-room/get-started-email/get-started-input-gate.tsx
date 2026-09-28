"use client";
import { useState } from "react";
import "./gate.css";

export default function GetStartedInputGate() {
  const [email, setEmail] = useState("");
  return (
    <div className="gte-root">
      <form className="gte-form" onSubmit={(e) => {
        e.preventDefault();
        if(!email) return;
        window.location.href = `/movies?email=${encodeURIComponent(email)}`;
      }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="gte-input"
        />
        <button type="submit" className="gte-btn">Get Started</button>
      </form>
      <p className="gte-foot">No commitment. Leave anytime.</p>
    </div>
  );
}
