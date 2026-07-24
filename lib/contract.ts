/**
 * Central configuration for the "Cession de droit à l'image" contract.
 * Update these values to keep the document current — they are used both in
 * the generated PDF and (optionally) the email content.
 */
export const CONTRACT = {
  title: "CONTRAT DE CESSION DE DROIT À L'IMAGE",
  cessionnaire:
    "l'Office de Tourisme de La Rosière, représenté par Maxime Perigny et Agathe Wolff",
  cessionnaireSignataires: "Maxime Perigny et Agathe Wolff",
  reportageAuteurs: "Maxime Perigny et Agathe Wolff",
  lieu: "La Rosière",
} as const;

/**
 * Returns the full contract body, with the cédant's data injected.
 * The signing date defaults to today.
 */
export function buildContractParagraphs(input: {
  nom: string;
  prenom: string;
  adresse: string;
  date: Date;
}): { heading?: string; text: string }[] {
  const dateStr = input.date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return [
    { text: "ENTRE LES SOUSSIGNÉS" },
    {
      text: `Nom : ${input.nom}     Prénom : ${input.prenom}`,
    },
    { text: `Adresse : ${input.adresse}` },
    { text: "Ci-après, désigné « le cédant »" },
    { text: "et" },
    {
      text: `${CONTRACT.cessionnaire}, ci-après, désigné « le cessionnaire ».`,
    },
    { text: "Il a été arrêté et convenu ce qui suit :" },
    {
      heading: "Article 1er : Objet du présent contrat",
      text: `Le présent contrat a pour but de préciser les conditions dans lesquelles le cédant autorise le cessionnaire à exploiter son droit à l'image, qui résulte de la prise de photographies du cédant dans le cadre du reportage réalisé par ${CONTRACT.reportageAuteurs} le ${dateStr} à ${CONTRACT.lieu}.`,
    },
    {
      heading: "Article 2 : Étendue des droits cédés",
      text: "Le cédant autorise le cessionnaire à fixer, enregistrer et reproduire son image par tous les moyens techniques connus à ce jour. L'image du cédant peut donc être diffusée sur tout support choisi par le cessionnaire dans un but de communication. En outre, le cédant autorise le cessionnaire à diffuser son image au public en utilisant les différents moyens connus à ce jour, et notamment le réseau Internet. Cependant, le cessionnaire est tenu de s'abstenir de concevoir tout montage qui présenterait le cédant dans une situation déshonorante ou dévalorisante pour lui. D'autre part, il est interdit au cessionnaire de céder les droits visés dans le présent contrat à qui que ce soit, sans autorisation préalable, expresse et écrite du cédant. Enfin, la présente cession n'est pas limitée dans le temps, ni à des pays en particulier.",
    },
    {
      heading: "Article 3 : Rémunération du cédant",
      text: "Les droits sont cédés à titre gratuit.",
    },
    {
      heading: "Article 4 : Litiges",
      text: "Tout litige relèvera des juridictions dont dépend le lieu de signature du présent contrat.",
    },
    {
      text: `Fait à ${CONTRACT.lieu} le ${dateStr}.`,
    },
  ];
}
