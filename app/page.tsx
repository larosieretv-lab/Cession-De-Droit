"use client";

import { useRef, useState } from "react";
import SignaturePad, { SignaturePadHandle } from "@/components/SignaturePad";
import ContractTerms from "@/components/ContractTerms";
import { generateCessionPdf } from "@/lib/pdf";
import { sendContractByEmail } from "@/lib/formsubmit";

type Status = "idle" | "submitting" | "success" | "error";

export default function Home() {
  const sigRef = useRef<SignaturePadHandle>(null);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!prenom.trim() || !nom.trim() || !adresse.trim()) {
      setStatus("error");
      setMessage("Merci de remplir votre prénom, nom et adresse.");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      setMessage("L\u2019adresse email saisie ne semble pas valide.");
      return;
    }
    if (!accepted) {
      setStatus("error");
      setMessage("Merci de lire le contrat et de cocher « J'accepte » avant de signer.");
      return;
    }
    if (sigRef.current?.isEmpty()) {
      setStatus("error");
      setMessage("Merci de signer dans le cadre prévu.");
      return;
    }

    setStatus("submitting");
    try {
      const signature = sigRef.current?.toDataURL() ?? "";

      // Generate the filled contract PDF directly in the browser.
      const pdf = await generateCessionPdf({
        prenom,
        nom,
        adresse,
        signature,
        date: new Date(),
      });

      const safeName = `${nom}_${prenom}`.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `cession_${safeName}.pdf`;

      // Make the PDF available for download/preview.
      const blob = new Blob([pdf as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      // Email the contract straight from the browser: FormSubmit filters out
      // submissions coming from datacenter IPs, so this cannot run server-side.
      const result = await sendContractByEmail({
        prenom,
        nom,
        adresse,
        email,
        pdf,
        filename,
      });
      const emailNote = result.sent
        ? email.trim()
          ? ` Le PDF a été envoyé à l'Office de Tourisme, et une confirmation part vers ${email.trim()}. Pensez à enregistrer le PDF ci-dessous pour en garder une copie.`
          : " Le PDF a bien été envoyé à l'Office de Tourisme."
        : ` EMAIL NON ENVOYÉ : ${result.reason}. Le PDF reste téléchargeable ci-dessous.`;

      setStatus("success");
      setMessage(
        "Merci ! Votre cession de droit à l'image a bien été enregistrée." +
          emailNote
      );
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Une erreur est survenue. Réessayez.");
    }
  };

  if (status === "success") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-success" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold">Merci {prenom} !</h1>
        <p className="mt-2 text-ink-soft">{message}</p>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download={`cession_${nom}_${prenom}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ink mt-6"
          >
            Enregistrer mon contrat (PDF)
          </a>
        )}
        <button
          onClick={() => {
            setStatus("idle");
            setPrenom("");
            setNom("");
            setAdresse("");
            setEmail("");
            setPdfUrl(null);
            setAccepted(false);
            setScrolledToEnd(false);
            sigRef.current?.clear();
          }}
          className="btn-quiet mt-3"
        >
          Nouvelle signature
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-10 pt-8">
      <header className="mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-larosiere.png"
          alt="La Rosière — Espace San Bernardo"
          className="mb-4 h-16 w-auto"
        />
        <p className="text-xs font-semibold uppercase tracking-wide text-sun-ink">
          Office de Tourisme de La Rosière
        </p>
        <h1 className="mt-1 font-serif text-[28px] leading-tight text-ink">
          Cession de droit à l&apos;image
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Renseignez vos informations et signez ci-dessous. Un contrat PDF
          récapitulatif vous sera fourni.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Prénom">
          <input
            type="text"
            autoComplete="given-name"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="input"
            placeholder="Ex : Camille"
          />
        </Field>

        <Field label="Nom">
          <input
            type="text"
            autoComplete="family-name"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="input"
            placeholder="Ex : Durand"
          />
        </Field>

        <Field label="Adresse">
          <textarea
            autoComplete="street-address"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            className="input min-h-[84px] resize-none"
            placeholder="Numéro, rue, code postal, ville"
          />
        </Field>

        <Field label="Votre email (facultatif)">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="camille.durand@email.com"
          />
          <p className="mt-1.5 text-xs text-ink-faint">
            Pour recevoir une confirmation de votre signature par email.
          </p>
        </Field>

        <ContractTerms
          prenom={prenom}
          nom={nom}
          adresse={adresse}
          onReachEnd={() => setScrolledToEnd(true)}
        />

        <label
          className={`flex items-start gap-3 rounded-xl border p-3.5 transition ${
            scrolledToEnd
              ? "cursor-pointer border-line-strong bg-surface"
              : "cursor-not-allowed border-line bg-sunk opacity-60"
          }`}
        >
          <input
            type="checkbox"
            checked={accepted}
            disabled={!scrolledToEnd}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-[var(--sun-ink)]"
          />
          <span className="text-sm text-ink-soft">
            J&apos;ai lu et j&apos;accepte les termes de la présente cession de
            droit à l&apos;image.
          </span>
        </label>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink">
              Signature
            </label>
            <button
              type="button"
              onClick={() => sigRef.current?.clear()}
              className="text-sm font-medium text-sun-ink underline decoration-line-strong underline-offset-2"
            >
              Effacer
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-line-strong bg-surface">
            <SignaturePad
              ref={sigRef}
              className="h-44 w-full touch-none bg-white"
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-faint">
            Signez avec votre doigt (mobile) ou la souris.
          </p>
        </div>

        {message && status === "error" && (
          <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
            {message}
          </p>
        )}

        {/* Always enabled: a disabled button hides why it cannot be used, the
            validation message above says it instead. */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-ink"
        >
          {status === "submitting"
            ? "Envoi en cours…"
            : "Valider et enregistrer"}
        </button>

        <p className="pt-1 text-center text-xs leading-relaxed text-ink-faint">
          En validant, vous acceptez les termes de la cession de droit à
          l&apos;image au profit de l&apos;Office de Tourisme de La Rosière.
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}
