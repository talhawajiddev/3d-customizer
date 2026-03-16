export type ViewerScreenshot = {
  base64: string;
  fileName: string;
  storagePath: string;
  contentType: "image/png";
};

export type SupabaseStorageUploadPayload = ViewerScreenshot & {
  bytes: Uint8Array;
};

type CreateViewerScreenshotOptions = {
  designName?: string;
  bucketFolder?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function decodeBase64(base64: string) {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(base64, "base64"));
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function createViewerScreenshot(
  base64: string,
  options: CreateViewerScreenshotOptions = {}
): ViewerScreenshot {
  const timestamp = Date.now();
  const safeDesignName = slugify(options.designName || "design-preview");
  const fileName = `${safeDesignName}-${timestamp}.png`;
  const folder = options.bucketFolder || "design-previews";

  return {
    base64,
    fileName,
    storagePath: `${folder}/${fileName}`,
    contentType: "image/png"
  };
}

export function createSupabaseStorageUploadPayload(
  screenshot: ViewerScreenshot
): SupabaseStorageUploadPayload {
  const [, base64Payload = ""] = screenshot.base64.split(",", 2);

  return {
    ...screenshot,
    bytes: decodeBase64(base64Payload)
  };
}
