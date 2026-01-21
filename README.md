# FlexCampus

Plateforme d'apprentissage IT pour étudiants avec labs virtuels.

## Fonctionnalités

- **Thématiques** : IA/ML, Cybersécurité, Cloud, Développement
- **Cours** : Contenu Markdown + PDF téléchargeables
- **Labs virtuels** : Environnements Linux accessibles via VNC dans le navigateur
- **Administration** : Gestion des contenus et monitoring

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | HTML/CSS/JS (Cloudflare Pages) |
| API | TypeScript (Cloudflare Workers) |
| Database | SQLite (Cloudflare D1) |
| Storage | Cloudflare R2 |
| Sessions | Cloudflare KV |
| Labs | Cloudflare Containers + noVNC |

## Démarrage Rapide

### Prérequis

- Node.js 18+
- Compte Cloudflare
- Wrangler CLI

### Installation

```bash
# Cloner le projet
git clone https://github.com/VOTRE_USER/flexcampus.git
cd flexcampus

# Installer Wrangler
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login
```

### Configuration Cloudflare

```bash
# Créer les ressources
wrangler d1 create flexcampus-db
wrangler r2 bucket create flexcampus-storage
wrangler kv:namespace create SESSIONS

# Mettre à jour workers/wrangler.toml avec les IDs générés

# Appliquer le schéma DB
wrangler d1 execute flexcampus-db --file=./database/schema.sql
```

### Développement Local

```bash
# API
cd workers && npm install && wrangler dev

# Frontend (dans un autre terminal)
cd frontend && npx serve .
```

### Déploiement

```bash
# Frontend
wrangler pages deploy frontend --project-name=flexcampus

# API
cd workers && wrangler deploy
```

## Documentation

- [Plan de Projet](./docs/PLAN_PROJET.md) - Architecture et planning
- [Documentation API](./docs/API.md) - Endpoints et exemples
- [Guide de Déploiement](./docs/DEPLOYMENT.md) - Instructions complètes

## Structure

```
flexcampus/
├── frontend/          # Interface utilisateur (Pages)
├── workers/           # API backend (Workers)
├── database/          # Schémas SQL (D1)
├── containers/        # Images Docker labs
└── docs/              # Documentation
```

## Licence

MIT
