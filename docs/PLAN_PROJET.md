# FlexCampus - Plan de Projet Détaillé

## 📋 Informations Générales

| Élément | Détail |
|---------|--------|
| **Nom du projet** | FlexCampus |
| **Type** | Plateforme d'apprentissage IT |
| **Public cible** | Étudiants IT (IA, Cybersécurité, Cloud, Développement) |
| **Stack technique** | Cloudflare (Pages, Workers, D1, R2, KV, Containers) |

---

## 🎯 Objectifs du Projet

### Objectif Principal
Créer une plateforme web permettant aux étudiants d'accéder à des cours IT et de pratiquer via des labs virtuels accessibles directement depuis le navigateur.

### Objectifs Secondaires
- [ ] Interface intuitive pour naviguer entre les thématiques
- [ ] Accès aux cours en format Markdown et PDF
- [ ] Labs virtuels avec environnement Linux accessible via VNC
- [ ] Gestion automatique du cycle de vie des containers
- [ ] Interface d'administration pour gérer les contenus

---

## 🏗️ Architecture Technique

### Vue d'ensemble
```
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   PAGES      │     │   WORKERS    │     │     D1       │    │
│  │  (Frontend)  │────▶│   (API)      │────▶│ (Database)   │    │
│  │  HTML/CSS/JS │     │              │     │              │    │
│  └──────────────┘     └──────┬───────┘     └──────────────┘    │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │     R2       │     │  CONTAINERS  │     │    KV        │    │
│  │   (PDFs)     │     │   (Labs)     │     │  (Sessions)  │    │
│  │              │     │  + noVNC     │     │              │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Composants

| Composant | Service Cloudflare | Rôle |
|-----------|-------------------|------|
| Frontend | Pages | Hébergement statique HTML/CSS/JS |
| API Backend | Workers | Logique métier, routage API REST |
| Base de données | D1 | Stockage structuré (SQLite compatible) |
| Stockage fichiers | R2 | PDFs des TPs, ressources |
| Sessions | KV | Cache sessions utilisateurs |
| Labs virtuels | Containers | Environnements Linux avec VNC |

---

## 📁 Structure des Fichiers

```
flexcampus/
├── docs/                        # Documentation
│   ├── PLAN_PROJET.md          # Ce fichier
│   ├── API.md                  # Documentation API
│   └── DEPLOYMENT.md           # Guide de déploiement
│
├── frontend/                    # Cloudflare Pages
│   ├── index.html              # Page d'accueil
│   ├── themes.html             # Liste des thématiques
│   ├── exercise.html           # Page exercice + lab
│   ├── admin.html              # Interface administration
│   ├── css/
│   │   ├── style.css           # Styles principaux
│   │   ├── components.css      # Composants réutilisables
│   │   └── vnc.css             # Styles viewer VNC
│   ├── js/
│   │   ├── app.js              # Logique principale
│   │   ├── api.js              # Client API
│   │   ├── router.js           # Navigation SPA
│   │   ├── vnc.js              # Intégration noVNC
│   │   └── admin.js            # Fonctions admin
│   └── assets/
│       ├── images/
│       │   ├── logo.svg
│       │   └── icons/
│       └── vendor/
│           └── novnc/          # Bibliothèque noVNC
│
├── workers/                     # Cloudflare Workers (API)
│   ├── src/
│   │   ├── index.ts            # Point d'entrée, routeur
│   │   ├── routes/
│   │   │   ├── themes.ts       # CRUD thématiques
│   │   │   ├── exercises.ts    # CRUD exercices
│   │   │   ├── labs.ts         # Gestion labs/containers
│   │   │   ├── files.ts        # Upload/download R2
│   │   │   └── admin.ts        # Routes administration
│   │   ├── lib/
│   │   │   ├── db.ts           # Helper D1
│   │   │   ├── r2.ts           # Helper R2
│   │   │   ├── kv.ts           # Helper KV
│   │   │   ├── containers.ts   # API Containers
│   │   │   └── auth.ts         # Authentification simple
│   │   ├── middleware/
│   │   │   ├── cors.ts         # Gestion CORS
│   │   │   └── auth.ts         # Middleware auth
│   │   └── types/
│   │       └── index.ts        # Types TypeScript
│   ├── wrangler.toml           # Configuration Wrangler
│   ├── package.json
│   └── tsconfig.json
│
├── database/                    # Schémas et migrations
│   ├── schema.sql              # Schéma initial
│   ├── seed.sql                # Données de test
│   └── migrations/
│       └── 001_initial.sql
│
├── containers/                  # Images Docker pour labs
│   ├── base-vnc/               # Image de base avec VNC
│   │   └── Dockerfile
│   ├── linux-basics/           # Lab Linux débutant
│   │   ├── Dockerfile
│   │   └── exercises/
│   ├── python-dev/             # Lab Python
│   │   ├── Dockerfile
│   │   └── exercises/
│   ├── cyber-kali/             # Lab Cybersécurité
│   │   ├── Dockerfile
│   │   └── exercises/
│   └── cloud-aws/              # Lab Cloud
│       ├── Dockerfile
│       └── exercises/
│
├── scripts/                     # Scripts utilitaires
│   ├── setup.sh                # Installation initiale
│   ├── deploy.sh               # Déploiement
│   └── seed-db.sh              # Peuplement DB
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD GitHub Actions
│
├── .gitignore
├── README.md
└── package.json                # Scripts racine
```

---

## 🗄️ Schéma Base de Données

### Tables

#### themes
| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT PK | Identifiant unique (uuid) |
| name | TEXT | Nom de la thématique |
| description | TEXT | Description longue |
| icon | TEXT | Nom de l'icône |
| color | TEXT | Couleur thème (hex) |
| order_index | INTEGER | Ordre d'affichage |
| created_at | TEXT | Date création |

#### exercises
| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT PK | Identifiant unique |
| theme_id | TEXT FK | Référence thème |
| title | TEXT | Titre exercice |
| description | TEXT | Description courte |
| difficulty | TEXT | débutant/intermédiaire/avancé |
| duration_minutes | INTEGER | Durée estimée |
| course_content | TEXT | Cours en Markdown |
| pdf_path | TEXT | Chemin PDF dans R2 |
| container_template_id | TEXT FK | Template container |
| order_index | INTEGER | Ordre dans le thème |
| created_at | TEXT | Date création |

#### container_templates
| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT PK | Identifiant unique |
| name | TEXT | Nom template |
| description | TEXT | Description |
| image_tag | TEXT | Tag image container |
| vnc_port | INTEGER | Port VNC (défaut 5900) |
| resources | TEXT | JSON {cpu, memory, timeout} |
| created_at | TEXT | Date création |

#### lab_sessions
| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT PK | Identifiant session |
| exercise_id | TEXT FK | Référence exercice |
| student_code | TEXT | Code élève |
| container_id | TEXT | ID container CF |
| vnc_url | TEXT | URL accès VNC |
| status | TEXT | running/stopped/expired |
| started_at | TEXT | Début session |
| expires_at | TEXT | Expiration |
| last_activity | TEXT | Dernière activité |

#### students (optionnel)
| Colonne | Type | Description |
|---------|------|-------------|
| code | TEXT PK | Code élève unique |
| name | TEXT | Nom affiché |
| email | TEXT | Email (optionnel) |
| created_at | TEXT | Date inscription |

---

## 🔌 API Endpoints

### Thématiques
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/themes | Liste toutes les thématiques |
| GET | /api/themes/:id | Détail d'une thématique |
| POST | /api/themes | Créer thématique (admin) |
| PUT | /api/themes/:id | Modifier thématique (admin) |
| DELETE | /api/themes/:id | Supprimer thématique (admin) |

### Exercices
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/themes/:id/exercises | Exercices d'un thème |
| GET | /api/exercises/:id | Détail exercice + cours |
| GET | /api/exercises/:id/pdf | Télécharger PDF |
| POST | /api/exercises | Créer exercice (admin) |
| PUT | /api/exercises/:id | Modifier exercice (admin) |
| DELETE | /api/exercises/:id | Supprimer exercice (admin) |

### Labs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/labs/start | Démarrer un lab |
| GET | /api/labs/:id | Statut d'un lab |
| GET | /api/labs/:id/vnc | URL connexion VNC |
| DELETE | /api/labs/:id | Arrêter un lab |
| POST | /api/labs/:id/extend | Prolonger session |

### Administration
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/admin/labs | Liste labs actifs |
| GET | /api/admin/stats | Statistiques usage |
| POST | /api/admin/cleanup | Nettoyer sessions expirées |
| POST | /api/admin/files/upload | Upload fichier R2 |

---

## 📅 Planning d'Implémentation

### Phase 1 : Initialisation (Jour 1)
- [x] Créer structure de fichiers
- [x] Rédiger documentation projet
- [ ] Créer compte Cloudflare
- [ ] Initialiser repository GitHub
- [ ] Premier commit documentation

### Phase 2 : Configuration Cloudflare (Jour 2)
- [ ] Créer projet Pages
- [ ] Créer base de données D1
- [ ] Créer bucket R2
- [ ] Créer namespace KV
- [ ] Créer Worker API
- [ ] Configurer wrangler.toml

### Phase 3 : Frontend Base (Jours 3-5)
- [ ] Page d'accueil avec design
- [ ] Navigation entre thématiques
- [ ] Page liste exercices
- [ ] Page détail exercice
- [ ] Intégration viewer PDF
- [ ] Design responsive mobile

### Phase 4 : API Backend (Jours 6-8)
- [ ] Configuration TypeScript
- [ ] Routes thématiques
- [ ] Routes exercices
- [ ] Gestion fichiers R2
- [ ] Middleware CORS
- [ ] Tests API

### Phase 5 : Labs Virtuels (Jours 9-12)
- [ ] Image Docker base avec VNC
- [ ] Configuration noVNC frontend
- [ ] API démarrage containers
- [ ] Proxy WebSocket VNC
- [ ] Gestion cycle de vie
- [ ] Tests labs complets

### Phase 6 : Administration (Jours 13-15)
- [ ] Interface admin
- [ ] CRUD thématiques
- [ ] CRUD exercices
- [ ] Upload PDFs
- [ ] Monitoring labs
- [ ] Nettoyage automatique

### Phase 7 : Finalisation (Jours 16-18)
- [ ] Tests end-to-end
- [ ] Optimisations performance
- [ ] Documentation utilisateur
- [ ] Déploiement production
- [ ] Formation utilisateurs

---

## 🚀 Guide de Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou pnpm
- Compte Cloudflare
- Compte GitHub

### Installation

```bash
# Cloner le repository
git clone https://github.com/VOTRE_USER/flexcampus.git
cd flexcampus

