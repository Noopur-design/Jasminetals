import type { Metadata } from "next";
import {
  ArrowRight,
  MessageCircle,
  FileText,
  Bell,
  Check,
  CalendarDays,
  MapPin,
  AlertCircle,
  ChevronRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/site/page-hero";
import { processSteps } from "@/lib/data";
import { getServerSession } from "@/lib/server-auth";
import { getClientAssignment } from "@/lib/store";
import { event as demoEvent, milestones } from "@/lib/portal-data";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "From first consultation to event day — the five-step Jasminetals process that keeps you informed, in control and at ease the entire way.",
};

// Milestone IDs that belong to each process step (by index)
const STEP_MILESTONE_IDS: string[][] = [
  ["m1", "m2"],         // 0 — Consultation
  ["m3", "m4", "m5"],  // 1 — Concept
  ["m6", "m7", "m8"],  // 2 — Planning
  ["m9", "m10"],        // 3 — Coordination
  [],                   // 4 — Event Day
];

type StepStatus = "done" | "active" | "action-needed" | "pending";

function computeStepStatus(stepIndex: number): StepStatus {
  const ids = STEP_MILESTONE_IDS[stepIndex];
  if (!ids?.length) return "pending";
  const ms = milestones.filter((m) => ids.includes(m.id));
  if (ms.every((m) => m.status === "done")) return "done";
  if (ms.some((m) => m.status === "action-needed")) return "action-needed";
  if (ms.some((m) => m.status === "in-progress")) return "active";
  return "pending";
}

const EXPECT = [
  {
    icon: MessageCircle,
    title: "Clear communication",
    description:
      "One dedicated point of contact, regular check-ins, and answers within a business day — never radio silence.",
  },
  {
    icon: FileText,
    title: "Everything documented",
    description:
      "Budgets, timelines and vendor details live in your client portal, so nothing is ever lost in a thread.",
  },
  {
    icon: Bell,
    title: "No surprises",
    description:
      "You approve every direction and every spend before we proceed. The only surprises are the lovely ones.",
  },
];

