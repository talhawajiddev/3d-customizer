"use client";

import { cn } from "@/lib/utils/cn";

export type CustomizerWoodType = "oak" | "walnut" | "ash" | "maple";
export type CustomizerLegStyle = "standard" | "sled" | "xframe" | "panel";

export type TableDimensions = {
  length: number;
  width: number;
  height: number;
};

export type TableCustomizationState = {
  woodType: CustomizerWoodType;
  epoxyColor: string;
  legStyle: CustomizerLegStyle;
  dimensions: TableDimensions;
};

type CustomizerPanelProps = {
  value: TableCustomizationState;
  onChange: (nextValue: TableCustomizationState) => void;
  className?: string;
};

const woodOptions: Array<{
  id: CustomizerWoodType;
  label: string;
  textureUrl: string;
  preview: string;
}> = [
  {
    id: "oak",
    label: "Oak",
    textureUrl: "/textures/oak.jpg",
    preview: "linear-gradient(135deg, #d7b894 0%, #c89f72 45%, #b98857 100%)"
  },
  {
    id: "walnut",
    label: "Walnut",
    textureUrl: "/textures/walnut.jpg",
    preview: "linear-gradient(135deg, #6f4a34 0%, #5a3927 45%, #3d281d 100%)"
  },
  {
    id: "ash",
    label: "Ash",
    textureUrl: "/textures/ash.jpg",
    preview: "linear-gradient(135deg, #d8c8ad 0%, #cdb998 45%, #b59d7c 100%)"
  },
  {
    id: "maple",
    label: "Maple",
    textureUrl: "/textures/maple.jpg",
    preview: "linear-gradient(135deg, #ecd9b5 0%, #e1c693 50%, #cfa972 100%)"
  }
];

const epoxyOptions = [
  { id: "#2563eb", label: "Ocean Blue" },
  { id: "#7c3aed", label: "Violet" },
  { id: "#0891b2", label: "Teal" },
  { id: "#dc2626", label: "Ruby" },
  { id: "#111827", label: "Midnight" }
] as const;

const legOptions: Array<{
  id: CustomizerLegStyle;
  label: string;
  preview: string;
}> = [
  {
    id: "standard",
    label: "Standard",
    preview: "linear-gradient(180deg, transparent 0 20%, #64748b 20% 100%)"
  },
  {
    id: "sled",
    label: "Sled",
    preview:
      "linear-gradient(90deg, #64748b 0 12%, transparent 12% 38%, #64748b 38% 50%, transparent 50% 62%, #64748b 62% 88%, transparent 88% 100%)"
  },
  {
    id: "xframe",
    label: "X-Frame",
    preview:
      "linear-gradient(45deg, transparent 0 42%, #64748b 42% 50%, transparent 50% 100%), linear-gradient(-45deg, transparent 0 42%, #64748b 42% 50%, transparent 50% 100%)"
  },
  {
    id: "panel",
    label: "Panel",
    preview: "linear-gradient(90deg, #475569 0 24%, transparent 24% 76%, #475569 76% 100%)"
  }
];

function updateValue(
  current: TableCustomizationState,
  onChange: (nextValue: TableCustomizationState) => void,
  patch: Partial<TableCustomizationState>
) {
  onChange({
    ...current,
    ...patch
  });
}

function updateDimensions(
  current: TableCustomizationState,
  onChange: (nextValue: TableCustomizationState) => void,
  key: keyof TableDimensions,
  rawValue: string
) {
  const nextNumber = Number(rawValue);

  onChange({
    ...current,
    dimensions: {
      ...current.dimensions,
      [key]: Number.isFinite(nextNumber) ? nextNumber : 0
    }
  });
}

export function CustomizerPanel({
  value,
  onChange,
  className
}: CustomizerPanelProps) {
  return (
    <aside
      className={cn(
        "rounded-xl border border-neutral-200/90 bg-white p-4 shadow-sm",
        className
      )}
    >
      <h2 className="text-sm font-medium text-neutral-800">Customize</h2>
      <p className="mt-0.5 text-xs text-neutral-500">
        Finishes, legs, dimensions.
      </p>

      <div className="mt-4 space-y-4">
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
            Wood
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {woodOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  updateValue(value, onChange, { woodType: option.id })
                }
                className={cn(
                  "overflow-hidden rounded-lg border text-left transition",
                  value.woodType === option.id
                    ? "border-neutral-800 ring-1 ring-neutral-800"
                    : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                )}
              >
                <div
                  className="h-14 w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${option.textureUrl}), ${option.preview}`
                  }}
                />
                <div className="px-2.5 py-2">
                  <span className="text-xs font-medium text-neutral-700">
                    {option.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
            Epoxy
          </h3>
          <div className="flex flex-wrap gap-2">
            {epoxyOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  updateValue(value, onChange, { epoxyColor: option.id })
                }
                className={cn(
                  "flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs transition",
                  value.epoxyColor === option.id
                    ? "border-neutral-800 ring-1 ring-neutral-800"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300"
                )}
              >
                <span
                  className="h-4 w-4 rounded-full border border-neutral-300"
                  style={{ backgroundColor: option.id }}
                />
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
            Legs
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {legOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  updateValue(value, onChange, { legStyle: option.id })
                }
                className={cn(
                  "rounded-lg border p-2.5 text-left transition",
                  value.legStyle === option.id
                    ? "border-neutral-800 ring-1 ring-neutral-800"
                    : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                )}
              >
                <div className="flex h-14 items-end justify-center rounded-md bg-neutral-100">
                  <div
                    className="h-10 w-14 rounded"
                    style={{ backgroundImage: option.preview }}
                  />
                </div>
                <div className="mt-2 text-xs font-medium text-neutral-700">
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
            Dimensions
          </h3>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-[10px] text-neutral-500">L</span>
              <input
                type="number"
                min="0"
                step="1"
                value={value.dimensions.length}
                onChange={(event) =>
                  updateDimensions(value, onChange, "length", event.target.value)
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] text-neutral-500">W</span>
              <input
                type="number"
                min="0"
                step="1"
                value={value.dimensions.width}
                onChange={(event) =>
                  updateDimensions(value, onChange, "width", event.target.value)
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] text-neutral-500">H</span>
              <input
                type="number"
                min="0"
                step="1"
                value={value.dimensions.height}
                onChange={(event) =>
                  updateDimensions(value, onChange, "height", event.target.value)
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
              />
            </label>
          </div>
        </section>
      </div>
    </aside>
  );
}
