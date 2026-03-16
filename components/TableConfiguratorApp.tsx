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

  useEffect(() => {
    setUserId(getLocalUserId());
  }, []);

  const selectedProduct = useMemo(
    () => getProductById(selectedProductId),
    [selectedProductId]
  );


  return (
    <main className="flex h-screen flex-col overflow-hidden bg-neutral-50">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 overflow-hidden p-4 md:p-5">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-200/80 bg-white/80 px-1 pb-4 backdrop-blur-sm">
          <h1 className="text-lg font-medium tracking-tight text-neutral-800 md:text-xl">
            JC Custom Woodworks
          </h1>
          <span className="font-mono text-xs text-neutral-400">{userId ?? "…"}</span>
        </header>

        <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
          {/* Left: 3/4 — Model viewer */}
          <div className="min-h-0 rounded-2xl border border-neutral-200/90 bg-white shadow-sm">
            <TableViewer
              ref={viewerRef}
              modelUrl={selectedProduct.modelUrl}
              woodType={customization.woodType}
              epoxyColor={customization.epoxyColor}
              legStyle={customization.legStyle}
              dimensions={customization.dimensions}
            />
          </div>

          {/* Right: 1/4 — Customizer only (no saved designs, no submit form) */}
          <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto">
            <ProductSelector
              value={selectedProductId}
              onChange={(product) => {
                setSelectedProductId(product.id);
              }}
              className="shrink-0 rounded-xl border border-neutral-200/90 bg-white p-4 shadow-sm"
            />

            <CustomizerPanel value={customization} onChange={setCustomization} />
          </aside>
        </section>
      </div>
    </main>
  );
}