export default async function ProcessPage() {
  const session = await getServerSession();
  const isClient = session?.role === "client" || session?.role === "admin";
  const isLead = session?.role === "lead";

  // Try to get the real client's event; fall back to demo data for admin previews.
  const assignment =
    session && session.role === "client"
      ? await getClientAssignment(session.email)
      : null;

  const event = assignment
    ? {
        name: assignment.eventName,
        type: assignment.eventType,
        date: assignment.eventDate,
        venue: assignment.venue,
        location: assignment.location,
      }
    : demoEvent;

  // Real clients start at Consultation=done, Concept=active; admins see the full demo milestones.
  const stepStatuses: StepStatus[] = processSteps.map((_, i) => {
    if (!isClient) return "pending";
    if (assignment) {
      // Newly promoted client: consultation done, concept active, rest pending
      if (i === 0) return "done";
      if (i === 1) return "active";
      return "pending";
    }
    return computeStepStatus(i);
  });

  const currentStepIdx = isClient
    ? stepStatuses.findIndex((s) => s !== "done")
    : -1;

  const actionItems = isClient && !assignment
    ? milestones.filter((m) => m.status === "action-needed")
    : [];

  const daysToEvent = isClient
    ? Math.max(
        0,
        Math.ceil(
          (new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From first hello to last dance"
        lead="A clear, collaborative process designed to keep you calm and informed at every stage — five steps, one dedicated team."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Process" }]}
      />

      {/* ── Lead: slim notice ── */}
      {isLead && (
        <div className="border-b border-gold/15 bg-gold-tint">
          <Container>
            <div className="flex items-center gap-3 py-3.5">
              <Clock className="size-4 shrink-0 text-gold" />
              <p className="text-sm text-ink-soft">
                You don&apos;t have an active event yet.{" "}
                <Link
                  href="/contact"
                  className="font-medium text-gold-dark underline-offset-2 hover:underline"
                >
                  Book a consultation
                </Link>{" "}
                and this page becomes your live planning dashboard.
              </p>
            </div>
          </Container>
        </div>
      )}

      {/* ── Client: live event progress ── */}
      {isClient && (
        <Section tone="paper">
          <Container>
            <div className="flex flex-col gap-10">
              {/* Event at a glance */}
              <div className="rounded-2xl border border-gold/20 bg-gold-tint px-8 py-8 md:px-10 md:py-9">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-1.5">
                    <p className="eyebrow">Your event</p>
                    <h2 className="font-serif text-3xl text-ink">{event.name}</h2>
                    <p className="text-base text-ink-soft">{event.type}</p>
                    <div className="mt-3 flex flex-col gap-1.5 text-sm text-ink-soft">
                      <span className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0 text-gold" />
                        {event.venue}, {event.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <CalendarDays className="size-4 shrink-0 text-gold" />
                        {new Date(event.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <span className="font-serif text-6xl font-medium leading-none text-gold-deep">
                      {daysToEvent}
                    </span>
                    <span className="mt-1 text-sm text-ink-muted">days to go</span>
                  </div>
                </div>
              </div>

              {/* Horizontal step tracker */}
              <div>
                <p className="eyebrow mb-6">Your progress</p>
                <div className="flex items-start">
                  {processSteps.map((step, i) => {
                    const status = stepStatuses[i];
                    const isLast = i === processSteps.length - 1;
                    const isCurrent = i === currentStepIdx;
                    return (
                      <div key={step.title} className="flex flex-1 flex-col items-center">
                        <div className="flex w-full items-center">
                          <div
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-full text-sm transition-all",
                              status === "done"
                                ? "bg-gold text-on-accent"
                                : isCurrent || status === "action-needed"
                                  ? "border-2 border-gold bg-gold-soft text-gold-deep"
                                  : "border border-line bg-ivory text-ink-muted",
                            )}
                          >
                            {status === "done" ? (
                              <Check className="size-4" strokeWidth={2.5} />
                            ) : (
                              <span className="font-serif">{i + 1}</span>
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={cn(
                                "h-px flex-1 transition-all",
                                status === "done" ? "bg-gold/50" : "bg-line",
                              )}
                            />
                          )}
                        </div>
                        <p
                          className={cn(
                            "mt-2 max-w-[5rem] text-center text-xs",
                            isCurrent || status === "action-needed"
                              ? "font-semibold text-gold-deep"
                              : status === "done"
                                ? "text-ink-soft"
                                : "text-ink-muted",
                          )}
                        >
                          {step.title}
                        </p>
                        {(isCurrent || status === "action-needed") && (
                          <p className="mt-0.5 text-center text-xs text-gold">
                            {status === "action-needed" ? "Action needed" : "In progress"}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action items */}
              {actionItems.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-warning" />
                    <p className="text-sm font-medium text-ink">
                      {actionItems.length}{" "}
                      {actionItems.length === 1 ? "item needs" : "items need"} your
                      attention
                    </p>
                  </div>
                  {actionItems.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col gap-1 rounded-lg border border-warning/20 bg-warning-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium text-ink">{m.title}</p>
                        <p className="text-sm text-ink-soft">{m.description}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-muted">
                        Due{" "}
                        {new Date(m.due).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Button href="/portal" size="lg">
                  View your full portal <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      )}


      {/* ── Vertical process timeline ── */}
      <Section tone="ivory">
        <Container size="narrow">
          <ol className="flex flex-col">
            {processSteps.map((step, i) => {
              const last = i === processSteps.length - 1;
              const status = stepStatuses[i];
              const isCurrent = isClient && i === currentStepIdx;

              return (
                <li key={step.title} className="flex gap-6">
                  {/* Left: circle + connector */}
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-14 shrink-0 items-center justify-center rounded-full border font-serif text-xl transition-all",
                        isClient && status === "done"
                          ? "border-gold bg-gold text-on-accent"
                          : isCurrent || (isClient && status === "action-needed")
                            ? "border-gold bg-gold-soft text-gold-deep ring-4 ring-gold/10"
                            : "border-gold/30 bg-gold-soft text-gold-deep",
                      )}
                    >
                      {isClient && status === "done" ? (
                        <Check className="size-6" strokeWidth={2} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    {!last && (
                      <span
                        className={cn(
                          "mt-3 w-px flex-1 min-h-12",
                          isClient && status === "done" ? "bg-gold/40" : "bg-gold/20",
                        )}
                      />
                    )}
                  </div>

                  {/* Right: content */}
                  <div className={cn("flex-1", !last && "pb-14")}>
                    <Reveal delay={i * 60}>
                      <div className="flex flex-col gap-3 pt-2.5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <step.icon className="size-5 text-gold" aria-hidden />
                          <h2 className="text-2xl">{step.title}</h2>
                          {isCurrent && (
                            <span className="rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-on-accent">
                              You&apos;re here
                            </span>
                          )}
                          {isClient && status === "action-needed" && (
                            <span className="rounded-full bg-warning-soft px-3 py-0.5 text-xs font-semibold text-warning">
                              Action needed
                            </span>
                          )}
                        </div>
                        <p className="text-lg leading-relaxed text-ink-soft">
                          {step.description}
                        </p>
                      </div>
                    </Reveal>
                  </div>
                </li>
              );
            })}
          </ol>
        </Container>
      </Section>

      {/* ── What to expect ── */}
      <Section tone="paper">
        <Container>
          <SectionHeading
            eyebrow="What to expect"
            title="The experience of working with us"
            lead="Beyond the milestones, here's how it actually feels to plan with Jasminetals."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {EXPECT.map((e, i) => (
              <Reveal key={e.title} delay={i * 60}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-line bg-ivory p-7">
                  <div className="flex size-11 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                    <e.icon className="size-5" />
                  </div>
                  <h3 className="text-lg">{e.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{e.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── CTA — hidden for active clients who already have a portal ── */}
      {!isClient && (
        <Section tone="gold">
          <Container>
            <div className="flex flex-col items-center gap-6 text-center">
              <h2 className="max-w-2xl text-3xl leading-tight sm:text-4xl">
                Ready to take the first step?
              </h2>
              <p className="max-w-xl text-lg text-ink-soft">
                It all begins with a conversation. Tell us about your celebration and
                we&apos;ll take it from there.
              </p>
              <Button href="/contact" size="lg">
                Book a Consultation <ArrowRight className="size-4" />
              </Button>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
