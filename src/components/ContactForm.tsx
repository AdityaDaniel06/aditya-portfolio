"use client";

import { useState, type FormEvent } from "react";
import { profile } from "@/data/resume";

type Status = "idle" | "sending" | "sent" | "error";

const field = "w-full bg-white px-3 py-2 text-lg shadow-[0_0_0_3px_#1b1b2f] outline-none focus:shadow-[0_0_0_3px_#1b1b2f,0_0_0_6px_var(--yellow)]";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Something glitched.");
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError((err as Error).message);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="bg-white p-6 text-center shadow-[0_0_0_3px_#1b1b2f]">
        <p className="font-pixel text-xs leading-relaxed sm:text-sm">MESSAGE DELIVERED! +100 XP</p>
        <p className="mt-3 text-lg">Thanks! I&apos;ll reply to your email soon.</p>
        <button type="button" className="px-btn mt-5" onClick={() => setStatus("idle")}>
          SEND ANOTHER
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 text-left" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-pixel text-[9px]">YOUR NAME</span>
          <input name="name" required maxLength={80} autoComplete="name" className={field} />
        </label>
        <label className="grid gap-2">
          <span className="font-pixel text-[9px]">YOUR EMAIL</span>
          <input name="email" type="email" required maxLength={254} autoComplete="email" className={field} />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="font-pixel text-[9px]">MESSAGE</span>
        <textarea name="message" required minLength={10} maxLength={2000} rows={5} className={`${field} resize-y`} />
      </label>

      {/* Honeypot: hidden from people, tempting for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="bg-pink/20 p-3 text-lg shadow-[0_0_0_3px_#1b1b2f]">
          {error} You can also email <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>.
        </p>
      )}

      <div className="flex justify-center">
        <button type="submit" disabled={status === "sending"} className="px-btn disabled:opacity-60">
          {status === "sending" ? "SENDING…" : "▶ SEND MESSAGE"}
        </button>
      </div>
    </form>
  );
}
