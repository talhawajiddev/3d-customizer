"use client";

import {
  COLOR_SWATCHES,
  LEG_FINISHES,
  PRODUCT_TYPES,
  UPHOLSTERY_OPTIONS
} from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import type {
  DesignConfiguration,
  SubmitRequestPayload
} from "@/lib/utils/designs";

import { SavedDesigns } from "@/components/SavedDesigns";

type RequestFormState = Omit<SubmitRequestPayload, "design">;

type CustomizationPanelProps = {
  design: DesignConfiguration;
  requestForm: RequestFormState;
  savedDesigns: DesignConfiguration[];
  isLoadingDesigns: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  feedback: string | null;
  onDesignChange: (design: DesignConfiguration) => void;
  onRequestFormChange: (form: RequestFormState) => void;
  onSaveDesign: () => Promise<void>;
  onSubmitRequest: () => Promise<void>;
  onLoadDesign: (design: DesignConfiguration) => void;
};

export function CustomizationPanel({
  design,
  requestForm,
  savedDesigns,
  isLoadingDesigns,
  isSaving,
  isSubmitting,
  feedback,
  onDesignChange,
  onRequestFormChange,
  onSaveDesign,
  onSubmitRequest,
  onLoadDesign
}: CustomizationPanelProps) {
  return (
    <aside className="flex min-h-[520px] flex-col gap-4">
      <section className="rounded-3xl border border-white/10 bg-panel/80 p-5 shadow-soft backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Customization Panel</h2>
            <p className="mt-1 text-sm text-slate-400">
              Adjust materials, finishes, and request production follow-up.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
            34%
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Design name
            </label>
            <input
              value={design.name}
              onChange={(event) =>
                onDesignChange({ ...design, name: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-violet-400"
              placeholder="e.g. Signature Lounge"
            />
          </div>

          <div>
            <p className="mb-2 block text-sm font-medium text-slate-200">Product</p>
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_TYPES.map((product) => (
                <button
                  key={product}
                  type="button"
                  onClick={() => onDesignChange({ ...design, productType: product })}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-sm font-medium capitalize transition",
                    design.productType === product
                      ? "border-violet-400 bg-violet-500/20 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  )}
                >
                  {product}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 block text-sm font-medium text-slate-200">Color palette</p>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  onClick={() => onDesignChange({ ...design, color: swatch.value })}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-[11px] transition",
                    design.color === swatch.value
                      ? "border-violet-400 bg-violet-500/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                  )}
                >
                  <span
                    className="h-8 w-8 rounded-full border border-white/20"
                    style={{ backgroundColor: swatch.value }}
                  />
                  {swatch.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Upholstery
              </label>
              <select
                value={design.upholstery}
                onChange={(event) =>
                  onDesignChange({
                    ...design,
                    upholstery: event.target.value as DesignConfiguration["upholstery"]
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
              >
                {UPHOLSTERY_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Leg finish
              </label>
              <select
                value={design.legFinish}
                onChange={(event) =>
                  onDesignChange({
                    ...design,
                    legFinish: event.target.value as DesignConfiguration["legFinish"]
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
              >
                {LEG_FINISHES.map((finish) => (
                  <option key={finish} value={finish} className="bg-slate-900">
                    {finish}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Notes
            </label>
            <textarea
              rows={3}
              value={design.notes ?? ""}
              onChange={(event) =>
                onDesignChange({ ...design, notes: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
              placeholder="Add project context, dimensions, or finish notes."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void onSaveDesign()}
              className="rounded-2xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save design"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void onSubmitRequest()}
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit request"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-sm font-semibold text-white">Request details</h3>
            <div className="mt-3 grid gap-3">
              <input
                value={requestForm.fullName}
                onChange={(event) =>
                  onRequestFormChange({
                    ...requestForm,
                    fullName: event.target.value
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
                placeholder="Full name"
              />
              <input
                type="email"
                value={requestForm.email}
                onChange={(event) =>
                  onRequestFormChange({
                    ...requestForm,
                    email: event.target.value
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
                placeholder="Email"
              />
              <input
                value={requestForm.company ?? ""}
                onChange={(event) =>
                  onRequestFormChange({
                    ...requestForm,
                    company: event.target.value
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
                placeholder="Company (optional)"
              />
              <textarea
                rows={4}
                value={requestForm.message}
                onChange={(event) =>
                  onRequestFormChange({
                    ...requestForm,
                    message: event.target.value
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
                placeholder="Tell us about your project, quantity, and delivery timeline."
              />
            </div>
          </div>

          {feedback && (
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
              {feedback}
            </div>
          )}
        </div>
      </section>

      <SavedDesigns
        designs={savedDesigns}
        isLoading={isLoadingDesigns}
        onLoadDesign={onLoadDesign}
      />
    </aside>
  );
}
