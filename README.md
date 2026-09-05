# ChantierCam — Plateforme Full-Stack de Gestion de Chantiers

Application complète pour la gestion et le suivi en temps réel de chantiers de construction (**Chef de chantier**, **Ouvrier**, **Client / Maître d'ouvrage**) avec **Frontend React**, **Backend Express (REST API)** et **Base de données MySQL (`chantiercam`)**.

---

## 🏗️ Architecture

```
my-final-project-chantiercam/
├── backend/                  # Serveur REST API Express & MySQL
│   ├── config/               # Connexion MySQL (pool mysql2) & auto-init
│   ├── controllers/          # Logique métier (Auth, Projets, Phases, Tâches...)
│   ├── middlewares/          # JWT, Multer uploads
│   ├── routes/               # Endpoints REST (/api/*)
│   ├── scripts/              # Schéma SQL (schema.sql) et Seed (seed.js)
│   ├── uploads/              # Stockage des fichiers médias téléversés
│   ├── .env                  # Configuration de l'environnement
│   ├── package.json
│   └── server.js             # Démarrage du serveur API (Port 5000)
│
├── chantiercam/              # Frontend SPA React 18 + Vite
│   ├── src/
│   │   ├── components/       # Composants UI partagés, modals, lightbox
│   │   ├── context/          # Contextes connectés à l'API (Auth, Data, Thème, Lang)
│   │   ├── pages/            # Vues Manager, Worker, Client et Landing
│   │   ├── services/         # Client API Fetch (services/api.js)
│   │   ├── styles/           # Design System CSS moderne & responsif
│   │   └── i18n/             # Dictionnaire bilingue FR / EN
│   └── package.json
└── package.json              # Scripts racine
```

---

## 🚀 Installation & Démarrage

### Prérequis
- [Node.js](https://nodejs.org) v18+
- Serveur MySQL / MariaDB (WAMP, XAMPP ou MySQL natif sur le port `3306`)

### 1. Configuration de la base de données MySQL
Par défaut, le backend se connecte avec :
- **Hôte** : `localhost`
- **Port** : `3306`
- **Utilisateur** : `root`
- **Mot de passe** : *(vide)*
- **Base de données** : `chantiercam`

*(Ces valeurs sont modifiables dans `backend/.env`)*.

> **Note :** La base `chantiercam`, les 12 tables et les données de démonstration sont créées automatiquement au premier lancement du backend.

### 2. Démarrer le Backend (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 3. Démarrer le Frontend React (Port 5173)
Dans un autre terminal :
```bash
cd chantiercam
npm install
npm run dev
```

Ouvrez ensuite l'URL affichée (ex: `http://localhost:5173`).

---

## 🔑 Comptes de Démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| **Chef de chantier (Manager)** | `manager@chantiercam.com` | `Manager123` |
| **Ouvrier (Worker)** | `jean.fotso@chantiercam.com` | `Worker123` |
| **Client** | `sophie.ndjock@chantiercam.com` | `Client123` |

---

## 🛠️ Endpoints de l'API Backend (`http://localhost:5000/api`)

- **Auth** : `/api/auth/login-manager`, `/api/auth/login-user`, `/api/auth/signup-manager`, `/api/auth/me`
- **Projets** : `GET /api/projects`, `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`
- **Phases** : `GET /api/phases`, `POST /api/phases`, `PUT /api/phases/:id`, `DELETE /api/phases/:id`
- **Utilisateurs** : `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`
- **Tâches** : `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`
- **Matériaux** : `GET /api/materials`, `POST /api/materials`, `PUT /api/materials/:id`, `DELETE /api/materials/:id`
- **Paiements** : `GET /api/payments`, `POST /api/payments`, `PUT /api/payments/:id`, `DELETE /api/payments/:id`
- **Avancement (Journal)** : `GET /api/progress`, `POST /api/progress`, `PUT /api/progress/:id`, `DELETE /api/progress/:id`
- **Rapports** : `GET /api/reports`, `POST /api/reports`, `PUT /api/reports/:id`, `DELETE /api/reports/:id`
- **Messagerie** : `GET /api/messages`, `POST /api/messages`, `POST /api/messages/read`
- **Notifications** : `GET /api/notifications`, `POST /api/notifications`, `PUT /api/notifications/:id/read`
- **Uploads de médias** : `POST /api/upload/single`, `POST /api/upload/multiple`
- **Synchronisation / Reset** : `GET /api/data`, `POST /api/data/reset`
