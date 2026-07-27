import nodemailer from "nodemailer";

// Recipient of the signed contracts. The mailbox itself acts as the backup
// archive of every cession. Comma-separated if several addresses are needed.
const TO_RECIPIENTS = process.env.NOTIFY_EMAIL || "contenu@larosiere.net";

/**
 * Sends the signed cession PDF by email via SMTP (nodemailer).
 * Configured for Outlook / Office 365 by default; any SMTP server works via
 * the SMTP_* environment variables. Returns { sent: false } if not configured.
 */
export async function sendCessionEmail(params: {
  prenom: string;
  nom: string;
  adresse: string;
  pdf: Buffer;
  filename: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const host = process.env.SMTP_HOST || "smtp.office365.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER; // e.g. contenu@larosiere.net
  const pass = process.env.SMTP_PASS; // account or app password
  const from = process.env.EMAIL_FROM || user;

  if (!user || !pass || !from) {
    return { sent: false, reason: "email_not_configured" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from,
      to: TO_RECIPIENTS,
      subject: `Nouvelle cession de droit à l'image — ${params.prenom} ${params.nom}`,
      text:
        `${params.prenom} ${params.nom} vient de signer la cession de droit à l'image.\n\n` +
        `Adresse : ${params.adresse}\n\n` +
        `Le contrat signé est en pièce jointe.`,
      attachments: [
        {
          filename: params.filename,
          content: params.pdf,
          contentType: "application/pdf",
        },
      ],
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}
