# FlexCampus - Guide de Déploiement

## Table des Matières
1. [Prérequis](#prérequis)
2. [Création Compte Cloudflare](#création-compte-cloudflare)
3. [Configuration Initiale](#configuration-initiale)
4. [Déploiement Frontend (Pages)](#déploiement-frontend-pages)
5. [Déploiement API (Workers)](#déploiement-api-workers)
6. [Configuration Base de Données (D1)](#configuration-base-de-données-d1)
7. [Configuration Stockage (R2)](#configuration-stockage-r2)
8. [Configuration Sessions (KV)](#configuration-sessions-kv)
9. [Variables d'Environnement](#variables-denvironnement)
10. [CI/CD avec GitHub Actions](#cicd-avec-github-actions)
11. [Domaine Personnalisé](#domaine-personnalisé)

---

## Prérequis

### Logiciels Requis
- **Node.js** 18.0 ou supérieur
- **npm** 9.0+ ou **pnpm** 8.0+
- **Git** 2.30+
- **Wrangler CLI** (installé globalement)

### Comptes Requis
- Compte **GitHub** (pour le code source)
- Compte **Cloudflare** (gratuit pour commencer)

### Vérification Installation
```bash
node --version    # v18.0.0+
npm --version     # 9.0.0+
git --version     # 2.30+
wrangler --version # 3.0.0+
```

---

## Création Compte Cloudflare

### Étape 1 : Inscription
1. Aller sur [dash.cloudflare.com](https://dash.cloudflare.com)
2. Cliquer sur "Sign Up"
3. Entrer email et mot de passe
4. Vérifier l'email reçu

### Étape 2 : Configuration du Compte
1. Connectez-vous au dashboard
2. Ignorez l'ajout de domaine pour l'instant (optionnel)
3. Allez dans **Workers & Pages** dans le menu gauche

### Étape 3 : Connexion Wrangler
```bash
# Se connecter à Cloudflare via le navigateur
wrangler login

# Vérifier la connexion
wrangler whoami
```

---

## Configuration Initiale

### Création des Ressources Cloudflare

```bash
# 1. Créer la base de données D1
wrangler d1 create flexcampus-db
# Noter le database_id retourné !

# 2. Créer le bucket R2
wrangler r2 bucket create flexcampus-storage

# 3. Créer le namespace KV pour les sessions
wrangler kv:namespace create SESSIONS
# Noter le namespace_id retourné !

# 4. Créer le namespace KV pour preview (dev)
wrangler kv:namespace create SESSIONS --preview
# Noter le preview_id retourné !
```

### Configuration wrangler.toml

Après avoir créé les ressources, mettez à jour `workers/wrangler.toml` :

```toml
name = "flexcampus-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Base de données D1
[[d1_databases]]
binding = "DB"
database_name = "flexcampus-db"
database_id = "VOTRE_DATABASE_ID_ICI"

# Stockage R2
[[r2_buckets]]
binding = "R2"
bucket_name = "flexcampus-storage"

# Sessions KV
[[kv_namespaces]]
binding = "SESSIONS"
id = "VOTRE_KV_ID_ICI"
preview_id = "VOTRE_KV_PREVIEW_ID_ICI"

# Variables d'environnement
[vars]
ENVIRONMENT = "production"

# Secrets (à configurer via wrangler secret)
# ADMIN_API_KEY = "..."
```

---

## Déploiement Frontend (Pages)

### Option A : Déploiement Direct

```bash
# Depuis la racine du projet
wrangler pages deploy frontend --project-name=flexcampus
```

### Option B : Connexion GitHub (Recommandé)

1. Allez dans **Workers & Pages** > **Create application** > **Pages**
2. Cliquez sur **Connect to Git**
3. Autorisez Cloudflare sur votre compte GitHub
4. Sélectionnez le repository `flexcampus`
5. Configurez :
   - **Production branch** : `main`
   - **Build command** : (laisser vide, pas de build)
   - **Build output directory** : `frontend`
6. Cliquez **Save and Deploy**

### Configuration Pages
```
Nom du projet : flexcampus
Répertoire racine : /frontend
Branche production : main
```

**URL résultante** : `https://flexcampus.pages.dev`

---

## Déploiement API (Workers)

### Déploiement Initial

```bash
cd workers

# Installer les dépendances
npm install

# Déployer
wrangler deploy
```

### Configuration des Secrets

```bash
# Clé API admin (générer une clé sécurisée)
wrangler secret put ADMIN_API_KEY
# Entrer la valeur quand demandé

# Autres secrets si nécessaire
wrangler secret put JWT_SECRET
```

**URL résultante** : `https://flexcampus-api.VOTRE_SUBDOMAIN.workers.dev`

---

## Configuration Base de Données (D1)

### Appliquer le Schéma

```bash
# Appliquer le schéma initial
wrangler d1 execute flexcampus-db --file=./database/schema.sql

# Vérifier les tables
wrangler d1 execute flexcampus-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### Insérer les Données de Test

```bash
# Appliquer les données de seed
wrangler d1 execute flexcampus-db --file=./database/seed.sql
```

### Commandes Utiles D1

```bash
# Voir toutes les bases
wrangler d1 list

# Exécuter une requête
wrangler d1 execute flexcampus-db --command="SELECT * FROM themes"

# Export de la base
wrangler d1 export flexcampus-db --output=backup.sql
```

---

## Configuration Stockage (R2)

### Upload de Fichiers

```bash
# Upload un fichier PDF
wrangler r2 object put flexcampus-storage/pdfs/ia-ml/tp1.pdf --file=./local/tp1.pdf

# Lister les objets
wrangler r2 object list flexcampus-storage

# Télécharger un fichier
wrangler r2 object get flexcampus-storage/pdfs/ia-ml/tp1.pdf --file=./downloaded.pdf
```

### Structure Recommandée R2

```
flexcampus-storage/
├── pdfs/
│   ├── ia-ml/
│   │   ├── tp1-intro-python.pdf
│   │   └── tp2-numpy.pdf
│   ├── cybersecurity/
│   │   └── tp1-linux-basics.pdf
│   └── ...
├── images/
│   └── themes/
└── exports/
```

### Accès Public (optionnel)

Pour rendre R2 accessible publiquement :
1. Dashboard Cloudflare > R2 > flexcampus-storage
2. Settings > Public access > Enable
3. Configurer un domaine personnalisé ou utiliser r2.dev

---

## Configuration Sessions (KV)

KV est automatiquement configuré via `wrangler.toml`. Vérification :

```bash
# Lister les namespaces
wrangler kv:namespace list

# Écrire une valeur de test
wrangler kv:key put --namespace-id=VOTRE_ID "test" "hello"

# Lire la valeur
wrangler kv:key get --namespace-id=VOTRE_ID "test"

# Supprimer
wrangler kv:key delete --namespace-id=VOTRE_ID "test"
```

---

## Variables d'Environnement

### Variables Publiques (wrangler.toml)

```toml
[vars]
ENVIRONMENT = "production"
ALLOWED_ORIGINS = "https://flexcampus.pages.dev"
LAB_TIMEOUT_MINUTES = "120"
MAX_LABS_PER_STUDENT = "2"
```

### Secrets (wrangler secret)

```bash
# Configuration des secrets
wrangler secret put ADMIN_API_KEY      # Clé admin
wrangler secret put JWT_SECRET         # Secret JWT si utilisé

# Lister les secrets configurés
wrangler secret list
```

### Variables par Environnement

```toml
# Production
[env.production.vars]
ENVIRONMENT = "production"
LOG_LEVEL = "error"

# Staging
[env.staging.vars]
ENVIRONMENT = "staging"
LOG_LEVEL = "debug"
```

Déploiement par environnement :
```bash
wrangler deploy --env production
wrangler deploy --env staging
```

---

## CI/CD avec GitHub Actions

### Fichier `.github/workflows/deploy.yml`

```yaml
name: Deploy FlexCampus

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    name: Deploy Frontend to Pages
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: flexcampus
          directory: frontend
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}

  deploy-api:
    runs-on: ubuntu-latest
    name: Deploy API to Workers
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd workers && npm ci

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: workers
```

### Configuration Secrets GitHub

1. Allez dans Settings > Secrets > Actions
2. Ajoutez :
   - `CLOUDFLARE_API_TOKEN` : Token API Cloudflare
   - `CLOUDFLARE_ACCOUNT_ID` : ID de votre compte

### Créer un Token API Cloudflare

1. Dashboard > My Profile > API Tokens
2. Create Token > Custom Token
3. Permissions :
   - Account > Cloudflare Pages > Edit
   - Account > Workers Scripts > Edit
   - Account > Workers KV Storage > Edit
   - Account > D1 > Edit
   - Account > R2 > Edit
4. Copier le token généré

---

## Domaine Personnalisé

### Pour Pages (Frontend)

1. Dashboard > Pages > flexcampus > Custom domains
2. Add custom domain
3. Entrer : `app.votredomaine.com`
4. Suivre les instructions DNS

### Pour Workers (API)

1. Dashboard > Workers > flexcampus-api > Triggers
2. Custom Domains > Add
3. Entrer : `api.votredomaine.com`
4. Activer

### Configuration DNS

Si votre domaine est sur Cloudflare :
```
Type    Name    Content                         Proxy
CNAME   app     flexcampus.pages.dev           Proxied
CNAME   api     flexcampus-api.workers.dev     Proxied
```

---

## Vérification du Déploiement

### Checklist

- [ ] Frontend accessible : `https://flexcampus.pages.dev`
- [ ] API répond : `https://flexcampus-api.xxx.workers.dev/api/themes`
- [ ] Base D1 contient les données
- [ ] R2 contient les PDFs
- [ ] CORS fonctionne (frontend → API)
- [ ] Secrets configurés

### Tests Rapides

```bash
# Test API
curl https://flexcampus-api.xxx.workers.dev/api/themes

# Test avec jq pour formater
curl -s https://flexcampus-api.xxx.workers.dev/api/themes | jq .
```

---

## Dépannage

### Erreur CORS
Vérifier que `ALLOWED_ORIGINS` inclut l'URL du frontend.

### D1 : Table non trouvée
Réappliquer le schéma : `wrangler d1 execute flexcampus-db --file=./database/schema.sql`

### Worker 500 Error
Consulter les logs : Dashboard > Workers > flexcampus-api > Logs

### Pages 404
Vérifier que `index.html` est à la racine du dossier `frontend`.

---

## Commandes Utiles

```bash
# Voir les logs en temps réel
wrangler tail

# Statut des déploiements
wrangler deployments list

# Rollback
wrangler rollback

# Développement local complet
wrangler dev --local --persist
```
