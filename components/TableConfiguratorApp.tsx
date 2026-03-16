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
import { SubmitRequestForm } from "@/components/SubmitRequestForm";
import { TableViewer, type TableViewerHandle } from "@/components/Viewer";
import {
  getDesignsByUser,
  saveDesign,
  type DesignRecord
} from "@/lib/supabase/client";

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
  const [savedDesigns, setSavedDesigns] = useState<DesignRecord[]>([]);
  const [previewDataUrls, setPreviewDataUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getLocalUserId());
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const uid = userId;
    let isActive = true;

    async function loadDesigns() {
      try {
        setIsLoading(true);
        const designs = await getDesignsByUser(uid);

        if (isActive) {
          setSavedDesigns(designs);
        }
      } catch (error) {
        if (isActive) {
          setFeedback(
            error instanceof Error ? error.message : "Unable to load designs."
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadDesigns();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const selectedProduct = useMemo(
    () => getProductById(selectedProductId),
    [selectedProductId]
  );

  async function handleSaveDesign() {
    if (!userId) {
      setFeedback("Unable to determine the current user session.");
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const screenshot = viewerRef.current?.captureScreenshot() ?? null;
      const savedDesign = await saveDesign({
        user_id: userId,
        product_type: selectedProduct.id,
        wood_type: customization.woodType,
        epoxy_color: customization.epoxyColor,
        leg_style: customization.legStyle,
        length: customization.dimensions.length,
        width: customization.dimensions.width,
        height: customization.dimensions.height,
        previewImageBase64: screenshot?.base64 ?? null
      });

      setSavedDesigns((current) => [savedDesign, ...current].slice(0, 20));
      if (screenshot?.base64) {
        setPreviewDataUrls((prev) => ({ ...prev, [savedDesign.id]: screenshot.base64 }));
      }
      setFeedback("Design saved to Supabase successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save design.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleLoadDesign(design: DesignRecord) {
    setSelectedProductId(getProductId(design.product_type));
    setCustomization({
      woodType: design.wood_type as TableCustomizationState["woodType"],
      epoxyColor: design.epoxy_color,
      legStyle: design.leg_style as TableCustomizationState["legStyle"],
      dimensions: {
        length: Number(design.length),
        width: Number(design.width),
        height: Number(design.height)
      }
    });
    setFeedback("Saved design loaded into the viewer.");
  }

  function getPreviewUrl(design: DesignRecord) {
    return (
      previewDataUrls[design.id] ??
      (design.preview_image?.startsWith("http")
        ? design.preview_image
        : design.preview_image?.startsWith("data:")
        ? design.preview_image
        : null)
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-neutral-50">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 overflow-hidden p-4 md:p-5">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-200/80 bg-white/80 px-1 pb-4 backdrop-blur-sm">
          <h1 className="text-lg font-medium tracking-tight text-neutral-800 md:text-xl">
            Table Configurator
          </h1>
          <span className="font-mono text-xs text-neutral-400">
            {userId ?? "…"}
          </span>
        </header>

        <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
          {/* Left: 3/4 — Model viewer (height-limited) + saved preview strip */}
          <div className="flex min-h-0 flex-col gap-3">
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm">
              <TableViewer
                ref={viewerRef}
                modelUrl={selectedProduct.modelUrl}
                woodType={customization.woodType}
                epoxyColor={customization.epoxyColor}
                legStyle={customization.legStyle}
                dimensions={customization.dimensions}
              />
            </div>

            {/* Saved design preview strip */}
            <div className="shrink-0 rounded-xl border border-neutral-200/80 bg-white/90 px-3 py-2.5 shadow-sm">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                Saved
              </p>
              {isLoading ? (
                <p className="text-sm text-neutral-400">Loading…</p>
              ) : savedDesigns.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  Save a design to see previews here.
                </p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  {savedDesigns.map((design) => {
                    const previewUrl = getPreviewUrl(design);
                    return (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => handleLoadDesign(design)}
                        className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 transition hover:border-neutral-300 hover:bg-neutral-50"
                      >
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase text-neutral-400">
                            No preview
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: 1/4 — Customizer */}
          <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto">
            <ProductSelector
              value={selectedProductId}
              onChange={(product) => {
                setSelectedProductId(product.id);
                setFeedback(null);
              }}
              className="shrink-0 rounded-xl border border-neutral-200/90 bg-white p-4 shadow-sm"
            />

            <CustomizerPanel value={customization} onChange={setCustomization} />

            <section className="shrink-0 rounded-xl border border-neutral-200/90 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void handleSaveDesign()}
                  disabled={isSaving || !userId}
                  className="rounded-xl bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : "Save Design"}
                </button>
                {feedback ? (
                  <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                    {feedback}
                  </p>
                ) : null}
              </div>
            </section>

            <SubmitRequestForm
              userId={userId}
              designs={savedDesigns}
              getPreviewUrl={getPreviewUrl}
              onSubmitted={setFeedback}
            />
          </aside>
        </section>
      </div>
    </main>
  );
}
