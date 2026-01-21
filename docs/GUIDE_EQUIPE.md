# FlexCampus - Guide de Collaboration pour l'Équipe

## Bienvenue dans l'équipe FlexCampus !

Ce document explique comment configurer votre environnement de développement local et travailler en collaboration sur le projet.

---

## ⚠️ RÈGLES IMPORTANTES

> **NE JAMAIS travailler directement sur la branche `main`**
>
> La branche `main` est connectée à la version en production. Toute modification directe affectera immédiatement le site en ligne.

> **TOUJOURS créer une branche pour vos modifications**
>
> Créez une branche avec votre nom ou la fonctionnalité sur laquelle vous travaillez.

---

## 🔗 Liens du Projet

| Ressource | URL |
|-----------|-----|
| **GitHub** | https://github.com/samirdawaliby/flexcampus |
| **Frontend (Production)** | https://flexcampus.pages.dev |
| **API (Production)** | https://flexcampus-api.flexcampus.workers.dev |
| **Dashboard Cloudflare** | https://dash.cloudflare.com (compte: flexcampus@caplogy.com) |

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 18+ → [Télécharger](https://nodejs.org/)
- **Git** → [Télécharger](https://git-scm.com/)
- **VS Code** (recommandé) → [Télécharger](https://code.visualstudio.com/)

Vérifiez vos installations :
```bash
node --version    # Doit afficher v18.x.x ou supérieur
npm --version     # Doit afficher 9.x.x ou supérieur
git --version     # Doit afficher 2.x.x
```

---

## 🚀 Installation en 5 étapes

### Étape 1 : Cloner le projet

```bash
# Ouvrez votre terminal et naviguez vers votre dossier de projets
cd ~/Desktop  # ou votre dossier préféré

# Clonez le repository
git clone https://github.com/samirdawaliby/flexcampus.git

# Entrez dans le dossier
cd flexcampus
```

### Étape 2 : Créer VOTRE branche de travail

```bash
# Créez une branche avec votre prénom (OBLIGATOIRE)
git checkout -b dev/votre-prenom

# Exemples :
# git checkout -b dev/marie
# git checkout -b dev/thomas
# git checkout -b feature/ajout-theme-devops
```

### Étape 3 : Installer les dépendances

```bash
# Installer les dépendances du Worker API
cd workers
npm install
cd ..
```

### Étape 4 : Configurer Wrangler (Cloudflare CLI)

```bash
# Installer Wrangler globalement
npm install -g wrangler

# Se connecter au compte Cloudflare
wrangler login
```

> 📌 Un navigateur s'ouvrira. Connectez-vous avec :
> - **Email** : flexcampus@caplogy.com
> - **Mot de passe** : (demandez à Samir)

Vérifiez la connexion :
```bash
wrangler whoami
# Doit afficher "flexcampus@caplogy.com"
```

### Étape 5 : Lancer l'environnement de développement

**Terminal 1 - API Backend :**
```bash
cd workers
npm run dev
# L'API sera disponible sur http://localhost:8787
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npx serve .
# Le frontend sera disponible sur http://localhost:3000
```

---

## 📁 Structure du Projet

```
flexcampus/
├── frontend/                # Interface utilisateur
│   ├── index.html          # Page principale
│   ├── css/style.css       # Styles (couleurs FlexCampus)
│   └── js/
│       ├── api.js          # Client API
│       └── app.js          # Logique application
│
├── workers/                 # API Backend (Cloudflare Workers)
│   ├── src/index.ts        # Point d'entrée API
│   ├── wrangler.toml       # Configuration Cloudflare
│   └── package.json
│
├── database/                # Schémas SQL
│   ├── schema.sql          # Structure des tables
│   └── seed.sql            # Données de test
│
└── docs/                    # Documentation
    ├── PLAN_PROJET.md      # Plan détaillé
    ├── API.md              # Documentation API
    └── GUIDE_EQUIPE.md     # Ce fichier
```

---

## 🎨 Couleurs de la Marque FlexCampus

Utilisez ces couleurs dans vos développements :

| Couleur | Code Hex | Usage |
|---------|----------|-------|
| **Bleu Marine** | `#0d3865` | Couleur principale, headers |
| **Bleu Marine Foncé** | `#092847` | Dégradés, hover states |
| **Cyan/Turquoise** | `#6dcbdd` | Boutons, accents, CTA |
| **Cyan Light** | `#8ed8e6` | Hover sur boutons |
| **Blanc** | `#ffffff` | Arrière-plans |
| **Gris Clair** | `#f8fafc` | Arrière-plan général |
| **Gris Texte** | `#334155` | Texte principal |

---

## 🔄 Workflow Git (Comment travailler)

### 1. Avant de commencer à coder

```bash
# Assurez-vous d'être sur votre branche
git branch  # L'étoile * indique votre branche actuelle

# Récupérez les dernières modifications
git fetch origin
git pull origin main  # Récupère les updates de main
```

### 2. Pendant que vous codez

```bash
# Sauvegardez régulièrement votre travail
git add .
git commit -m "Description de ce que vous avez fait"

# Exemples de bons messages de commit :
# "Ajout du bouton de déconnexion"
# "Correction du bug d'affichage sur mobile"
# "Mise à jour des styles du header"
```

### 3. Pour partager votre travail

```bash
# Poussez votre branche sur GitHub
git push origin dev/votre-prenom
```

### 4. Pour fusionner avec main (après validation)

1. Allez sur GitHub : https://github.com/samirdawaliby/flexcampus
2. Cliquez sur "Pull requests" > "New pull request"
3. Sélectionnez votre branche
4. Décrivez vos modifications
5. Attendez la validation de Samir avant de merger

---

## 🛠️ Commandes Utiles

### Git
```bash
git status                    # Voir l'état de vos fichiers
git branch                    # Voir toutes les branches
git checkout main             # Revenir sur main
git checkout dev/votre-prenom # Revenir sur votre branche
git log --oneline -5          # Voir les 5 derniers commits
```

### Wrangler (Cloudflare)
```bash
wrangler dev                  # Lancer l'API en local
wrangler whoami               # Vérifier le compte connecté
wrangler d1 execute flexcampus-db --local --command="SELECT * FROM themes"  # Requête DB locale
```

### NPM
```bash
npm install                   # Installer les dépendances
npm run dev                   # Lancer en mode développement
```

---

## ❓ FAQ

### "J'ai fait des modifications sur main par erreur"

```bash
# Annulez vos modifications locales
git checkout -- .
git checkout -b dev/votre-prenom
```

### "Je veux récupérer les modifications d'un collègue"

```bash
git fetch origin
git checkout dev/nom-collegue
```

### "J'ai un conflit Git"

1. Ouvrez les fichiers marqués en conflit
2. Cherchez les marqueurs `<<<<<<<`, `=======`, `>>>>>>>`
3. Gardez le code que vous voulez conserver
4. Supprimez les marqueurs
5. `git add .` puis `git commit`

### "L'API ne démarre pas"

```bash
cd workers
rm -rf node_modules
npm install
npm run dev
```

---

## 📞 Support

- **Problème technique** : Contactez Samir
- **Question sur le projet** : Consultez `/docs/PLAN_PROJET.md`
- **Documentation API** : Consultez `/docs/API.md`

---

## ✅ Checklist de Démarrage

- [ ] J'ai cloné le repository
- [ ] J'ai créé ma branche `dev/mon-prenom`
- [ ] J'ai installé les dépendances (`npm install` dans `/workers`)
- [ ] J'ai installé Wrangler (`npm install -g wrangler`)
- [ ] Je me suis connecté à Cloudflare (`wrangler login`)
- [ ] J'arrive à lancer l'API en local (`npm run dev`)
- [ ] J'arrive à voir le frontend en local (`npx serve .`)

---

*Dernière mise à jour : Janvier 2026*
