import { z } from "zod";

export const productTypes = ["sofa", "chair", "table"] as const;
export const upholsteryOptions = ["linen", "leather", "velvet"] as const;
export const legFinishes = ["oak", "walnut", "matte-black"] as const;

export const designSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(80),
  productType: z.enum(productTypes),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "A hex color is required."),
  upholstery: z.enum(upholsteryOptions),
  legFinish: z.enum(legFinishes),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  createdAt: z.string().datetime().optional()
});

export const designScreenshotSchema = z.object({
  base64: z
    .string()
    .regex(/^data:image\/png;base64,/, "Screenshot must be a PNG data URL."),
  fileName: z.string().min(1),
  storagePath: z.string().min(1),
  contentType: z.literal("image/png")
});

export const saveDesignRequestSchema = z.object({
  design: designSchema,
  screenshot: designScreenshotSchema.optional()
});

export const requestSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(1000),
  design: designSchema
});

export type ProductType = (typeof productTypes)[number];
export type UpholsteryOption = (typeof upholsteryOptions)[number];
export type LegFinish = (typeof legFinishes)[number];
export type DesignConfiguration = z.infer<typeof designSchema>;
export type DesignScreenshotPayload = z.infer<typeof designScreenshotSchema>;
export type SubmitRequestPayload = z.infer<typeof requestSchema>;
export type SaveDesignRequestPayload = z.infer<typeof saveDesignRequestSchema>;
export type DatabaseDesignRow = {
  id?: string;
  name: string;
  product_type: ProductType;
  color: string;
  upholstery: UpholsteryOption;
  leg_finish: LegFinish;
  notes: string | null;
  created_at: string;
};

export const defaultDesign: DesignConfiguration = {
  name: "Signature Lounge",
  productType: "sofa",
  color: "#8b5cf6",
  upholstery: "linen",
  legFinish: "oak",
  notes: ""
};

export const colorSwatches = [
  { name: "Violet", value: "#8b5cf6" },
  { name: "Slate", value: "#334155" },
  { name: "Emerald", value: "#059669" },
  { name: "Amber", value: "#d97706" },
  { name: "Rose", value: "#e11d48" }
] as const;

export const demoSavedDesigns: DesignConfiguration[] = [
  {
    id: "54f3f275-f69d-4eb2-844f-0f47d85e06a6",
    name: "Hotel Lobby Sofa",
    productType: "sofa",
    color: "#334155",
    upholstery: "velvet",
    legFinish: "walnut",
    notes: "Extra-deep seating for public lounge areas.",
    createdAt: "2026-03-12T10:45:00.000Z"
  },
  {
    id: "f328e86b-b80f-4ffa-a247-c45543da9c66",
    name: "Dining Accent Chair",
    productType: "chair",
    color: "#d97706",
    upholstery: "leather",
    legFinish: "matte-black",
    notes: "Pairs with walnut dining tables.",
    createdAt: "2026-03-13T15:20:00.000Z"
  }
];

export function isSupabaseConfigured() {
  return Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL) &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.SUPABASE_ANON_KEY)
  );
}

export function isSendGridConfigured() {
  return Boolean(
    process.env.SENDGRID_API_KEY &&
      process.env.SENDGRID_FROM_EMAIL &&
      process.env.SENDGRID_TO_EMAIL
  );
}

export function toDatabaseDesign(
  design: DesignConfiguration
): DatabaseDesignRow {
  return {
    id: design.id,
    name: design.name,
    product_type: design.productType,
    color: design.color,
    upholstery: design.upholstery,
    leg_finish: design.legFinish,
    notes: design.notes || null,
    created_at: design.createdAt ?? new Date().toISOString()
  };
}

export function fromDatabaseDesign(row: DatabaseDesignRow): DesignConfiguration {
  return {
    id: row.id,
    name: row.name,
    productType: row.product_type,
    color: row.color,
    upholstery: row.upholstery,
    legFinish: row.leg_finish,
    notes: row.notes ?? "",
    createdAt: row.created_at
  };
}
