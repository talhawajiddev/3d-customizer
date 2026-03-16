import sgMail from "@sendgrid/mail";

type SubmitRequestPayload = {
  name: string;
  phone: string;
  email: string;
  notes: string;
  configuration: {
    user_id: string;
    product_type: string;
    wood_type: string;
    epoxy_color: string;
    leg_style: string;
    length: number;
    width: number;
    height: number;
  };
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendRequestConfirmation(payload: SubmitRequestPayload) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const toEmail = process.env.SENDGRID_TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    throw new Error("SendGrid environment variables are not configured.");
  }

  sgMail.setApiKey(apiKey);

  const summary = [
    `Product: ${payload.configuration.product_type}`,
    `Wood type: ${payload.configuration.wood_type}`,
    `Epoxy color: ${payload.configuration.epoxy_color}`,
    `Leg style: ${payload.configuration.leg_style}`,
    `Dimensions: ${payload.configuration.length} x ${payload.configuration.width} x ${payload.configuration.height}`,
    `Phone: ${payload.phone}`
  ]
    .filter(Boolean)
    .join("\n");

  const safeSummary = escapeHtml(summary);
  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeMessage = escapeHtml(payload.notes);

  await sgMail.send([
    {
      to: toEmail,
      from: fromEmail,
      replyTo: payload.email,
      subject: `New configurator request from ${payload.name}`,
      text: `${payload.name} submitted a configurator request.\n\n${summary}\n\nNotes:\n${payload.notes}`,
      html: `<h2>New configurator request</h2><p><strong>${safeName}</strong> (${safeEmail}) submitted a request.</p><pre>${safeSummary}</pre><p>${safeMessage}</p>`
    },
    {
      to: payload.email,
      from: fromEmail,
      subject: "We received your furniture configuration request",
      text: `Thanks ${payload.name}, we received your request and will follow up soon.\n\n${summary}`,
      html: `<p>Thanks ${safeName}, we received your request and will follow up soon.</p><pre>${safeSummary}</pre>`
    }
  ]);
}
