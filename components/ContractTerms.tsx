"use client";

import { useEffect, useRef, useState } from "react";
import { buildContractParagraphs, CONTRACT } from "@/lib/contract";

/**
 * Scrollable box showing the full contract. The user must scroll to the very
 * bottom before the parent is allowed to enable acceptance.
 */
export default function ContractTerms({
  prenom,
  nom,
  adresse,
  onReachEnd,
}: {
  prenom: string;
  nom: string;
  adresse: string;
  onReachEnd: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [atEnd, setAtEnd] = useState(false);

  // Only show the actual clauses (Articles 1 to 4) and the closing
  // "Fait à … le …" line — not the identity preamble.
  const paragraphs = buildContractParagraphs({
    prenom: prenom || "…",
    nom: nom || "…",
    adresse: adresse || "…",
    date: new Date(),
  }).filter((p) => p.heading || p.text.startsWith("Fait à"));

  const checkEnd = () => {
    const el = scrollRef.current;
    if (!el) return;
    const reached =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (reached && !atEnd) {
      setAtEnd(true);
      onReachEnd();
    }
  };

  useEffect(() => {
    // If the content is short enough to not scroll, consider it read.
    const el = scrollRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 8) {
      setAtEnd(true);
      onReachEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700">
        Contrat à lire attentivement
      </p>
      <div
        ref={scrollRef}
        onScroll={checkEnd}
        className="h-56 overflow-y-auto rounded-xl border border-slate-300 bg-white p-4 text-[13px] leading-relaxed text-slate-700"
      >
        <p className="mb-2 text-center text-sm font-bold uppercase text-brand">
          {CONTRACT.title}
        </p>
        {paragraphs.map((p, i) => (
          <div key={i} className="mb-2.5">
            {p.heading && (
              <p className="font-semibold text-slate-900">{p.heading}</p>
            )}
            <p>{p.text}</p>
          </div>
        ))}
      </div>
      {!atEnd && (
        <p className="mt-1.5 text-xs text-amber-600">
          Faites défiler le contrat jusqu&apos;en bas pour pouvoir accepter.
        </p>
      )}
    </div>
  );
}
