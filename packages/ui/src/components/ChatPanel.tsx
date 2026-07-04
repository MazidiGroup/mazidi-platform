"use client";
import { useRef, useState, useTransition } from "react";

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Generic persisted-chat panel (docs/02 §AIAssistantPanel). The endpoint owns
 * auth, grounding and persistence; this component only renders and sends.
 * Contract: POST { message } → { data: { messages: Msg[] }, error? }.
 */
export function ChatPanel({
  endpoint, title, subtitle, placeholder = "Ask anything…", emptyHint, initialMessages = [],
}: {
  endpoint: string; title: string; subtitle?: string; placeholder?: string;
  emptyHint?: string; initialMessages?: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  function send() {
    const message = inputRef.current?.value.trim();
    if (!message || pending) return;
    setMessages((m) => [...m, { role: "user", content: message }]);
    if (inputRef.current) inputRef.current.value = "";
    start(async () => {
      setError(null);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = (await res.json().catch(() => null)) as { data?: { messages?: Msg[] }; error?: string } | null;
      if (res.ok && json?.data?.messages) setMessages(json.data.messages);
      else setError(json?.error ?? "The assistant is unavailable right now.");
      requestAnimationFrame(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }));
    });
  }

  return (
    <div className="flex h-[560px] flex-col rounded-md border border-line bg-bg2">
      <div className="border-b border-line px-6 py-4">
        <b className="text-[.95rem] font-semibold">✦ {title}</b>
        {subtitle && <span className="block text-[.78rem] text-t3">{subtitle}</span>}
      </div>
      <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <p className="py-6 text-center text-[.85rem] text-t3">{emptyHint ?? "Start the conversation below."}</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[.88rem] leading-relaxed ${
              m.role === "user" ? "ml-auto bg-gold/15 text-t1" : "bg-bg3 text-t2"
            }`}
          >
            <span className="whitespace-pre-wrap">{m.content}</span>
          </div>
        ))}
        {pending && <div className="max-w-[85%] rounded-2xl bg-bg3 px-4 py-2.5 text-[.88rem] text-t3">Thinking…</div>}
        {error && <p className="text-[.82rem] text-danger" role="alert">{error}</p>}
      </div>
      <div className="flex gap-2 border-t border-line px-4 py-3">
        <input
          ref={inputRef}
          placeholder={placeholder}
          className="flex-1 rounded-full border border-line bg-bg3 px-4 py-2.5 text-[.88rem] text-t1 outline-none focus:border-gold"
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          disabled={pending}
        />
        <button
          type="button"
          onClick={send}
          disabled={pending}
          className="rounded-full bg-gold px-5 py-2.5 text-[.85rem] font-semibold text-[#14100A] transition-colors hover:bg-gold-soft disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
