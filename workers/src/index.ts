import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Types pour les bindings Cloudflare
type Bindings = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  // R2: R2Bucket; // À activer quand R2 sera configuré
  ENVIRONMENT: string;
  ALLOWED_ORIGINS: string;
  ADMIN_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('*', async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  return cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Student-Code'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
  })(c, next);
});

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'FlexCampus API',
    version: '1.0.0',
    status: 'running',
    environment: c.env.ENVIRONMENT || 'development',
  });
});

// =============================================
// ROUTES THÉMATIQUES
// =============================================

// GET /api/themes - Liste toutes les thématiques
app.get('/api/themes', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT
        t.id, t.name, t.description, t.icon, t.color, t.order_index,
        COUNT(e.id) as exercise_count
      FROM themes t
      LEFT JOIN exercises e ON e.theme_id = t.id AND e.is_active = 1
      GROUP BY t.id
      ORDER BY t.order_index
    `).all();

    return c.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return c.json({ success: false, error: { code: 'DB_ERROR', message: 'Erreur base de données' } }, 500);
  }
});

// GET /api/themes/:id - Détail d'une thématique
app.get('/api/themes/:id', async (c) => {
  const themeId = c.req.param('id');

  try {
    const theme = await c.env.DB.prepare(`
      SELECT id, name, description, icon, color, order_index
      FROM themes WHERE id = ?
    `).bind(themeId).first();

    if (!theme) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Thématique non trouvée' } }, 404);
    }

    const { results: exercises } = await c.env.DB.prepare(`
      SELECT id, title, description, difficulty, duration_minutes,
             CASE WHEN container_template_id IS NOT NULL THEN 1 ELSE 0 END as has_lab,
             CASE WHEN pdf_path IS NOT NULL THEN 1 ELSE 0 END as has_pdf
      FROM exercises
      WHERE theme_id = ? AND is_active = 1
      ORDER BY order_index
    `).bind(themeId).all();

    return c.json({ success: true, data: { ...theme, exercises } });
  } catch (error) {
    console.error('Error fetching theme:', error);
    return c.json({ success: false, error: { code: 'DB_ERROR', message: 'Erreur base de données' } }, 500);
  }
});

// =============================================
// ROUTES EXERCICES
// =============================================

// GET /api/exercises/:id - Détail d'un exercice avec cours
app.get('/api/exercises/:id', async (c) => {
  const exerciseId = c.req.param('id');

  try {
    const exercise = await c.env.DB.prepare(`
      SELECT
        e.id, e.theme_id, e.title, e.description, e.difficulty,
        e.duration_minutes, e.course_content, e.order_index,
        CASE WHEN e.pdf_path IS NOT NULL THEN 1 ELSE 0 END as has_pdf,
        ct.id as container_id, ct.name as container_name
      FROM exercises e
      LEFT JOIN container_templates ct ON e.container_template_id = ct.id
      WHERE e.id = ?
    `).bind(exerciseId).first();

    if (!exercise) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Exercice non trouvé' } }, 404);
    }

    return c.json({ success: true, data: exercise });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return c.json({ success: false, error: { code: 'DB_ERROR', message: 'Erreur base de données' } }, 500);
  }
});

// GET /api/themes/:themeId/exercises - Liste exercices d'un thème
app.get('/api/themes/:themeId/exercises', async (c) => {
  const themeId = c.req.param('themeId');

  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, title, description, difficulty, duration_minutes,
             CASE WHEN container_template_id IS NOT NULL THEN 1 ELSE 0 END as has_lab,
             CASE WHEN pdf_path IS NOT NULL THEN 1 ELSE 0 END as has_pdf
      FROM exercises
      WHERE theme_id = ? AND is_active = 1
      ORDER BY order_index
    `).bind(themeId).all();

    return c.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return c.json({ success: false, error: { code: 'DB_ERROR', message: 'Erreur base de données' } }, 500);
  }
});

// =============================================
// ROUTES LABS
// =============================================

