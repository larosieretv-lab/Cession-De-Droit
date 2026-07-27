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
  const [progress, setProgress] = useState(0);

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
    const scrollable = el.scrollHeight - el.clientHeight;
    setProgress(scrollable <= 0 ? 1 : Math.min(1, el.scrollTop / scrollable));
    const reached = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
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
      setProgress(1);
      onReachEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-line-strong bg-surface">
        {/* Reading progress: the gate is real, so show how much is left. */}
        <div className="h-[3px] w-full bg-sunk" aria-hidden="true">
          <div
            className="h-full bg-sun transition-[width] duration-150 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkEnd}
            tabIndex={0}
            role="region"
            aria-label="Texte du contrat"
            className="h-[17rem] overflow-y-auto px-4 py-4 text-[13.5px] leading-[1.65] text-ink-soft sm:h-[20rem] sm:px-5"
          >
            <p className="mb-3 font-serif text-[15px] text-ink">
              {CONTRACT.title}
            </p>
            {paragraphs.map((p, i) => (
              <div key={i} className="mb-3">
                {p.heading && (
                  <p className="mb-0.5 font-medium text-ink">{p.heading}</p>
                )}
                <p className="[text-wrap:pretty]">{p.text}</p>
              </div>
            ))}
          </div>

          {!atEnd && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent"
            />
          )}
        </div>
      </div>

      <p
        className={`mt-2 text-[13px] ${atEnd ? "text-success" : "text-ink-soft"}`}
        aria-live="polite"
      >
        {atEnd
          ? "Vous avez lu le contrat en entier."
          : "Faites d\u00e9filer jusqu\u2019en bas pour pouvoir accepter."}
      </p>
    </div>
  );
}
