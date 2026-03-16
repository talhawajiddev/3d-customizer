"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  CustomizerPanel,
  type TableCustomizationState
} from "@/components/CustomizationPanel";
import {
  ProductSelector,
  productOptions,
  type ProductId
} from "@/components/ProductSelector";
import { TableViewer, type TableViewerHandle } from "@/components/Viewer";

const STORAGE_USER_ID_KEY = "table-configurator-user-id";

const initialCustomization: TableCustomizationState = {
  woodType: "oak",
  epoxyColor: "#2563eb",
  legStyle: "standard",
  dimensions: {
    length: 180,
    width: 90,
    height: 75
  }
};

function getProductById(productId: ProductId) {
  return (
    productOptions.find((product) => product.id === productId) ?? productOptions[0]
  );
}

function getLocalUserId() {
  const existing = window.localStorage.getItem(STORAGE_USER_ID_KEY);

  if (existing) {
    return existing;
  }

  const nextUserId = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_USER_ID_KEY, nextUserId);
  return nextUserId;
}

function getProductId(productType: string): ProductId {
  const match = productOptions.find((product) => product.id === productType);
  return (match?.id ?? "dining-table") as ProductId;
}

export function TableConfiguratorApp() {
  const viewerRef = useRef<TableViewerHandle>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] =
    useState<ProductId>("dining-table");
  const [customization, setCustomization] =
    useState<TableCustomizationState>(initialCustomization);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [zoom, setZoom] = useState(0.5);

  useEffect(() => {
    setUserId(getLocalUserId());
  }, []);

  const selectedProduct = useMemo(
    () => getProductById(selectedProductId),
    [selectedProductId]
  );


  return (
    <main className="flex min-h-screen flex-col overflow-auto bg-gradient-to-b from-neutral-200 to-neutral-300">
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col overflow-visible p-4 md:p-5">
        <header className="flex shrink-0 items-center justify-between gap-4 rounded-2xl bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
          <h1 className="text-lg font-medium tracking-tight text-neutral-900 md:text-xl">
            JC Custom Woodworks
          </h1>
          <span className="font-mono text-xs text-neutral-500">{userId ?? "…"}</span>
        </header>

        <div className="relative mt-4 flex min-h-0 flex-1 rounded-3xl bg-gradient-to-b from-neutral-100 to-neutral-300">
          {/* Model viewer fills area */}
          <div className="relative flex-1">
            <div className="absolute inset-4 rounded-3xl border border-neutral-200/80 bg-white shadow-lg">
              <TableViewer
                ref={viewerRef}
                modelUrl={selectedProduct.modelUrl}
                woodType={customization.woodType}
                epoxyColor={customization.epoxyColor}
                legStyle={customization.legStyle}
                dimensions={customization.dimensions}
                zoom={zoom}
              />
            </div>

            {/* Zoom slider on the right edge of viewer */}
            <div className="pointer-events-none absolute inset-y-6 right-3 flex items-center">
              <div className="pointer-events-auto flex h-40 w-5 flex-col items-center justify-between rounded-full border border-white/70 bg-white/80 px-1 py-2 text-[10px] text-neutral-500 shadow-md">
                <span>+</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={zoom * 100}
                  onChange={(event) => setZoom(Number(event.target.value) / 100)}
                  className="h-24 w-1 cursor-pointer appearance-none bg-transparent [writing-mode:vertical-rl]"
                />
                <span>−</span>
              </div>
            </div>

            {/* Floating Customize button */}
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="absolute right-12 top-1/2 flex -translate-y-1/2 items-center gap-3 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-neutral-700 shadow-lg transition hover:bg-neutral-100"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] text-white">
                ⚙
              </span>
              <span>Customize</span>
            </button>
          </div>

          {/* Slide-in customizer panel from the right */}
          <aside
            className={`pointer-events-none absolute inset-y-0 right-0 flex w-full max-w-sm justify-end transition-transform duration-300 ${
              isCustomizerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="pointer-events-auto flex h-full w-full flex-col gap-3 rounded-l-3xl border border-neutral-200/90 bg-white/95 p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-neutral-900">Customizer</h2>
                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(false)}
                  className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-500 hover:border-neutral-300 hover:text-neutral-800"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                <ProductSelector
                  value={selectedProductId}
                  onChange={(product) => {
                    setSelectedProductId(product.id);
                  }}
                  className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
                />

                <CustomizerPanel value={customization} onChange={setCustomization} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
