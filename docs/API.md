# FlexCampus - Documentation API

## Base URL

```
Production : https://flexcampus-api.VOTRE_SUBDOMAIN.workers.dev
Développement : http://localhost:8787
```

## Authentification

### Élèves
Les élèves utilisent un code simple pour identifier leurs sessions :
```
Header: X-Student-Code: ABC123
```

### Administration
Les routes admin requièrent une clé API :
```
Header: Authorization: Bearer VOTRE_CLE_API
```

---

## Endpoints

### 🎨 Thématiques

#### GET /api/themes
Liste toutes les thématiques disponibles.

**Réponse**
```json
{
  "success": true,
  "data": [
    {
      "id": "ia-ml",
      "name": "Intelligence Artificielle",
      "description": "Découvrez le machine learning et le deep learning",
      "icon": "brain",
      "color": "#8B5CF6",
      "exerciseCount": 12,
      "order_index": 1
    },
    {
      "id": "cybersecurity",
      "name": "Cybersécurité",
      "description": "Apprenez à sécuriser les systèmes",
      "icon": "shield",
      "color": "#EF4444",
      "exerciseCount": 8,
      "order_index": 2
    }
  ]
}
```

#### GET /api/themes/:id
Détail d'une thématique avec ses exercices.

**Paramètres**
| Nom | Type | Description |
|-----|------|-------------|
| id | string | ID de la thématique |

**Réponse**
```json
{
  "success": true,
  "data": {
    "id": "ia-ml",
    "name": "Intelligence Artificielle",
    "description": "Découvrez le machine learning...",
    "icon": "brain",
    "color": "#8B5CF6",
    "exercises": [
      {
        "id": "intro-python-ml",
        "title": "Introduction à Python pour le ML",
        "difficulty": "débutant",
        "duration_minutes": 45
      }
    ]
  }
}
```

---

### 📚 Exercices

#### GET /api/themes/:themeId/exercises
Liste les exercices d'une thématique.

**Réponse**
```json
{
  "success": true,
  "data": [
    {
      "id": "intro-python-ml",
      "title": "Introduction à Python pour le ML",
      "description": "Premiers pas avec NumPy et Pandas",
      "difficulty": "débutant",
      "duration_minutes": 45,
      "has_lab": true,
      "has_pdf": true
    }
  ]
}
```

#### GET /api/exercises/:id
Détail complet d'un exercice avec le cours.

**Réponse**
```json
{
  "success": true,
  "data": {
    "id": "intro-python-ml",
    "theme_id": "ia-ml",
    "title": "Introduction à Python pour le ML",
    "description": "Premiers pas avec NumPy et Pandas",
    "difficulty": "débutant",
    "duration_minutes": 45,
    "course_content": "# Introduction\n\nDans ce cours...",
    "has_pdf": true,
    "container_template": {
      "id": "python-dev",
      "name": "Python Development"
    }
  }
}
```

#### GET /api/exercises/:id/pdf
Télécharge le PDF du TP.

**Réponse**
- Content-Type: application/pdf
- Le fichier PDF en téléchargement

---

### 🖥️ Labs Virtuels

#### POST /api/labs/start
Démarre une session de lab.

**Corps de la requête**
```json
{
  "exercise_id": "intro-python-ml",
  "student_code": "ABC123"
}
```

**Réponse**
```json
{
  "success": true,
  "data": {
    "session_id": "lab-abc123-1234567890",
    "status": "starting",
    "vnc_url": null,
    "expires_at": "2024-01-15T16:00:00Z",
    "message": "Le lab démarre, veuillez patienter..."
  }
}
```

#### GET /api/labs/:sessionId
Récupère le statut d'une session de lab.

**Réponse (en démarrage)**
```json
{
  "success": true,
  "data": {
    "session_id": "lab-abc123-1234567890",
    "status": "starting",
    "vnc_url": null,
    "started_at": "2024-01-15T14:00:00Z",
    "expires_at": "2024-01-15T16:00:00Z"
  }
}
```

