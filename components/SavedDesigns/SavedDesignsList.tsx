"use client";

import Image from "next/image";

import type { DesignRecord } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

type SavedDesignsListProps = {
  designs: DesignRecord[];
  isLoading?: boolean;
  onSelectDesign?: (design: DesignRecord) => void;
  previewImageUrls?: Record<string, string | null | undefined>;
  className?: string;
};

function formatProductLabel(productType: string) {
  return productType
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function SavedDesignsList({
  designs,
  isLoading = false,
  onSelectDesign,
  previewImageUrls,
  className
}: SavedDesignsListProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/10 bg-panel/80 p-5 shadow-soft backdrop-blur",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Saved Designs</h2>
          <p className="text-sm text-slate-400">
            Browse multiple saved configurations as preview cards.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
          {designs.length}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading saved designs...</p>
        ) : null}

        {!isLoading && designs.length === 0 ? (
          <p className="text-sm text-slate-400">
            No saved designs yet. Save a configuration to see it here.
          </p>
        ) : null}

        {!isLoading &&
          designs.map((design) => {
            const previewImageUrl =
              previewImageUrls?.[design.id] ??
              (design.preview_image?.startsWith("http")
                ? design.preview_image
                : null);

            return (
              <button
                key={design.id}
                type="button"
                onClick={() => onSelectDesign?.(design)}
                className={cn(
                  "overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 text-left transition",
                  onSelectDesign
                    ? "hover:border-violet-400/30 hover:bg-slate-900"
                    : "cursor-default"
                )}
              >
                <div className="aspect-[16/9] w-full overflow-hidden border-b border-white/10 bg-slate-900">
                  {previewImageUrl ? (
                    <Image
                      src={previewImageUrl}
                      alt={`${formatProductLabel(design.product_type)} preview`}
                      width={320}
                      height={180}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_45%),linear-gradient(135deg,#0f172a,#111827)]">
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                        No Preview
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {formatProductLabel(design.product_type)}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {design.wood_type} wood with {design.leg_style} legs
                      </p>
                    </div>
                    <span
                      className="mt-1 h-5 w-5 rounded-full border border-white/20"
                      style={{ backgroundColor: design.epoxy_color }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="uppercase tracking-[0.2em] text-slate-500">
                        Length
                      </div>
                      <div className="mt-1 text-sm text-white">{design.length}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="uppercase tracking-[0.2em] text-slate-500">
                        Width
                      </div>
                      <div className="mt-1 text-sm text-white">{design.width}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="uppercase tracking-[0.2em] text-slate-500">
                        Height
                      </div>
                      <div className="mt-1 text-sm text-white">{design.height}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Saved {new Date(design.created_at).toLocaleString()}
                  </p>
                </div>
              </button>
            );
          })}
      </div>
    </section>
  );
}
