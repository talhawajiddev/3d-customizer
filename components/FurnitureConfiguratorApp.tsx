"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { CustomizationPanel } from "@/components/CustomizationPanel";
import { ViewerCanvas, type ViewerCanvasHandle } from "@/components/Viewer";
import {
  defaultDesign,
  type DesignConfiguration,
  type SubmitRequestPayload
} from "@/lib/utils/designs";
import { createSupabaseStorageUploadPayload } from "@/lib/utils/viewerScreenshot";

type RequestFormState = Omit<SubmitRequestPayload, "design">;

const initialRequestForm: RequestFormState = {
  fullName: "",
  email: "",
  company: "",
  message: ""
};

export function FurnitureConfiguratorApp() {
  const viewerRef = useRef<ViewerCanvasHandle>(null);
  const [design, setDesign] = useState<DesignConfiguration>(defaultDesign);
  const [savedDesigns, setSavedDesigns] = useState<DesignConfiguration[]>([]);
  const [requestForm, setRequestForm] =
    useState<RequestFormState>(initialRequestForm);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDesigns() {
      try {
        const response = await fetch("/api/get-designs", {
          signal: controller.signal
        });
        const data = (await response.json()) as {
          designs?: DesignConfiguration[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message ?? "Unable to load designs.");
        }

        setSavedDesigns(data.designs ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setFeedback(
            error instanceof Error ? error.message : "Unable to load designs."
          );
        }
      } finally {
        setIsLoadingDesigns(false);
      }
    }

    void loadDesigns();

    return () => controller.abort();
  }, []);

  const selectedDesignLabel = useMemo(
    () => `${design.productType} in ${design.upholstery}`,
    [design]
  );

  async function handleSaveDesign() {
    setIsSaving(true);
    setFeedback(null);

    try {
      const screenshot = viewerRef.current?.captureScreenshot() ?? null;
      const screenshotUpload = screenshot
        ? createSupabaseStorageUploadPayload(screenshot)
        : null;

      const response = await fetch("/api/save-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          design,
          screenshot
        })
      });
      const data = (await response.json()) as {
        design?: DesignConfiguration;
        screenshot?: {
          base64: string;
          fileName: string;
          storagePath: string;
          contentType: "image/png";
        } | null;
        message?: string;
      };

      if (!response.ok || !data.design) {
        throw new Error(data.message ?? "Unable to save design.");
      }

      setDesign(data.design);
      setSavedDesigns((current) => [data.design!, ...current].slice(0, 10));
      setFeedback(
        screenshotUpload
          ? `Design saved successfully. Screenshot captured as base64 and prepared for Supabase storage at ${screenshotUpload.storagePath}.`
          : "Design saved successfully."
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save design.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmitRequest() {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/submit-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...requestForm,
          design
        })
      });
      const data = (await response.json()) as { message?: string; ok?: boolean };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Unable to submit request.");
      }

      setFeedback("Request submitted. A confirmation email has been queued.");
      setRequestForm(initialRequestForm);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Unable to submit request."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
            3D Furniture Configurator
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white md:text-4xl">
                Configure premium furniture in real time.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
                Production-ready starter built with Next.js 14, TailwindCSS,
                React Three Fiber, Supabase, and SendGrid.
              </p>
            </div>
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
              Active configuration: <span className="font-medium">{selectedDesignLabel}</span>
            </div>
          </div>
        </header>

        <section className="grid min-h-[calc(100vh-180px)] gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
          <ViewerCanvas ref={viewerRef} design={design} />
          <CustomizationPanel
            design={design}
            requestForm={requestForm}
            savedDesigns={savedDesigns}
            isLoadingDesigns={isLoadingDesigns}
            isSaving={isSaving}
            isSubmitting={isSubmitting}
            feedback={feedback}
            onDesignChange={setDesign}
            onRequestFormChange={setRequestForm}
            onSaveDesign={handleSaveDesign}
            onSubmitRequest={handleSubmitRequest}
            onLoadDesign={setDesign}
          />
        </section>
      </div>
    </main>
  );
}