# Installer les dépendances
npm install

# Installer Wrangler CLI
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login
```

### Configuration Cloudflare

```bash
# Créer la base D1
wrangler d1 create flexcampus-db

# Créer le bucket R2
wrangler r2 bucket create flexcampus-storage

# Créer le namespace KV
wrangler kv:namespace create SESSIONS

# Appliquer le schéma
wrangler d1 execute flexcampus-db --file=./database/schema.sql
```

### Développement Local

```bash
# Frontend (avec live reload)
cd frontend && npx serve .

# API (mode développement)
cd workers && wrangler dev
```

### Déploiement

```bash
# Déployer le frontend
wrangler pages deploy frontend --project-name=flexcampus

# Déployer l'API
cd workers && wrangler deploy
```

---

## ⚠️ Points d'Attention

### Cloudflare Containers
- Service en beta, vérifier disponibilité
- Alternative : VPS externe avec Docker + Guacamole

### Limitations Workers
- 10ms CPU (gratuit) / 50ms (payant)
- WebSocket via Durable Objects recommandé pour VNC

### Sécurité
- Valider tous les inputs utilisateur
- Rate limiting sur API labs
- Timeout automatique des sessions
- Pas de données sensibles dans le code

### Coûts Estimés
| Service | Gratuit | Payant |
|---------|---------|--------|
| Pages | 500 builds/mois | $20/mois illimité |
| Workers | 100k req/jour | $5/10M req |
| D1 | 5M lectures/jour | $0.75/M |
| R2 | 10GB + 10M ops | $0.015/GB |
| KV | 100k lectures/jour | $0.50/M |

---

## 📞 Contacts & Ressources

### Documentation
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [noVNC](https://novnc.com/info.html)

### Support
- Issues GitHub : [flexcampus/issues](https://github.com/VOTRE_USER/flexcampus/issues)

---

*Document créé le : $(date)*
*Dernière mise à jour : $(date)*
