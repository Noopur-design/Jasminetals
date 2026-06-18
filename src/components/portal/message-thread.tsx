"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  from: "you" | "team";
  author: string;
  time: string;
  text: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Group messages by calendar day for date separators. */
function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function MessageThread({
  initialMessages,
  clientName,
  plannerName = "Jasminetals Team",
}: {
  initialMessages: Message[];
  clientName: string;
  plannerName?: string;
}) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [draft, setDraft] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const msg: Message = {
      id: `local-${Date.now()}`,
      from: "you",
      author: clientName,
      time: new Date().toISOString(),
      text,
    };
    setMessages((prev) => [...prev, msg]);
    setDraft("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `team-${Date.now()}`,
          from: "team",
          author: plannerName,
          time: new Date().toISOString(),
          text: `Thank you, ${clientName.split(" ")[0]} — I've noted this and will follow up shortly. 💛`,
        },
      ]);
    }, 1400);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Precompute, per message, whether it opens a new calendar day.
  const rows = messages.map((m, i) => ({
    message: m,
    day: dayKey(m.time),
    showDay: i === 0 || dayKey(m.time) !== dayKey(messages[i - 1].time),
  }));

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col">
      {/* Thread header */}
      <Card className="mb-4 flex items-center gap-3 p-4">
        <Avatar name={plannerName} size="lg" />
        <div className="min-w-0">
          <p className="font-serif text-lg font-medium leading-tight text-ink">
            {plannerName}
          </p>
          <p className="text-sm text-ink-soft">Lead Planner, Jasminetals</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="size-2 rounded-full bg-success" aria-hidden />
          Usually replies within a day
        </span>
      </Card>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-line bg-ivory/40 p-4 sm:p-6">
        {rows.map(({ message: m, day, showDay }) => {
          const mine = m.from === "you";
          return (
            <React.Fragment key={m.id}>
              {showDay && (
                <div className="flex items-center justify-center py-1">
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink-muted ring-1 ring-line">
                    {day}
                  </span>
                </div>
              )}
              <div className={cn("flex items-end gap-2.5", mine && "flex-row-reverse")}>
                <Avatar
                  name={mine ? clientName : plannerName}
                  size="sm"
                  className="mb-5"
                />
                <div className={cn("max-w-[78%] sm:max-w-[70%]", mine && "text-right")}>
                  <div
                    className={cn(
                      "inline-block rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed",
                      mine
                        ? "rounded-br-md bg-gold text-on-accent"
                        : "rounded-bl-md border border-line bg-paper text-ink",
                    )}
                  >
                    {m.text}
                  </div>
                  <p className="mt-1 px-1 text-[11px] text-ink-muted">
                    {mine ? "You" : m.author} · {formatTime(m.time)}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="mt-4 flex items-end gap-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message the Jasminetals team…"
          aria-label="Write a message"
          rows={1}
          className="min-h-12 flex-1 resize-none"
        />
        <Button
          onClick={send}
          disabled={!draft.trim()}
          size="md"
          aria-label="Send message"
          className="h-12 shrink-0"
        >
          <Send className="size-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </div>
  );
}
