import { createClient } from "@supabase/supabase-js";

export const DESIGNS_TABLE = "designs";
export const DESIGN_PREVIEWS_BUCKET = "design-previews";

export type DesignRecord = {
  id: string;
  user_id: string;
  product_type: string;
  wood_type: string;
  epoxy_color: string;
  leg_style: string;
  length: number;
  width: number;
  height: number;
  preview_image: string | null;
  created_at: string;
};

export type SaveDesignInput = {
  user_id: string;
  product_type: string;
  wood_type: string;
  epoxy_color: string;
  leg_style: string;
  length: number;
  width: number;
  height: number;
  previewImageBase64?: string | null;
};

let browserClient: ReturnType<typeof createClient> | null = null;

function getSupabaseCredentials() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY
  };
}

export function getSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(url, anonKey);
  }

  return browserClient;
}

export async function saveDesign(
  input: SaveDesignInput
): Promise<DesignRecord> {
  const payload = {
    configuration: {
      user_id: input.user_id,
      product_type: input.product_type,
      wood_type: input.wood_type,
      epoxy_color: input.epoxy_color,
      leg_style: input.leg_style,
      length: input.length,
      width: input.width,
      height: input.height
    },
    screenshotBase64: input.previewImageBase64 ?? null
  };

  const response = await fetch("/api/save-design", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = (await response.json()) as DesignRecord & {
    message?: string;
  };

  if (!response.ok || !data.id) {
    throw new Error(data.message ?? "Unable to save design.");
  }

  return data;
}

export async function getDesignsByUser(
  userId: string
): Promise<DesignRecord[]> {
  const response = await fetch(
    `/api/get-designs?userId=${encodeURIComponent(userId)}`,
    {
      method: "GET"
    }
  );
  const data = (await response.json()) as {
    designs?: DesignRecord[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to load designs.");
  }

  return data.designs ?? [];
}
