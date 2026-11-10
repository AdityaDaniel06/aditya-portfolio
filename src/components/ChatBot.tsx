"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PixelSprite from "./PixelSprite";
import { chatBubble, heroIdle } from "@/lib/sprites";
import { gsap } from "@/lib/gsap";
import { profile } from "@/data/resume";

type Msg = { role: "user" | "assistant"; content: string };

const suggestions = ["What's his tech stack?", "Tell me about his experience", "Playwright skills?", "How do I contact him?"];
const firstName = profile.name.split(" ")[0];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hi! I'm ${firstName}'s pixel sidekick. Ask me anything about his skills, work or projects.`,
    },
  ]);
  const [typing, setTyping] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState<string>("llm");
  const offline = source !== "llm";
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      const next: Msg[] = [...messages, { role: "user", content: q }];
      setMessages(next);
      setInput("");
      setBusy(true);
      let reply = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next.slice(1) }),
        });
        const data = (await res.json()) as { reply?: string; source?: string; error?: string };
        reply = data.reply ?? data.error ?? "Hmm, something glitched.";
        if (data.source) setSource(data.source);
      } catch {
        reply = `Connection lost! Try again, or email ${profile.email}.`;
      }
      // typewriter effect
      for (let i = 1; i <= reply.length; i += 2) {
        setTyping(reply.slice(0, i));
        await new Promise((r) => setTimeout(r, 12));
      }
      setTyping("");
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      setBusy(false);
    },
    [busy, messages]
  );

  // Open from anywhere: window.dispatchEvent(new CustomEvent("chat:open", { detail?: "question" }))
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string | undefined>).detail;
      if (q) void send(q);
    };
    window.addEventListener("chat:open", onOpen);
    return () => window.removeEventListener("chat:open", onOpen);
  }, [send]);

  useEffect(() => {
    if (!open) return;
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { y: 40, scale: 0.85, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(2)" }
      );
    }
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, typing, busy]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? "Close chat" : `Chat with ${firstName}'s AI sidekick`}
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 bg-blue px-3 py-3 shadow-[0_0_0_4px_#1b1b2f,6px_6px_0_4px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-1"
      >
        <PixelSprite sprite={chatBubble} scale={3} className={open ? "" : "anim-bob"} />
        <span className="font-pixel hidden text-[10px] sm:inline">{open ? "CLOSE" : "ASK ME"}</span>
      </button>

      {open &&
        createPortal(
        // Outer wrapper only pins the panel to the viewport; the inner .px-box
        // (which sets position: relative) handles the look.
        <div
          style={{ position: "fixed", right: 20, bottom: 96, zIndex: 60 }}
          className="h-[min(560px,calc(100svh-140px))] w-[min(380px,calc(100vw-40px))]"
        >
        <div
          id="chat-panel"
          ref={panelRef}
          role="dialog"
          aria-label="Portfolio AI chat"
          className="px-box m-0! flex h-full w-full flex-col"
        >
          <div className="flex items-center gap-3 bg-ink px-4 py-3 text-cream">
            <PixelSprite sprite={heroIdle} scale={2} />
            <div className="flex-1">
              <p className="font-pixel text-[10px]">{firstName.toUpperCase()}.AI</p>
              <p className="text-sm text-cream/70">
                {source === "limited"
                  ? "AI limit reached · answering from resume"
                  : offline
                    ? "Offline mode · answers from resume"
                    : "Ask about skills, work, projects"}
              </p>
            </div>
            <span className={`h-3 w-3 ${offline ? "bg-yellow" : "bg-green"}`} aria-hidden />
          </div>

          <div ref={listRef} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            {typing && <Bubble msg={{ role: "assistant", content: typing }} />}
            {busy && !typing && (
              <p className="font-pixel text-[10px] text-ink/60">
                THINKING<span className="anim-blink">...</span>
              </p>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="bg-white px-2 py-1 text-left text-sm shadow-[0_0_0_2px_#1b1b2f] hover:bg-yellow"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="flex gap-2 border-t-4 border-ink p-3">
            <label htmlFor="chat-input" className="sr-only">
              Your question
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Type a question…"
              className="min-w-0 flex-1 bg-white px-3 py-2 text-lg shadow-[0_0_0_3px_#1b1b2f] outline-none"
            />
            <button type="submit" disabled={busy || !input.trim()} className="px-btn px-3! py-2! disabled:opacity-50">
              ▶
            </button>
          </form>
        </div>
        </div>,
          document.body
        )}
    </>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const me = msg.role === "user";
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] whitespace-pre-wrap px-3 py-2 text-lg leading-snug ${
          me ? "bg-pink text-white" : "bg-white text-ink"
        }`}
        style={{ boxShadow: "0 0 0 3px #1b1b2f, 4px 4px 0 3px rgba(0,0,0,0.25)" }}
      >
        {msg.content}
      </p>
    </div>
  );
}