**Réponse (prêt)**
```json
{
  "success": true,
  "data": {
    "session_id": "lab-abc123-1234567890",
    "status": "running",
    "vnc_url": "wss://lab-abc123.flexcampus.workers.dev/websockify",
    "started_at": "2024-01-15T14:00:00Z",
    "expires_at": "2024-01-15T16:00:00Z",
    "time_remaining_minutes": 115
  }
}
```

#### DELETE /api/labs/:sessionId
Arrête une session de lab.

**Réponse**
```json
{
  "success": true,
  "message": "Lab arrêté avec succès"
}
```

#### POST /api/labs/:sessionId/extend
Prolonge une session de lab (max 1 fois).

**Réponse**
```json
{
  "success": true,
  "data": {
    "new_expires_at": "2024-01-15T17:00:00Z",
    "extensions_remaining": 0
  }
}
```

---

### 🔧 Administration

> Toutes les routes admin requièrent `Authorization: Bearer API_KEY`

#### GET /api/admin/labs
Liste toutes les sessions de lab actives.

**Réponse**
```json
{
  "success": true,
  "data": {
    "active_count": 5,
    "labs": [
      {
        "session_id": "lab-abc123-1234567890",
        "student_code": "ABC123",
        "exercise_title": "Introduction Python ML",
        "status": "running",
        "started_at": "2024-01-15T14:00:00Z",
        "expires_at": "2024-01-15T16:00:00Z"
      }
    ]
  }
}
```

#### GET /api/admin/stats
Statistiques d'utilisation.

**Réponse**
```json
{
  "success": true,
  "data": {
    "total_themes": 4,
    "total_exercises": 32,
    "active_labs": 5,
    "total_lab_sessions_today": 23,
    "popular_exercises": [
      {"id": "intro-python-ml", "title": "...", "sessions": 45}
    ]
  }
}
```

#### POST /api/admin/cleanup
Nettoie les sessions expirées.

**Réponse**
```json
{
  "success": true,
  "data": {
    "cleaned_sessions": 12,
    "freed_containers": 8
  }
}
```

#### POST /api/admin/files/upload
Upload un fichier vers R2.

**Corps** : multipart/form-data
| Champ | Type | Description |
|-------|------|-------------|
| file | File | Le fichier à upload |
| path | string | Chemin dans R2 (ex: pdfs/theme1/tp1.pdf) |

**Réponse**
```json
{
  "success": true,
  "data": {
    "path": "pdfs/theme1/tp1.pdf",
    "size": 1234567,
    "url": "https://flexcampus-storage.r2.dev/pdfs/theme1/tp1.pdf"
  }
}
```

---

## Codes d'Erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide (paramètres manquants) |
| 401 | Non authentifié |
| 403 | Accès refusé (admin requis) |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes (rate limit) |
| 500 | Erreur serveur |

**Format d'erreur**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Le champ exercise_id est requis"
  }
}
```

---

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| GET /api/* | 100 req/min |
| POST /api/labs/start | 5 req/min par student_code |
| POST /api/admin/* | 30 req/min |

---

## Exemples d'Utilisation

### JavaScript (Fetch)
```javascript
// Récupérer les thématiques
const response = await fetch('https://api.flexcampus.dev/api/themes');
const { data: themes } = await response.json();

// Démarrer un lab
const labResponse = await fetch('https://api.flexcampus.dev/api/labs/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Student-Code': 'ABC123'
  },
  body: JSON.stringify({
    exercise_id: 'intro-python-ml',
    student_code: 'ABC123'
  })
});
const { data: lab } = await labResponse.json();
```

### cURL
```bash
# Liste des thématiques
curl https://api.flexcampus.dev/api/themes

# Démarrer un lab
curl -X POST https://api.flexcampus.dev/api/labs/start \
  -H "Content-Type: application/json" \
  -H "X-Student-Code: ABC123" \
  -d '{"exercise_id":"intro-python-ml","student_code":"ABC123"}'

# Admin: stats
curl https://api.flexcampus.dev/api/admin/stats \
  -H "Authorization: Bearer VOTRE_CLE_API"
```
