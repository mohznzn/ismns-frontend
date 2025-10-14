This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Committer depuis l'environnement de développement

Si vous travaillez directement dans cet environnement (via le terminal intégré), vous pouvez tout à fait réaliser vos commits et les pousser vers votre dépôt distant. Voici le flux recommandé :

1. Vérifiez l'état de votre copie de travail pour lister les fichiers modifiés :
   ```bash
   git status -sb
   ```
2. Sélectionnez les changements à inclure dans le commit (tous dans cet exemple) :
   ```bash
   git add -A
   ```
3. Créez le commit avec un message explicite :
   ```bash
   git commit -m "maj"
   ```
4. Envoyez le commit vers la branche suivie (par exemple `main`) :
   ```bash
   git push origin main
   ```

Tant que vos identifiants Git sont configurés, ces commandes fonctionnent exactement comme sur votre machine locale.
