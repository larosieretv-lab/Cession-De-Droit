# Cession de droit à l'image — Office de Tourisme de La Rosière

Site **100% statique** (compatible **GitHub Pages**) qui permet à une personne de
remplir **prénom, nom, adresse** et de **signer** directement au doigt. À la
validation, un **contrat PDF** de cession de droit à l'image est généré **dans le
navigateur**, proposé en **téléchargement**, et **envoyé par email** (via Web3Forms).

## Lancer en local

```bash
npm install
npm run dev      # développement
npm run build    # export statique dans ./out
```

Puis ouvrez http://localhost:3000 (le formulaire est à la racine `/`).

## Fonctionnalités

- **Formulaire mobile** : prénom, nom, adresse, signature tactile.
- **Lecture obligatoire** : articles 1 à 4 à faire défiler + case « J'accepte ».
- **PDF côté navigateur** : généré avec `pdf-lib`, téléchargeable immédiatement.
- **Email** (optionnel) : via Web3Forms, copie du contrat envoyée à
  `contenu@larosiere.net` et `cm@larosiere.net`.

## Modifier le texte du contrat

Tout le contenu juridique et les noms de référence sont centralisés dans
`lib/contract.ts`. La date « Fait à La Rosière le … » suit automatiquement le jour.

## Activer l'email (Web3Forms)

1. Allez sur https://web3forms.com et entrez `contenu@larosiere.net`.
2. Vous recevez une **Access Key** par email.
3. **En local** : copiez `.env.example` vers `.env.local` et collez la clé dans
   `NEXT_PUBLIC_WEB3FORMS_KEY`.
4. **Sur GitHub** : ajoutez un *secret* de dépôt `NEXT_PUBLIC_WEB3FORMS_KEY`.

La deuxième adresse (`cm@larosiere.net`) est mise en copie automatiquement
(voir `CC_RECIPIENTS` dans `lib/web3forms.ts`).

## Déploiement sur GitHub Pages

1. Créez un dépôt GitHub et poussez ce projet sur la branche `main`.
2. Dans **Settings > Pages**, choisissez **Source: GitHub Actions**.
3. Le workflow `.github/workflows/deploy.yml` construit et publie `./out`.
4. **Site « projet »** (`https://<user>.github.io/<repo>/`) : ajoutez une
   *variable* de dépôt `NEXT_PUBLIC_BASE_PATH` = `/<repo>`.
   **Site utilisateur** ou **domaine personnalisé** : laissez-la vide.

> Le fichier `public/.nojekyll` évite que GitHub Pages ignore le dossier `_next`.
