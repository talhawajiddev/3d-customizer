"use client";

import { useMemo, useState } from "react";

import type { DesignRecord } from "@/lib/supabase/client";

type SubmitRequestFormProps = {
  userId: string | null;
  designs: DesignRecord[];
  getPreviewUrl: (design: DesignRecord) => string | null;
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
  designs,
  getPreviewUrl,
  onSubmitted
}: SubmitRequestFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

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
          user_id: userId,
          selected_design_ids: selectedDesignIds
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

  const selectedDesigns = designs.filter((design) =>
    selectedDesignIds.includes(design.id)
  );

  function toggleDesign(id: string) {
    setSelectedDesignIds((current) =>
      current.includes(id) ? current.filter((d) => d !== id) : [...current, id]
    );
  }

  return (
    <>
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

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] text-neutral-500">Designs</span>
              <span className="text-[10px] text-neutral-400">
                {selectedDesigns.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2">
              {selectedDesigns.map((design) => {
                const previewUrl = getPreviewUrl(design);
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => toggleDesign(design.id)}
                    className="group relative h-10 w-10 overflow-hidden rounded-md border border-neutral-200 bg-white"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] text-neutral-400">
                        No
                      </div>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[9px] font-medium uppercase text-white opacity-0 transition group-hover:opacity-100">
                      Remove
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="flex h-10 items-center justify-center rounded-md border border-dashed border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-500 hover:border-neutral-400 hover:text-neutral-700"
              >
                +
              </button>
            </div>
          </div>

          <label className="block">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] text-neutral-500">Notes</span>
              <span className="text-[10px] text-neutral-400">
                {notesCount}/500
              </span>
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

      {isPickerOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="flex max-h-full w-full max-w-4xl flex-col gap-4 rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium text-neutral-900">
                  Select designs
                </h2>
                <p className="text-xs text-neutral-500">
                  Click thumbnails to add or remove them from the request.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
              >
                Close
              </button>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
              {designs.map((design) => {
                const previewUrl = getPreviewUrl(design);
                const isSelected = selectedDesignIds.includes(design.id);
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => toggleDesign(design.id)}
                    className={`relative overflow-hidden rounded-lg border text-left ${
                      isSelected
                        ? "border-neutral-900 ring-1 ring-neutral-900"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="aspect-[4/3] w-full bg-neutral-900">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                          No preview
                        </div>
                      )}
                    </div>
                    <div className="px-2.5 py-2">
                      <p className="text-xs font-medium text-neutral-800">
                        {design.product_type}
                      </p>
                      <p className="mt-0.5 text-[10px] text-neutral-500">
                        {design.length} × {design.width} × {design.height}
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="absolute right-2 top-2 rounded-full bg-neutral-900/80 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
                        Selected
                      </span>
                    ) : null}
                  </button>
                );
              })}
              {designs.length === 0 ? (
                <div className="col-span-full flex items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
                  No saved designs yet. Save a design first.
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
