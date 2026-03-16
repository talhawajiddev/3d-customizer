"use client";

import type { DesignConfiguration } from "@/lib/utils/designs";

type SavedDesignsProps = {
  designs: DesignConfiguration[];
  isLoading: boolean;
  onLoadDesign: (design: DesignConfiguration) => void;
};

export function SavedDesigns({
  designs,
  isLoading,
  onLoadDesign
}: SavedDesignsProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Saved Designs</h3>
          <p className="text-sm text-slate-400">
            Recent configurations from Supabase or demo seed data.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && (
          <p className="text-sm text-slate-400">Loading saved designs...</p>
        )}

        {!isLoading && designs.length === 0 && (
          <p className="text-sm text-slate-400">
            No saved designs yet. Save one from the panel above.
          </p>
        )}

        {!isLoading &&
          designs.map((design) => (
            <button
              key={design.id ?? `${design.name}-${design.createdAt ?? "draft"}`}
              type="button"
              onClick={() => onLoadDesign(design)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left transition hover:border-violet-400/30 hover:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{design.name}</p>
                  <p className="mt-1 text-sm capitalize text-slate-400">
                    {design.productType} · {design.upholstery}
                  </p>
                </div>
                <span
                  className="mt-1 h-5 w-5 rounded-full border border-white/20"
                  style={{ backgroundColor: design.color }}
                />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                {design.legFinish}
              </p>
            </button>
          ))}
      </div>
    </section>
  );
}