// POST /api/labs/start - Démarrer un lab
app.post('/api/labs/start', async (c) => {
  try {
    const body = await c.req.json();
    const { exercise_id, student_code } = body;

    if (!exercise_id || !student_code) {
      return c.json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'exercise_id et student_code requis' }
      }, 400);
    }

    // Vérifier que l'exercice existe et a un container
    const exercise = await c.env.DB.prepare(`
      SELECT e.id, e.title, ct.image_tag, ct.resources
      FROM exercises e
      JOIN container_templates ct ON e.container_template_id = ct.id
      WHERE e.id = ?
    `).bind(exercise_id).first();

    if (!exercise) {
      return c.json({
        success: false,
        error: { code: 'NO_LAB', message: 'Cet exercice n\'a pas de lab associé' }
      }, 404);
    }

    // Créer une session (simulation - les vrais containers seront implémentés plus tard)
    const sessionId = `lab-${student_code}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2h

    await c.env.DB.prepare(`
      INSERT INTO lab_sessions (id, exercise_id, student_code, status, expires_at)
      VALUES (?, ?, ?, 'starting', ?)
    `).bind(sessionId, exercise_id, student_code, expiresAt).run();

    return c.json({
      success: true,
      data: {
        session_id: sessionId,
        status: 'starting',
        vnc_url: null,
        expires_at: expiresAt,
        message: 'Le lab démarre, veuillez patienter...'
      }
    });
  } catch (error) {
    console.error('Error starting lab:', error);
    return c.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Erreur serveur' } }, 500);
  }
});

// GET /api/labs/:sessionId - Statut d'un lab
app.get('/api/labs/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');

  try {
    const session = await c.env.DB.prepare(`
      SELECT id, exercise_id, student_code, container_id, vnc_url,
             status, started_at, expires_at, extensions_used
      FROM lab_sessions
      WHERE id = ?
    `).bind(sessionId).first();

    if (!session) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Session non trouvée' } }, 404);
    }

    return c.json({ success: true, data: session });
  } catch (error) {
    console.error('Error fetching lab session:', error);
    return c.json({ success: false, error: { code: 'DB_ERROR', message: 'Erreur base de données' } }, 500);
  }
});

// DELETE /api/labs/:sessionId - Arrêter un lab
app.delete('/api/labs/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');

  try {
    await c.env.DB.prepare(`
      UPDATE lab_sessions SET status = 'stopped' WHERE id = ?
    `).bind(sessionId).run();

    return c.json({ success: true, message: 'Lab arrêté avec succès' });
  } catch (error) {
    console.error('Error stopping lab:', error);
    return c.json({ success: false, error: { code: 'DB_ERROR', message: 'Erreur base de données' } }, 500);
  }
});

// =============================================
// ROUTES ADMIN
// =============================================

// Middleware admin
const adminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const apiKey = c.env.ADMIN_API_KEY;

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Accès non autorisé' } }, 401);
  }

  await next();
};

// GET /api/admin/stats - Statistiques
app.get('/api/admin/stats', adminAuth, async (c) => {
  try {
    const themes = await c.env.DB.prepare('SELECT COUNT(*) as count FROM themes').first();
    const exercises = await c.env.DB.prepare('SELECT COUNT(*) as count FROM exercises WHERE is_active = 1').first();
    const activeLabs = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM lab_sessions WHERE status IN ('running', 'starting')
    `).first();

    return c.json({
      success: true,
      data: {
        total_themes: themes?.count || 0,
        total_exercises: exercises?.count || 0,
        active_labs: activeLabs?.count || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ success: false, error: { code: 'DB_ERROR', message: 'Erreur base de données' } }, 500);
  }
});

// GET /api/admin/labs - Liste des labs actifs
app.get('/api/admin/labs', adminAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT ls.*, e.title as exercise_title
      FROM lab_sessions ls
      JOIN exercises e ON ls.exercise_id = e.id
      WHERE ls.status IN ('running', 'starting')
      ORDER BY ls.started_at DESC
    `).all();

    return c.json({ success: true, data: { active_count: results.length, labs: results } });
  } catch (error) {
    console.error('Error fetching active labs:', error);
    return c.json({ success: false, error: { code: 'DB_ERROR', message: 'Erreur base de données' } }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Route non trouvée' } }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Erreur serveur interne' } }, 500);
});

export default app;
