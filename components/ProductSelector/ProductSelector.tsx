"use client";

import { cn } from "@/lib/utils/cn";

export const PRODUCT_MODELS = {
  "dining-table": "/models/test.glb",
  "coffee-table": "/models/coffee-table.glb",
  "side-table": "/models/side-table.glb",
  bench: "/models/bench.glb"
} as const;

export type ProductId = keyof typeof PRODUCT_MODELS;

export type ProductOption = {
  id: ProductId;
  label: string;
  description: string;
  modelUrl: string;
  previewImage: string;
  previewFallback: string;
};

type ProductSelectorProps = {
  value: ProductId;
  onChange: (product: ProductOption) => void;
  className?: string;
};

export const productOptions: ProductOption[] = [
  {
    id: "dining-table",
    label: "Dining Table",
    description: "Full-size statement table for dining rooms.",
    modelUrl: PRODUCT_MODELS["dining-table"],
    previewImage: "/models/previews/dining-table.jpg",
    previewFallback:
      "linear-gradient(135deg, #1e293b 0%, #334155 55%, #0f172a 100%)"
  },
  {
    id: "coffee-table",
    label: "Coffee Table",
    description: "Low-profile center table for lounge spaces.",
    modelUrl: PRODUCT_MODELS["coffee-table"],
    previewImage: "/models/previews/coffee-table.jpg",
    previewFallback:
      "linear-gradient(135deg, #312e81 0%, #4338ca 45%, #1e1b4b 100%)"
  },
  {
    id: "side-table",
    label: "Side Table",
    description: "Compact accent table for bedside or corner use.",
    modelUrl: PRODUCT_MODELS["side-table"],
    previewImage: "/models/previews/side-table.jpg",
    previewFallback:
      "linear-gradient(135deg, #14532d 0%, #166534 48%, #052e16 100%)"
  },
  {
    id: "bench",
    label: "Bench",
    description: "Minimal seating piece with swappable finishes.",
    modelUrl: PRODUCT_MODELS.bench,
    previewImage: "/models/previews/bench.jpg",
    previewFallback:
      "linear-gradient(135deg, #7c2d12 0%, #c2410c 52%, #431407 100%)"
  }
];

export function ProductSelector({
  value,
  onChange,
  className
}: ProductSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h2 className="text-sm font-medium text-neutral-800">Product</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {productOptions.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onChange(product)}
            className={cn(
              "overflow-hidden rounded-lg border text-left transition",
              value === product.id
                ? "border-neutral-800 ring-1 ring-neutral-800"
                : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
            )}
          >
            <div
              className="h-20 w-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${product.previewImage}), ${product.previewFallback}`
              }}
            />
            <div className="px-3 py-2">
              <span className="text-xs font-medium text-neutral-700">
                {product.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
