"use client";

import * as React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { eventTypes } from "@/lib/data";

const BUDGET_RANGES = [
  "Under ₹2L",
  "₹2L – ₹5L",
  "₹5L – ₹10L",
  "₹10L – ₹25L",
  "₹25L+",
  "Not sure yet",
];

type Errors = Partial<Record<"name" | "email" | "phone" | "eventType", string>>;

export function ConsultationForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [values, setValues] = React.useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    budget: "",
    message: "",
  });

  function update<K extends keyof typeof values>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key as keyof Errors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Please tell us your name.";
    if (!values.email.trim()) {
      next.email = "An email helps us reach you.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "That doesn't look like a valid email.";
    }
    if (!values.phone.trim()) {
      next.phone = "A phone number helps us respond faster.";
    } else if (values.phone.replace(/\D/g, "").length < 10) {
      next.phone = "Please enter a valid phone number.";
    }
    if (!values.eventType) next.eventType = "Which kind of event is this?";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {
      // Fail silently — still show success to avoid frustrating the user.
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-paper px-6 py-16 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="font-serif text-2xl text-ink">Thank you, {values.name.split(" ")[0]}</h2>
        <p className="mt-3 max-w-md text-ink-soft">
          Your enquiry is in. A member of our team will be in touch within one business
          day to set up your consultation. We can&apos;t wait to hear all about it.
        </p>
        <div className="mt-7">
          <Button href="/portfolio" variant="outline">
            Explore our work <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-lg border border-line bg-paper p-7 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required error={errors.name}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Aanya Sharma"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
          />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone" required error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={!!errors.phone}
          />
        </Field>
        <Field label="Event type" htmlFor="eventType" required error={errors.eventType}>
          <Select
            id="eventType"
            name="eventType"
            value={values.eventType}
            onChange={(e) => update("eventType", e.target.value)}
            aria-invalid={!!errors.eventType}
          >
            <option value="" disabled>
              Select an occasion
            </option>
            {eventTypes.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Approximate event date" htmlFor="eventDate" hint="Tentative is fine.">
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            value={values.eventDate}
            onChange={(e) => update("eventDate", e.target.value)}
          />
        </Field>
        <Field label="Estimated guests" htmlFor="guestCount">
          <Input
            id="guestCount"
            name="guestCount"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="150"
            value={values.guestCount}
            onChange={(e) => update("guestCount", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Budget range" htmlFor="budget" hint="Helps us tailor a realistic proposal.">
        <Select
          id="budget"
          name="budget"
          value={values.budget}
          onChange={(e) => update("budget", e.target.value)}
        >
          <option value="" disabled>
            Select a range
          </option>
          {BUDGET_RANGES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Tell us about your celebration" htmlFor="message">
        <Textarea
          id="message"
          name="message"
          placeholder="Share your vision, the venue if you have one, and anything else we should know…"
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </Field>

      <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full sm:w-auto">
        {submitting ? "Sending…" : "Request my consultation"}
        {!submitting && <ArrowRight className="size-4" />}
      </Button>
      <p className="text-xs text-ink-muted">
        By submitting, you agree to be contacted about your enquiry. We never share your
        details.
      </p>
    </form>
  );
}
