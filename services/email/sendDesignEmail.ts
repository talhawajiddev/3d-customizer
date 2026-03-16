import sgMail from "@sendgrid/mail";

import type { DesignRecord } from "@/lib/supabase/client";

type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  notes?: string;
};

type DesignEmailItem = DesignRecord & {
  design_name?: string;
  preview_image_url?: string | null;
};

export type SendDesignEmailPayload = {
  customer: CustomerInfo;
  designs: DesignEmailItem[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatProductLabel(productType: string) {
  return productType
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildDesignSummary(design: DesignEmailItem) {
  return [
    `Design name: ${design.design_name ?? formatProductLabel(design.product_type)}`,
    `Product: ${formatProductLabel(design.product_type)}`,
    `Wood type: ${design.wood_type}`,
    `Epoxy color: ${design.epoxy_color}`,
    `Leg style: ${design.leg_style}`,
    `Dimensions: ${design.length} x ${design.width} x ${design.height}`,
    design.preview_image_url
      ? `Preview image: ${design.preview_image_url}`
      : design.preview_image
        ? `Preview image path: ${design.preview_image}`
        : "Preview image: Not provided"
  ].join("\n");
}

export async function sendDesignEmail(payload: SendDesignEmailPayload) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const toEmail = process.env.SENDGRID_TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    throw new Error("SendGrid environment variables are not configured.");
  }

  sgMail.setApiKey(apiKey);

  const customerSummary = [
    `Name: ${payload.customer.name}`,
    `Phone: ${payload.customer.phone}`,
    `Email: ${payload.customer.email}`,
    payload.customer.notes ? `Notes: ${payload.customer.notes}` : null
  ]
    .filter(Boolean)
    .join("\n");

  const designSummaries = payload.designs
    .map((design, index) => `Design ${index + 1}\n${buildDesignSummary(design)}`)
    .join("\n\n");

  const safeCustomerSummary = escapeHtml(customerSummary);
  const safeDesignSections = payload.designs
    .map((design, index) => {
      const title = escapeHtml(
        design.design_name ?? formatProductLabel(design.product_type)
      );
      const previewImageUrl = design.preview_image_url;

      return `
        <section style="margin-top: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 16px;">
          <h3 style="margin: 0 0 12px; font-size: 18px;">Design ${index + 1}: ${title}</h3>
          <ul style="padding-left: 18px; margin: 0 0 12px;">
            <li>Product: ${escapeHtml(formatProductLabel(design.product_type))}</li>
            <li>Wood type: ${escapeHtml(design.wood_type)}</li>
            <li>Epoxy color: ${escapeHtml(design.epoxy_color)}</li>
            <li>Leg style: ${escapeHtml(design.leg_style)}</li>
            <li>Dimensions: ${design.length} x ${design.width} x ${design.height}</li>
          </ul>
          ${
            previewImageUrl
              ? `<div>
                  <p style="margin: 0 0 8px;"><strong>Preview image</strong></p>
                  <img src="${escapeHtml(previewImageUrl)}" alt="${title}" style="max-width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
                </div>`
              : `<p style="margin: 0; color: #6b7280;">No preview image selected.</p>`
          }
        </section>
      `;
    })
    .join("");

  const safeCustomerName = escapeHtml(payload.customer.name);

  await sgMail.send([
    {
      to: toEmail,
      from: fromEmail,
      replyTo: payload.customer.email,
      subject: `Design submission from ${payload.customer.name}`,
      text: `Customer info\n${customerSummary}\n\nSaved designs\n${designSummaries}`,
      html: `
        <h2>New design submission</h2>
        <p>A customer submitted one or more saved designs.</p>
        <h3>Customer info</h3>
        <pre>${safeCustomerSummary}</pre>
        <h3>Saved designs</h3>
        ${safeDesignSections}
      `
    },
    {
      to: payload.customer.email,
      from: fromEmail,
      subject: "We received your saved designs",
      text: `Thanks ${payload.customer.name}, we received your saved designs and will follow up soon.\n\n${designSummaries}`,
      html: `
        <p>Thanks ${safeCustomerName}, we received your saved designs and will follow up soon.</p>
        <h3>Submitted designs</h3>
        ${safeDesignSections}
      `
    }
  ]);
}
