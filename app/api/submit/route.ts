import { NextRequest, NextResponse } from "next/server";
import { sendCessionEmail } from "@/lib/email";

export const runtime = "nodejs";

function clean(s: unknown, max: number) {
  return String(s ?? "").trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prenom = clean(body.prenom, 200);
    const nom = clean(body.nom, 200);
    const adresse = clean(body.adresse, 500);
    const pdfBase64 = String(body.pdfBase64 ?? "");
    const filename = clean(body.filename, 200) || "cession.pdf";

    if (!prenom || !nom || !adresse) {
      return NextResponse.json(
        { error: "Prénom, nom et adresse sont obligatoires." },
        { status: 400 }
      );
    }
    if (!pdfBase64) {
      return NextResponse.json(
        { error: "Document manquant." },
        { status: 400 }
      );
    }

    const pdf = Buffer.from(pdfBase64, "base64");

    const result = await sendCessionEmail({ prenom, nom, adresse, pdf, filename });

    return NextResponse.json({
      ok: true,
      emailSent: result.sent,
      reason: result.reason,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur serveur lors de l'envoi." },
      { status: 500 }
    );
  }
}
