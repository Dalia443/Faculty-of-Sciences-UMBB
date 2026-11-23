# Faculty of Sciences — UMBB (Frontend)

Portail d'information et d'annonces **bilingue (FR/EN)** de la Faculté des Sciences,
Université M'Hamed Bougara de Boumerdès (UMBB).

Stack : **React 18 · Vite · TypeScript · React Router · CSS personnalisé · Lucide icons**.
Ce dépôt est le **frontend uniquement** : aucun backend ni base de données n'y est implémenté.

---

## 1. Prérequis

- [Node.js](https://nodejs.org/) **18 ou plus** (20 LTS recommandé)
- npm (fourni avec Node.js)
- VS Code (recommandé)

## 2. Installation et lancement

```bash
# 1. Extraire le ZIP puis ouvrir le dossier dans VS Code
cd Faculty-of-Sciences-UMBB

# 2. Installer les dépendances
npm install

# 3. (Optionnel) créer le fichier d'environnement
cp .env.example .env        # Windows PowerShell : copy .env.example .env

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrir ensuite l'adresse affichée (par défaut <http://localhost:5173>).

| Commande            | Rôle                                              |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Serveur de développement avec rechargement à chaud |
| `npm run build`     | Vérification TypeScript + build de production (`dist/`) |
| `npm run preview`   | Prévisualiser le build de production              |
| `npm run typecheck` | Vérification TypeScript seule                     |

## 3. Logo officiel

Le logo officiel de la Faculté des Sciences doit être placé **sans modification** ici :

```
public/logo.png
```

Il est affiché dans la barre de navigation, le pied de page, la page *À propos* et la page de
connexion administrateur (dans un badge blanc pour rester lisible sur fond sombre).
Tant que ce fichier est absent, un simple libellé texte « FS · UMBB » s'affiche à la place.
Pour utiliser un autre nom/format, modifier `src/components/layout/Logo.tsx`.

## 4. Mode démonstration et accès administrateur

Par défaut (`VITE_USE_DEMO=true`), le site fonctionne **sans backend** avec des données fictives
(`src/data`). Les annonces de démonstration sont marquées « Démo ».

- Page de connexion : `/admin/login`
- Identifiants de démonstration : `admin@demo.local` / `demo1234`
- Les modifications (ajout, édition, suppression) sont conservées dans le `localStorage`
  du navigateur uniquement. Pour réinitialiser : vider les données du site dans le navigateur.

> ⚠️ **L'authentification de démonstration n'est PAS sécurisée.** L'authentification et les
> autorisations réelles doivent être implémentées par le backend. La protection de route côté
> frontend (`ProtectedRoute`) n'est qu'un confort d'interface.

## 5. Variables d'environnement

Copier `.env.example` vers `.env` :

| Variable        | Description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| `VITE_API_URL`  | URL de base de l'API REST, sans `/` final (ex. `http://localhost:8000`)      |
| `VITE_USE_DEMO` | `true` = données de démo ; `false` = appels réels vers `VITE_API_URL`        |

Aucune URL de backend n'est codée en dur dans les composants : tout passe par
`src/services/config.ts`.

## 6. Intégration future avec l'API REST / PostgreSQL

Les composants n'appellent **jamais** `fetch` directement : ils utilisent `api` (`src/services/api.ts`),
qui choisit entre le client de démonstration et le client HTTP selon `VITE_USE_DEMO`.

| Endpoint                     | Méthode du client (`ApiClient`)    |
| ---------------------------- | ---------------------------------- |
| `GET /api/departments`       | `getDepartments()`                 |
| `GET /api/announcements`     | `getAnnouncements({ includeDrafts })` (`?status=all` pour l'admin) |
| `GET /api/announcements/:id` | `getAnnouncement(id)`              |
| `POST /api/announcements`    | `createAnnouncement(input)`        |
| `PUT /api/announcements/:id` | `updateAnnouncement(id, input)`    |
| `DELETE /api/announcements/:id` | `deleteAnnouncement(id)`        |
| `POST /api/auth/login`       | `login({ email, password })`       |
| `POST /api/contact` *(proposé)* | `sendContactMessage(message)`   |

Pour passer en mode réel : définir `VITE_USE_DEMO=false` et `VITE_API_URL`, puis adapter si besoin
`src/services/httpApi.ts` au format exact des réponses du backend. Les types attendus sont dans
`src/types/index.ts` (champs bilingues `{ fr, en }`, `status: 'published' | 'draft'`, `publishedAt` ISO).
Le jeton renvoyé par `/api/auth/login` est envoyé en `Authorization: Bearer <token>`.
Le CORS doit être autorisé côté backend pour l'origine du frontend.

## 7. Architecture

```
src/
├── assets/          Illustrations SVG (départements, motif du hero) + index
├── components/
│   ├── ui/            Composants réutilisables (Button, Fields, Modal, états…)
│   ├── layout/        Navbar, Footer, Logo, LanguageSwitcher, ProtectedRoute
│   ├── departments/   DepartmentCard
│   ├── announcements/ AnnouncementCard
│   └── admin/         Table, formulaire, stats, confirmation, toast
├── context/         AuthContext (session)
├── data/            Données de démonstration (départements, annonces, infos du site)
├── hooks/           useAsync (chargement / erreur / données)
├── i18n/            fr.ts, en.ts, provider + hook useI18n
├── layouts/         PublicLayout, AdminLayout
├── pages/           Home, About, Departments, DepartmentDetail, News, NewsDetail,
│   └── admin/       Contact, NotFound · AdminLogin, AdminDashboard
├── services/        config, api (façade), httpApi (REST), demo/demoApi, session
├── styles/          tokens, base, layout, components, pages
├── types/           Types TypeScript partagés
└── utils/           Formatage de dates, validation e-mail
```

## 8. Routes

| Route                | Page                                  |
| -------------------- | ------------------------------------- |
| `/`                  | Accueil                               |
| `/about`             | À propos                              |
| `/departments`       | Départements (6 cartes)               |
| `/departments/:slug` | Détail d'un département               |
| `/news`              | Actualités : recherche + catégories   |
| `/news/:id`          | Détail d'une annonce                  |
| `/contact`           | Contact + formulaire validé           |
| `/admin/login`       | Connexion administrateur              |
| `/admin`             | Tableau de bord (protégé)             |

## 9. Langues

Le français est la langue par défaut. Le sélecteur de langue (barre de navigation, page de
connexion, barre admin) change la langue **sans quitter la page courante** ni réinitialiser l'état.
Les textes sont dans `src/i18n/fr.ts` et `src/i18n/en.ts` ; le type `Dictionary` force les deux
fichiers à rester synchronisés (erreur TypeScript en cas de clé manquante).

## 10. Informations officielles et contenus fictifs

Seules les informations vérifiées du brief sont utilisées : université M'Hamed Bougara de Boumerdès,
Faculté des Sciences, Campus Sud, adresse « Route de la Gare Ferroviaire, 35000 Boumerdes, Algeria »,
création de l'université le 2 juin 1998, six départements officiels.

- Aucun numéro de téléphone, e-mail, nom d'enseignant ni statistique n'a été inventé.
- Les annonces sont **fictives** et marquées « Démo ».
- Les textes de présentation (À propos, départements) sont génériques et **à valider avec la faculté**.
- Les images des départements sont des illustrations SVG originales : elles peuvent être remplacées
  par des photographies dans `src/assets/departments/` (en conservant les noms ou en mettant à jour
  `src/assets/index.ts`).
- La section « Localisation » renvoie vers OpenStreetMap ; une carte intégrée pourra être ajoutée
  une fois les coordonnées officielles confirmées.

## 11. Backend (FastAPI + PostgreSQL)

Le dossier [`backend/`](backend/README.md) contient l'API REST complète (FastAPI, SQLAlchemy, Alembic, JWT, PostgreSQL).
Pour utiliser le frontend avec ce backend, suivre `backend/README.md` (installation, migrations, création de l'admin),
puis dans le `.env` de ce dossier : `VITE_USE_DEMO=false` et `VITE_API_URL=http://127.0.0.1:8000`.

## 12. Périmètre de cette étape

Frontend + backend. Docker, Ubuntu et le déploiement Render ne sont pas inclus.
Le frontend est une application statique (`npm run build` → `dist/`), prête à être servie par
n'importe quel hébergeur statique ou serveur web. Pour le routage côté client (React Router),
configurer une redirection de toutes les routes vers `index.html`.
