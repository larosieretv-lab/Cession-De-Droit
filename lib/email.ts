// Recipient of the signed contracts. The mailbox itself acts as the backup
// archive of every cession.
const RECIPIENT = process.env.NOTIFY_EMAIL || "contenu@larosiere.net";

// FormSubmit is a free form-to-email relay that requires no account and no
// credentials: we simply POST to an endpoint built from the recipient address.
// The very first submission triggers a one-time confirmation email that must
// be validated by the recipient; afterwards every contract is delivered with
// the signed PDF attached (10 MB limit per submission).
//
// Note: the /ajax/ endpoint silently drops file attachments, so we post to the
// classic endpoint, which returns an HTML page we simply ignore.
const ENDPOINT = `https://formsubmit.co/${encodeURIComponent(RECIPIENT)}`;

// FormSubmit rejects requests without an origin, so we always advertise the
// deployed site. VERCEL_PROJECT_PRODUCTION_URL is provided by Vercel at runtime.
const SITE_ORIGIN = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://cession-de-droit.vercel.app";

/**
 * Sends the signed cession PDF by email through FormSubmit.
 * Never throws: returns { sent: false, reason } so the user can still download
 * the contract even when delivery fails.
 */
export async function sendCessionEmail(params: {
  prenom: string;
  nom: string;
  adresse: string;
  pdf: Buffer;
  filename: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const form = new FormData();
  form.append(
    "_subject",
    `Nouvelle cession de droit à l'image — ${params.prenom} ${params.nom}`
  );
  form.append("_template", "table");
  form.append("_captcha", "false");
  form.append("Prénom", params.prenom);
  form.append("Nom", params.nom);
  form.append("Adresse", params.adresse);
  form.append("Date de signature", new Date().toLocaleString("fr-FR"));
  form.append(
    "attachment",
    new Blob([new Uint8Array(params.pdf)], { type: "application/pdf" }),
    params.filename
  );

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Origin: SITE_ORIGIN,
        Referer: `${SITE_ORIGIN}/`,
      },
      body: form,
      redirect: "follow",
    });

    if (!res.ok) {
      return { sent: false, reason: `FormSubmit a répondu ${res.status}` };
    }

    // The classic endpoint answers with HTML; an unactivated form is reported
    // in the page body rather than through an HTTP error code.
    const body = await res.text();
    if (/needs Activation|Activate Form/i.test(body)) {
      return { sent: false, reason: "formulaire_non_active" };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}
