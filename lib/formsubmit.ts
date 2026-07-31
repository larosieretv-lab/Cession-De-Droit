// Recipient of the signed contracts. The mailbox acts as the permanent backup
// archive of every cession.
const RECIPIENT = "contenu@larosiere.net";

// FormSubmit is a free form-to-email relay: no account, no API key, no
// environment variable. Two constraints drive this implementation:
//   1. The /ajax/ endpoint silently drops file attachments, so we post to the
//      classic endpoint, which answers with an HTML page.
//   2. Submissions coming from datacenter IPs (Vercel functions) are filtered
//      out, so the request must be sent from the visitor's browser.
const ENDPOINT = `https://formsubmit.co/${RECIPIENT}`;

/**
 * Emails the signed contract with the PDF attached.
 * Never throws: returns { sent: false, reason } so the visitor can still
 * download the contract when delivery fails.
 */
export async function sendContractByEmail(params: {
  prenom: string;
  nom: string;
  adresse: string;
  email?: string;
  pdf: Uint8Array;
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

  // When the signer gives their address, _cc sends them the very same email,
  // PDF attachment included, and _replyto makes answering write back to them.
  // No _autoresponse on purpose: it would be a second, attachment-less email.
  // Note: Outlook/Hotmail files these in Junk, as FormSubmit sends from its own
  // domain rather than larosiere.net.
  const email = params.email?.trim();
  if (email) {
    form.append("email", email);
    form.append("_cc", email);
    form.append("_replyto", email);
  }

  form.append(
    "attachment",
    new Blob([new Uint8Array(params.pdf)], { type: "application/pdf" }),
    params.filename
  );

  try {
    const res = await fetch(ENDPOINT, { method: "POST", body: form });

    if (!res.ok) {
      return { sent: false, reason: `FormSubmit a répondu ${res.status}` };
    }

    // The classic endpoint always answers with HTML and HTTP 200, so failures
    // must be detected in the page body itself.
    const body = await res.text();
    if (/needs Activation|Activate Form/i.test(body)) {
      return { sent: false, reason: "formulaire_non_active" };
    }
    if (!/thank|success/i.test(body)) {
      return { sent: false, reason: "reponse_inattendue_formsubmit" };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}
