# Backend — Faculté des Sciences UMBB

API REST du portail de la Faculté des Sciences (Université M'Hamed Bougara de Boumerdès).
Elle se branche sur le frontend React existant **sans le modifier** : les routes et les formes JSON
reproduisent exactement ce que `src/services/httpApi.ts` attend.

**Technologies** : FastAPI · SQLAlchemy 2.0 · Alembic · Pydantic · PostgreSQL · JWT (PyJWT) · Argon2id (pwdlib) · Uvicorn.

---

## 1. Ce qui est inclus (et ce qui ne l'est pas)

Seules les fonctionnalités **réellement présentes dans le frontend** sont implémentées :

| Route | Accès | Utilisée par le frontend |
|---|---|---|
| `GET /api/health` | Public | Contrôle technique |
| `POST /api/auth/login` | Public (limité : 5 échecs / 15 min) | Page `/admin/login` |
| `GET /api/departments`, `GET /api/departments/{id}` | Public, **lecture seule** | Accueil, Départements |
| `GET /api/announcements` | Public (publiées). `?status=all` : admin | Accueil, Actualités, Dashboard |
| `GET /api/announcements/{id}` | Public si publiée, admin sinon | Détail d'une annonce |
| `POST /api/announcements` | **Admin** | Dashboard : ajout |
| `PUT /api/announcements/{id}` | **Admin** | Dashboard : modification, publier/dépublier |
| `DELETE /api/announcements/{id}` | **Admin** | Dashboard : suppression |
| `POST /api/contact` | Public (limité : 5 / heure / IP) | Formulaire de contact |

Paramètres de `GET /api/announcements` : `status` (`published` par défaut, `draft`, `all`), `q` (recherche),
`category`, `limit` (1–500, défaut 200), `offset`. Le nombre total est dans l'en-tête `X-Total-Count`.

**Non implémentés volontairement** (absents du frontend) : événements, galerie, publications, téléversement d'images,
gestion des départements en écriture, lecture des messages de contact via l'API, inscription publique.
Les messages de contact se consultent dans pgAdmin (table `contact_messages`).

Erreurs : toujours `{"message": "...", "code": "..."}` (le frontend lit `message`).

---

## 2. Arborescence

```
Faculty-of-Sciences-UMBB/            ← dossier du projet (frontend existant, inchangé)
├── src/  public/  package.json …
└── backend/                          ← NOUVEAU
    ├── app/
    │   ├── main.py                   Création de l'API, CORS, gestion des erreurs, branchement des routes
    │   ├── core/
    │   │   ├── config.py             Lit le .env (base de données, clé secrète, CORS)
    │   │   ├── security.py           Hachage Argon2id des mots de passe + création/lecture des jetons JWT
    │   │   ├── errors.py             Format d'erreur unique {"message","code"}
    │   │   └── rate_limit.py         Limitation des essais de connexion et des messages de contact
    │   ├── database/
    │   │   ├── base.py               Classe de base des modèles
    │   │   └── connection.py         Connexion PostgreSQL + session par requête
    │   ├── models/                   Les 5 tables (admin_users, categories, departments, announcements, contact_messages)
    │   ├── schemas/                  Validation et formes JSON (Pydantic)
    │   ├── services/                 Logique métier (connexion, annonces, départements, contact)
    │   ├── dependencies/auth.py      « Qui est connecté ? » / « Admin obligatoire »
    │   ├── routers/                  Les routes (health, auth, departments, announcements, contact)
    │   └── scripts/
    │       ├── create_admin.py       Création sécurisée du compte administrateur
    │       └── seed_demo_announcements.py   (optionnel) 5 annonces FICTIVES d'exemple
    ├── alembic/
    │   ├── env.py                    Branche Alembic sur la base du .env
    │   └── versions/0001_initial_schema.py   Crée les 5 tables + catégories + 6 départements
    ├── tests/                        22 tests automatisés (base de test séparée)
    ├── alembic.ini  pytest.ini
    ├── requirements.txt  requirements-dev.txt
    ├── .env.example  .gitignore  README.md
```

---

## 3. Les 5 tables

| Table | Rôle | Relations / règles |
|---|---|---|
| `admin_users` | Comptes du personnel | `email` unique. Rôle `admin` ou `editor`. Mot de passe stocké uniquement haché (Argon2id) |
| `categories` | 5 catégories fixes (`academic`, `exams`, `events`, `research`, `administrative`) | `code` unique. Suppression refusée si une annonce l'utilise |
| `departments` | 6 départements (textes FR/EN) | `slug` unique. Lecture seule via l'API |
| `announcements` | Actualités et annonces (titres/contenus FR + EN) | `category_id` → `categories` (RESTRICT). `created_by` → `admin_users` (SET NULL). `status` = `draft`/`published` (contrainte). Index sur (`status`, `published_at`) |
| `contact_messages` | Messages du formulaire de contact | Aucune adresse IP stockée. `status` = `new`/`read`/`archived` |

---

## 4. Installation sous Windows 10 (une seule fois)

> **Où taper les commandes ?** Dans VS Code : menu **Terminal → Nouveau terminal**. Un terminal PowerShell s'ouvre en bas
> (invite `PS C:\...>`). Les commandes se tapent puis se valident avec **Entrée**.

### 4.1 Vérifier les logiciels

```powershell
python --version      # attendu : Python 3.14.x
py -0p                # liste des versions Python installées
```

### 4.2 Se placer dans le dossier backend

Remplacez le chemin par celui de VOTRE projet :

```powershell
cd C:\chemin\vers\Faculty-of-Sciences-UMBB\backend
```

Vérification : `dir` doit montrer `app`, `alembic`, `tests`, `requirements.txt`…

### 4.3 Créer l'environnement virtuel (une « boîte » Python propre pour ce projet)

```powershell
py -3.14 -m venv .venv
```

Activer l'environnement :

```powershell
.\.venv\Scripts\Activate.ps1
```

L'invite doit commencer par `(.venv)`. **À refaire à chaque nouveau terminal.**

> **Erreur « l'exécution de scripts est désactivée sur ce système »** : tapez une fois
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, répondez `O`, puis relancez l'activation.
> Alternative sans rien changer : `.\.venv\Scripts\activate.bat` dans un terminal **cmd**.

### 4.4 Installer les dépendances

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements-dev.txt
```

Toutes les versions sont épinglées et disponibles en paquets précompilés pour Windows 64 bits / Python 3.14
(aucun compilateur nécessaire). **Si un paquet échouait malgré tout**, installez Python 3.13 à côté (sans toucher à 3.14),
puis refaites 4.3 avec `py -3.13 -m venv .venv`.

### 4.5 Configurer le fichier `.env`

```powershell
Copy-Item .env.example .env
code .env
```Copy-Item .env.example .env

Dans `.env`, remplacez :

| Variable | Valeur |
|---|---|
| `DB_PASSWORD` | Le mot de passe de votre utilisateur PostgreSQL (celui choisi à l'installation) |
| `DB_USER` / `DB_PORT` | `postgres` et `5432` sauf si vous les avez changés |
| `SECRET_KEY` | Une clé aléatoire : générez-la avec la commande ci-dessous |

```powershell
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Copiez le résultat comme valeur de `SECRET_KEY`. Enregistrez (`Ctrl+S`).
**Ne partagez jamais ce fichier** (il est ignoré par Git).

### 4.6 Vérifier la base AVANT la migration (pgAdmin)

Clic droit sur `faculty_portal` → **Query Tool**, exécutez :

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
SHOW server_encoding;
```

- Si la liste contient déjà `admin_users`, `categories`, `departments`, `announcements` ou `contact_messages`,
  **arrêtez-vous** : la migration refuserait de créer des tables existantes (rien ne serait écrasé). Sauvegardez et contactez-moi.
- `server_encoding` doit être `UTF8` (accents).

### 4.7 Créer les tables et les données initiales

```powershell
python -m alembic upgrade head
```

Résultat attendu : `Running upgrade  -> 0001, Schéma initial…`. Dans pgAdmin : clic droit sur **Tables → Refresh** :
vous voyez 6 tables (les 5 + `alembic_version`), 5 lignes dans `categories`, 6 dans `departments`.

### 4.8 Créer le compte administrateur

```powershell
python -m app.scripts.create_admin
```

Le script demande l'e-mail, le nom et le mot de passe (saisie **cachée**, 12 caractères minimum avec majuscules,
minuscules et un chiffre). Aucun mot de passe n'est écrit dans un fichier.
Utilisez une vraie adresse (les domaines réservés comme `.local` sont refusés par la validation d'e-mail).
Pour changer plus tard le mot de passe : `python -m app.scripts.create_admin --reset-password`.

### 4.9 (Optionnel) Annonces fictives d'exemple

```powershell
python -m app.scripts.seed_demo_announcements
```

Ajoute 5 annonces **fictives** (« … (exemple) ») pour voir le site avec du contenu. Supprimables depuis le dashboard.

---

## 5. Lancer le backend

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Laissez ce terminal ouvert. Vérifications :

- <http://127.0.0.1:8000/api/health> → `{"status":"ok","database":"connected"}`
- <http://127.0.0.1:8000/docs> → documentation interactive Swagger

Arrêter le serveur : `Ctrl+C`.

---

## 6. Tester chaque route avec Swagger (<http://127.0.0.1:8000/docs>)

Cliquez sur une route → **Try it out** → remplissez → **Execute** → lisez « Server response ».

| # | Test | Résultat attendu |
|---|---|---|
| 1 | `GET /api/health` | 200 `{"status":"ok","database":"connected"}` |
| 2 | `GET /api/departments` | 200, 6 départements dans l'ordre : mathematics, physics, chemistry, computer-science, biology, foreign-languages |
| 3 | `GET /api/departments/9999` | 404 `{"message":"Department not found",…}` |
| 4 | `POST /api/auth/login` avec un mauvais mot de passe | 401 `{"message":"Invalid credentials","code":"invalid_credentials"}` |
| 5 | `POST /api/auth/login` avec vos identifiants | 200 `{"token":"eyJ…","user":{"email":…,"name":…}}` |
| 6 | Bouton **Authorize** (en haut) → collez **uniquement le token** (sans « Bearer ») → Authorize | Les cadenas se ferment |
| 7 | `POST /api/announcements` (corps ci-dessous) | 201 + l'annonce créée avec un `id` |
| 8 | `GET /api/announcements` | 200, uniquement les annonces `published` |
| 9 | `GET /api/announcements?status=all` (autorisé) | 200, brouillons inclus |
| 10 | Bouton Authorize → **Logout**, puis refaire le 9 | 401 `not_authenticated` |
| 11 | `PUT /api/announcements/{id}` (reconnecté) avec `"status":"draft"` | 200, l'annonce redevient brouillon |
| 12 | `GET /api/announcements/{id}` sans être connecté, annonce brouillon | 404 |
| 13 | `DELETE /api/announcements/{id}` | 204 (sans contenu), puis 404 si on le refait |
| 14 | `POST /api/contact` (corps ci-dessous) | 201 `{"id":"1","message":"Message received"}` |
| 15 | `POST /api/announcements` avec `"category":"nope"` | 422 `{"message":"category: …","code":"validation_error"}` |

Corps pour `POST /api/announcements` :

```json
{
  "title":   { "fr": "Rentrée universitaire", "en": "Start of the academic year" },
  "content": { "fr": "Texte de l'annonce en français.", "en": "Announcement text in English." },
  "category": "academic",
  "status": "published",
  "publishedAt": "2026-11-22"
}
```

Corps pour `POST /api/contact` :

```json
{ "name": "Amina B.", "email": "amina@example.com", "subject": "Question", "message": "Bonjour, ceci est ma question." }
```

### Vérifications dans pgAdmin

```sql
SELECT id, title_fr, status, published_at, created_by FROM announcements ORDER BY id DESC;
SELECT id, name, email, subject, status, created_at FROM contact_messages ORDER BY id DESC;
SELECT email, role, is_active, left(password_hash, 20) AS hash_debut, last_login_at FROM admin_users;
```

Le mot de passe n'apparaît jamais en clair : `hash_debut` commence par `$argon2id$`.

---

## 7. Tests automatisés

```powershell
python -m pytest
```

Attendu : `22 passed`. Les tests utilisent une base **séparée** `faculty_portal_test` (créée automatiquement,
l'utilisateur doit avoir le droit `CREATEDB`, ce qui est le cas de `postgres`).
Ils ne touchent **jamais** à `faculty_portal` (le programme refuse de s'exécuter sinon).
Un avertissement « Using httpx with starlette.testclient » peut apparaître : il est sans conséquence.

---

## 8. Connecter le frontend (sans le modifier)

Le frontend est déjà prêt : il suffit de changer **son** fichier `.env` (à la racine du projet, pas dans `backend`).

1. Dans un **second terminal** VS Code, placez-vous à la racine du projet :
   ```powershell
   cd C:\chemin\vers\Faculty-of-Sciences-UMBB
   Copy-Item .env.example .env
   code .env
   ```
2. Mettez exactement :
   ```
   VITE_API_URL=http://127.0.0.1:8000
   VITE_USE_DEMO=false
   ```
3. Le backend doit tourner (§5). Lancez le frontend (`npm install` si ce n'est pas fait) :
   ```powershell
   npm run dev
   ```
   **Après toute modification du `.env`, arrêtez (`Ctrl+C`) et relancez `npm run dev`.**
4. Ouvrez <http://localhost:5173>.

### Checklist de vérification

| Fonctionnalité | Comment vérifier | Attendu |
|---|---|---|
| Départements | Accueil et page Départements | 6 cartes (chargées depuis PostgreSQL) |
| Détail département | Cliquer « Détails » | Nom et texte, FR/EN selon la langue |
| Annonces publiques | Accueil et Actualités | Seules les annonces publiées |
| Recherche / catégories | Page Actualités | Filtrage fonctionnel |
| Détail annonce | Cliquer une annonce | Page de détail |
| Connexion refusée | `/admin/login` avec un mauvais mot de passe | Message d'erreur |
| Connexion | Vos identifiants | Dashboard, brouillons visibles |
| Ajouter / Modifier / Supprimer | Boutons du dashboard | Visible aussitôt dans pgAdmin (`announcements`) |
| Publier / Dépublier | Icône œil | Le statut change en base |
| Contact | Remplir le formulaire | Message de succès + ligne dans `contact_messages` |
| Langue | Bouton FR/EN | La page reste affichée, textes traduits |

Le bandeau « mode démonstration » et les identifiants de démo disparaissent automatiquement avec `VITE_USE_DEMO=false`.

**Limite connue** : le jeton expire au bout de 60 minutes. Le frontend actuel n'a pas de gestion automatique de l'expiration :
le dashboard affiche alors un message d'erreur avec « Réessayer ». Cliquez sur **Déconnexion** puis reconnectez-vous.
(Une amélioration optionnelle serait de rediriger automatiquement vers la connexion ; elle n'est pas appliquée pour ne pas toucher au frontend.)

---

## 9. Sécurité

- Mots de passe hachés en **Argon2id** ; jamais stockés ni journalisés en clair.
- Aucune route d'inscription publique ; compte créé par script, mot de passe saisi de façon cachée.
- **JWT** (HS256) signé avec `SECRET_KEY` (32 caractères minimum, valeur d'exemple refusée), expiration 60 min.
- Connexion : message d'erreur identique pour e-mail inconnu / mot de passe faux, temps de calcul équivalent, blocage après 5 échecs (429).
- Écritures d'annonces : jeton valide obligatoire (401 sinon). Compte désactivé = jeton refusé.
- Brouillons invisibles au public (404 et non 403, pour ne pas révéler leur existence).
- Requêtes SQL via SQLAlchemy (paramétrées) : injection SQL testée et neutralisée.
- Validation stricte des entrées (longueurs, catégories, statuts, dates, e-mails).
- CORS limité aux origines de `CORS_ORIGINS`. Messages d'erreur 500 sans détail technique.
- `.env` ignoré par Git. Documentation Swagger désactivée si `ENVIRONMENT=production`.
- Limiteurs de fréquence **en mémoire** : suffisants pour un seul serveur ; avec plusieurs serveurs, prévoir un stockage partagé.
- Avant la mise en ligne : HTTPS obligatoire, `ENVIRONMENT=production`, `CORS_ORIGINS` = adresse réelle du site,
  nouveau `SECRET_KEY`, utilisateur PostgreSQL dédié aux droits limités (pas `postgres`).

---

## 10. Solutions aux erreurs probables

| Message | Cause et solution |
|---|---|
| `'python' n'est pas reconnu` | Python non dans le PATH : relancer l'installateur et cocher « Add python.exe to PATH », ou utiliser `py` |
| `Activate.ps1 … scripts désactivée` | Voir 4.3 (`Set-ExecutionPolicy … RemoteSigned`) |
| `No module named 'app'` | Vous n'êtes pas dans le dossier `backend`. Faites `cd …\backend` |
| `No module named …` (fastapi, sqlalchemy…) | Environnement non activé : `.\.venv\Scripts\Activate.ps1` |
| `ValidationError … db_password / secret_key Field required` | `.env` absent ou mal rempli (il doit être dans `backend`, nommé exactement `.env`) |
| `SECRET_KEY invalide` | Générez une vraie clé (4.5) |
| `password authentication failed` ou `UnicodeDecodeError … 0xe9` | Sur Windows français, l'erreur de connexion PostgreSQL s'affiche mal encodée. C'est presque toujours un mauvais `DB_PASSWORD`/`DB_USER`/`DB_PORT`. Testez les mêmes identifiants dans pgAdmin |
| `connection refused` | Service PostgreSQL arrêté : `services.msc` → « postgresql-x64-18 » → Démarrer |
| `database "faculty_portal" does not exist` | `DB_NAME` incorrect (vérifiez l'orthographe dans pgAdmin) |
| `relation "…" already exists` à la migration | Des tables du même nom existent déjà (voir 4.6). Rien n'est écrasé. Ne forcez pas |
| `Can't locate revision` | Mauvais dossier : lancez Alembic depuis `backend` |
| `[Errno 10048]` port 8000 occupé | Autre programme sur le port : fermez-le ou utilisez `--port 8001` (et adaptez `VITE_API_URL`) |
| Erreur CORS dans la console du navigateur | Le frontend n'est pas sur `localhost:5173` / `127.0.0.1:5173` : ajoutez son adresse dans `CORS_ORIGINS` puis relancez le backend |
| Le site affiche encore les données de démo | `.env` du frontend non pris en compte : vérifiez `VITE_USE_DEMO=false` et relancez `npm run dev` |
| Login : « Invalid credentials » alors que le mot de passe est bon | Compte créé dans une autre base, ou e-mail différent. Vérifiez la table `admin_users` |
| Création d'admin : « adresse e-mail invalide » | Domaines réservés (`.local`, `.test`) refusés : utilisez une vraie adresse |
| `422` à la création d'une annonce | Un champ est vide/trop long, ou la catégorie/le statut/la date est invalide (voir le champ `message`) |

---

## 11. Démarrer le projet depuis zéro (récapitulatif)

```powershell
# Terminal 1 — backend
cd C:\chemin\vers\Faculty-of-Sciences-UMBB\backend
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
Copy-Item .env.example .env          # puis remplir .env (DB_PASSWORD, SECRET_KEY)
python -m alembic upgrade head
python -m app.scripts.create_admin
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 — frontend
cd C:\chemin\vers\Faculty-of-Sciences-UMBB
npm install
Copy-Item .env.example .env          # puis VITE_USE_DEMO=false et VITE_API_URL=http://127.0.0.1:8000
npm run dev
```

Les jours suivants, seuls l'activation de l'environnement (`.\.venv\Scripts\Activate.ps1`), la commande `uvicorn` et `npm run dev` sont nécessaires.

---

## 12. Ce qui a été testé

Tests automatisés (22) et test de bout en bout du vrai frontend contre ce backend et un vrai PostgreSQL : consultation publique,
recherche, connexion refusée/acceptée, ajout, modification, publication/dépublication, suppression, formulaire de contact,
CORS, vérification en base, déconnexion. Ces tests ont été exécutés sur **Linux / Python 3.12 / PostgreSQL 16**.
La compatibilité des versions avec **Windows 10 / Python 3.14 / PostgreSQL 18** a été vérifiée au niveau des paquets
(paquets précompilés disponibles) mais pas exécutée sur Windows : c'est pourquoi la section 7 vous fait lancer `pytest` chez vous.
