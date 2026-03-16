import { randomUUID } from "crypto";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  DESIGN_PREVIEWS_BUCKET,
  DESIGNS_TABLE,
  type DesignRecord
} from "@/lib/supabase/client";
import {
  createSupabaseStorageUploadPayload,
  createViewerScreenshot
} from "@/lib/utils/viewerScreenshot";

const designConfigurationSchema = z.object({
  user_id: z.string().uuid(),
  product_type: z.string().min(1),
  wood_type: z.string().min(1),
  epoxy_color: z.string().min(1),
  leg_style: z.string().min(1),
  length: z.number().nonnegative(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative()
});

const saveDesignInputSchema = z.union([
  z.object({
    configuration: designConfigurationSchema,
    screenshotBase64: z.string().optional().nullable()
  }),
  designConfigurationSchema.extend({
    previewImageBase64: z.string().optional().nullable()
  })
]);

function normalizeInput(input: z.infer<typeof saveDesignInputSchema>) {
  if ("configuration" in input) {
    return {
      configuration: input.configuration,
      screenshotBase64: input.screenshotBase64 ?? null
    };
  }

  const { previewImageBase64, ...configuration } = input;

  return {
    configuration,
    screenshotBase64: previewImageBase64 ?? null
  };
}

export type SaveDesignApiPayload = {
  configuration: z.infer<typeof designConfigurationSchema>;
  screenshotBase64?: string | null;
};

export async function saveDesign(input: unknown): Promise<DesignRecord> {
  const parsed = normalizeInput(saveDesignInputSchema.parse(input));
  const { configuration, screenshotBase64 } = parsed;

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    throw new Error("Unable to initialize Supabase.");
  }

  let previewImage: string | null = null;

  if (screenshotBase64) {
    const screenshot = createViewerScreenshot(screenshotBase64, {
      designName: configuration.product_type,
      bucketFolder: configuration.user_id
    });
    const upload = createSupabaseStorageUploadPayload(screenshot);

    const { error: uploadError } = await supabase.storage
      .from(DESIGN_PREVIEWS_BUCKET)
      .upload(upload.storagePath, upload.bytes, {
        contentType: upload.contentType,
        upsert: true
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    previewImage = upload.storagePath;
  }

  const { data, error } = await supabase
    .from(DESIGNS_TABLE)
    .insert({
      id: randomUUID(),
      user_id: configuration.user_id,
      product_type: configuration.product_type,
      wood_type: configuration.wood_type,
      epoxy_color: configuration.epoxy_color,
      leg_style: configuration.leg_style,
      length: configuration.length,
      width: configuration.width,
      height: configuration.height,
      preview_image: previewImage
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DesignRecord;
}
