# Abricot

SaaS de gestion de projet collaboratif. Repo : https://github.com/Farid83300/Abricot

## Stack

- `frontend/` — Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, yarn.
- `backend/` — Express + TypeScript + Prisma (SQLite en dev), JWT, yarn/npm au choix (package-lock présent → npm). Swagger disponible via swagger-jsdoc/swagger-ui-express.
- Les deux sont indépendants (pas de monorepo tooling) : chacun a son propre `node_modules`, `package.json`.

## Commandes utiles

```bash
# Frontend (depuis frontend/)
yarn dev            # démarre sur :3000, proxy /api/* -> backend :8000 (next.config.ts)
yarn build && yarn start
yarn lint
yarn format          # prettier --write

# Backend (depuis backend/)
npm run dev          # nodemon, :8000
npm run db:push       # applique le schema Prisma à db.sqlite
npm run db:migrate
npm run db:studio
npm run seed
```

## Auth

- JWT stocké dans le cookie `abricot_token` (voir [lib/api.ts](frontend/src/lib/api.ts)), `SameSite=Strict`, 7 jours.
- [contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx) : au montage, restaure la session via `getProfile()` si un token existe.
- Garde d'accès : [app/(app)/layout.tsx](frontend/src/app/(app)/layout.tsx) redirige vers `/login` si pas d'utilisateur ; [app/page.tsx](frontend/src/app/page.tsx) redirige `/` vers `/dashboard` ou `/login`.

## Mode démo / mock (déploiement Vercel sans backend)

Vercel héberge une démo sans base de données ni backend : `NEXT_PUBLIC_MOCK_MODE=true` est positionnée dans les *Environment Variables* du projet Vercel (pas dans le repo). En local, cette variable est absente → comportement réel inchangé (backend requis).

- [lib/env.ts](frontend/src/lib/env.ts) : `IS_MOCK_MODE`, seul point de bascule.
- [lib/api.ts](frontend/src/lib/api.ts) : chaque fonction exportée est un dispatcher — si `IS_MOCK_MODE`, délègue à `mockApi.ts`, sinon fait le vrai `fetch` vers le backend. Les composants qui importent `@/lib/api` n'ont pas besoin de connaître le mode.
- [lib/mockData.ts](frontend/src/lib/mockData.ts) : jeu de données figées (5 users, 4 projets, 12 tâches, quelques commentaires), conforme aux types de `types/api.ts`.
- [lib/mockApi.ts](frontend/src/lib/mockApi.ts) : magasin en mémoire initialisé depuis `mockData.ts`. Les create/update/delete mutent réellement ce magasin (démo interactive), réinitialisé au rechargement de page.
- En mode mock, `getToken()` renvoie un token factice constant et `getProfile()` renvoie directement l'utilisateur démo (`CURRENT_USER_ID = "u1"`, Camille Dubois) : la session est donc "restaurée" dès le montage, sans jamais passer par `/login`. Les pages `/login` et `/register` existent toujours dans le code mais ne sont jamais atteintes par le flux normal.
- Pour tester en local : `NEXT_PUBLIC_MOCK_MODE=true yarn dev` (aucun backend nécessaire).

## Modèles de données (voir [types/api.ts](frontend/src/types/api.ts), miroir du schema Prisma)

- `User { id, email, name }`
- `Project { id, name, description, ownerId, owner?, members?: ProjectMember[] }` — le propriétaire (`ownerId`) n'est **pas** dans `members`.
- `ProjectMember { role: "ADMIN" | "CONTRIBUTOR", user }` — rôle front calculé `ProjectRole = "OWNER" | "ADMIN" | "CONTRIBUTOR" | "NONE"` via `getProjectRole()` dans [lib/utils.ts](frontend/src/lib/utils.ts).
- `Task { id, title, description, status, priority, dueDate?, projectId, creatorId, assignees: TaskAssignee[], comments: Comment[] }`
  - `TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED"`
  - `TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"`
  - Les tâches créées depuis l'UI sont toujours `TODO` (l'API ignore un `status` envoyé à la création) et `MEDIUM` par défaut (pas de sélecteur de priorité dans les modales).
- `Comment { id, content, taskId, authorId, author }`
- La fonctionnalité "IA" de création de tâches ([components/projects/CreateTaskAIModal.tsx](frontend/src/components/projects/CreateTaskAIModal.tsx)) est entièrement locale : elle découpe le texte saisi en phrases côté client, aucun appel réseau. Seule la validation finale appelle le vrai `createTask()` (ou son équivalent mock) par tâche acceptée.

## Layout / largeur / responsive

- Le contenu applicatif (Header, `<main>`, Footer dans [app/(app)/layout.tsx](frontend/src/app/(app)/layout.tsx)) est calé sur `max-w-[1440px] mx-auto`, avec le padding responsive existant (`px-4 sm:px-8 md:px-16 lg:px-37.5`) conservé à l'intérieur de ce conteneur. En dessous de 1440px le comportement est inchangé ; au-delà, le contenu se centre.
- Breakpoints Tailwind par défaut (sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536) — pas de surcharge dans `@theme` ([app/globals.css](frontend/src/app/globals.css), qui ne définit que les couleurs de marque et `--radius-card`).
- La navigation desktop du [Header](frontend/src/components/layout/Header.tsx) n'apparaît qu'à partir de `lg` (1024px) ; en dessous (mobile **et** tablette), c'est le menu hamburger.
- [app/(auth)/layout.tsx](frontend/src/app/(auth)/layout.tsx) (login/register) est un layout plein écran à deux colonnes, volontairement full-bleed, non concerné par le cap à 1440px.

## Conventions

- Code et commentaires en français, noms d'identifiants en anglais.
- Pas de tests automatisés côté frontend/backend à ce jour.
