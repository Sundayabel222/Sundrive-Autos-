import { contact, site } from "./config";

/**
 * Lead notifications (PRD §15).
 *
 * The site must never lose a lead because a third-party provider is down or
 * unconfigured, so every send is best-effort: failures are logged and swallowed,
 * and the lead is already safely stored in the database by the time we get here.
 *
 * To go live, set RESEND_API_KEY + LEAD_NOTIFICATION_EMAIL (email) and
 * WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ALERT_TO (WhatsApp).
 * See the README for setup.
 */

export type LeadKind = "inquiry" | "inspection" | "sourcing" | "vehicle-sold";

const SUBJECTS: Record<LeadKind, string> = {
  inquiry: "New contact enquiry",
  inspection: "New inspection booking",
  sourcing: "New vehicle sourcing request",
  "vehicle-sold": "Vehicle marked as sold",
};

function notificationEmail() {
  return process.env.LEAD_NOTIFICATION_EMAIL || contact.salesEmail;
}

function renderBody(kind: LeadKind, lines: Array<[string, string | number | null | undefined]>) {
  const rows = lines
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  return `${SUBJECTS[kind]} — ${site.name}\n\n${rows}\n\n—\nSent automatically from ${site.url}`;
}

async function sendEmail(kind: LeadKind, body: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[notify:email] RESEND_API_KEY not set — skipping. (${kind})`);
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${site.name} <notifications@${
          process.env.NOTIFICATION_FROM_DOMAIN ?? "sundriveautos.com"
        }>`,
        to: [notificationEmail()],
        subject: `[${site.name}] ${SUBJECTS[kind]}`,
        text: body,
      }),
    });

    if (!response.ok) {
      console.error(`[notify:email] Resend responded ${response.status}`);
    }
  } catch (error) {
    console.error("[notify:email] failed:", error);
  }
}

async function sendWhatsApp(kind: LeadKind, body: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_ALERT_TO;

  if (!token || !phoneNumberId || !to) {
    console.info(`[notify:whatsapp] WhatsApp env vars not set — skipping. (${kind})`);
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: body.slice(0, 4000) },
        }),
      },
    );

    if (!response.ok) {
      console.error(`[notify:whatsapp] Graph API responded ${response.status}`);
    }
  } catch (error) {
    console.error("[notify:whatsapp] failed:", error);
  }
}

/**
 * Fire-and-forget lead alert. Safe to `await` — it resolves even when a
 * provider is missing or errors.
 */
export async function notifyLead(
  kind: LeadKind,
  lines: Array<[string, string | number | null | undefined]>,
) {
  const body = renderBody(kind, lines);
  console.info(`[notify] ${SUBJECTS[kind]}\n${body}`);

  await Promise.allSettled([sendEmail(kind, body), sendWhatsApp(kind, body)]);
}
