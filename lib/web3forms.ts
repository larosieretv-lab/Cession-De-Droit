import { CONTRACT } from "./contract";

// Access key from https://web3forms.com (free). This key is meant to be public
// (it lives in the client bundle), so it is safe to hardcode as the default.
// It can still be overridden at build time via NEXT_PUBLIC_WEB3FORMS_KEY.
// Recipient = the email tied to this key (contenu@larosiere.net); the address
// in `CC_RECIPIENTS` is added in copy.
const WEB3FORMS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_KEY ||
  "c7bdbbd3-12d0-4f18-b45f-68c08dc9da99";

// Extra recipient(s) in copy, comma-separated.
const CC_RECIPIENTS = "cm@larosiere.net";

export function isEmailConfigured(): boolean {
  return WEB3FORMS_KEY.length > 0;
}

/**
 * Sends the signed contract by email via Web3Forms, with the PDF attached.
 * Works fully client-side (compatible with a static site / GitHub Pages).
 */
export async function sendContractByEmail(params: {
  prenom: string;
  nom: string;
  adresse: string;
  pdf: Uint8Array;
  filename: string;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!isEmailConfigured()) {
    return { sent: false, reason: "email_not_configured" };
  }

  const formData = new FormData();
  formData.append("access_key", WEB3FORMS_KEY);
  formData.append(
    "subject",
    `Nouvelle cession de droit à l'image — ${params.prenom} ${params.nom}`
  );
  formData.append("from_name", "Cession de droit à l'image");
  formData.append("cc", CC_RECIPIENTS);
  formData.append("Prénom", params.prenom);
  formData.append("Nom", params.nom);
  formData.append("Adresse", params.adresse);
  formData.append("Cessionnaire", CONTRACT.cessionnaire);
  formData.append(
    "message",
    `${params.prenom} ${params.nom} vient de signer la cession de droit à l'image. Le contrat signé est en pièce jointe.`
  );

  // Attach the generated PDF.
  const blob = new Blob([params.pdf as unknown as BlobPart], {
    type: "application/pdf",
  });
  formData.append("attachment", blob, params.filename);

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data?.success) return { sent: true };
    return { sent: false, reason: data?.message || "web3forms_error" };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}
