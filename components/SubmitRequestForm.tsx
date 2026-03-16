"use client";

import { useMemo, useState } from "react";

type SubmitRequestFormProps = {
  userId: string | null;
  onSubmitted?: (message: string) => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

const initialFormState: FormState = {
  name: "",
  phone: "",
  email: "",
  notes: ""
};

export function SubmitRequestForm({
  userId,
  onSubmitted
}: SubmitRequestFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const notesCount = useMemo(() => form.notes.length, [form.notes.length]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      setFeedback("Unable to determine the current user session.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/submit-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          notes: form.notes,
          user_id: userId
        })
      });
      const data = (await response.json()) as {
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Unable to submit request.");
      }

      setForm(initialFormState);
      setFeedback(data.message ?? "Design request submitted successfully.");
      onSubmitted?.(data.message ?? "Design request submitted successfully.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Unable to submit request."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium text-neutral-800">Submit request</h2>
      <p className="mt-0.5 text-xs text-neutral-500">
        Send configuration and contact details.
      </p>

      <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-[10px] text-neutral-500">Name</span>
          <input
            required
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
            placeholder="Full name"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] text-neutral-500">Phone</span>
          <input
            required
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
            className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
            placeholder="+1 555 000 0000"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] text-neutral-500">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
            placeholder="name@example.com"
          />
        </label>
        <label className="block">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] text-neutral-500">Notes</span>
            <span className="text-[10px] text-neutral-400">{notesCount}/500</span>
          </div>
          <textarea
            required
            maxLength={500}
            rows={3}
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
            className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
            placeholder="Project details, quantity, delivery."
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting || !userId}
          className="w-full rounded-xl bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Submitting…" : "Submit"}
        </button>
        {feedback ? (
          <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
            {feedback}
          </p>
        ) : null}
      </form>
    </section>
  );
}
