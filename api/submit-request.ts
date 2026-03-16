import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  DESIGN_PREVIEWS_BUCKET,
  DESIGNS_TABLE,
  type DesignRecord
} from "@/lib/supabase/client";
import { isSendGridConfigured, isSupabaseConfigured } from "@/lib/utils/designs";
import { sendDesignEmail } from "@/services/email/sendDesignEmail";

const submitRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30),
  email: z.string().email(),
  notes: z.string().trim().max(500).default(""),
  user_id: z.string().uuid().optional(),
  configuration: z
    .object({
      user_id: z.string().uuid()
    })
    .optional()
});

export async function submitRequest(input: unknown) {
  const payload = submitRequestSchema.parse(input);
  const userId = payload.user_id ?? payload.configuration?.user_id;

  if (!isSendGridConfigured()) {
    throw new Error("SendGrid is not configured.");
  }

  if (!userId) {
    throw new Error("A user_id is required to submit saved designs.");
  }

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    throw new Error("Unable to initialize Supabase.");
  }

  const { data: designs, error: designsError } = await supabase
    .from(DESIGNS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (designsError) {
    throw new Error(designsError.message);
  }

  const savedDesigns = (designs as DesignRecord[] | null) ?? [];

  if (savedDesigns.length === 0) {
    throw new Error("No saved designs were found for this user.");
  }

  const previewPaths = savedDesigns
    .map((design) => design.preview_image)
    .filter((value): value is string => Boolean(value));

  let signedUrlMap = new Map<string, string>();

  if (previewPaths.length > 0) {
    const { data: signedUrls, error: signedUrlError } = await supabase.storage
      .from(DESIGN_PREVIEWS_BUCKET)
      .createSignedUrls(previewPaths, 60 * 60);

    if (signedUrlError) {
      throw new Error(signedUrlError.message);
    }

    const entries = (signedUrls ?? [])
      .filter((item) => item.path != null && item.signedUrl != null)
      .map((item) => [item.path!, item.signedUrl!] as [string, string]);
    signedUrlMap = new Map(entries);
  }

  await sendDesignEmail({
    customer: {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      notes: payload.notes
    },
    designs: savedDesigns.map((design) => ({
      ...design,
      design_name: `${design.product_type}-${design.id.slice(0, 8)}`,
      preview_image_url: design.preview_image
        ? signedUrlMap.get(design.preview_image) ?? null
        : null
    }))
  });

  const { data: requestRecord, error: requestError } = await supabase
    .from("design_requests")
    .insert({
      user_id: userId,
      customer_name: payload.name,
      customer_phone: payload.phone,
      customer_email: payload.email,
      notes: payload.notes || null,
      design_count: savedDesigns.length,
      design_ids: savedDesigns.map((design) => design.id),
      created_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (requestError) {
    throw new Error(requestError.message);
  }

  return {
    ok: true,
    message: "Design request submitted successfully.",
    request: requestRecord
  };
}
