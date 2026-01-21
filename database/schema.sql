-- FlexCampus Database Schema
-- Cloudflare D1 (SQLite compatible)

-- =============================================
-- THÉMATIQUES
-- =============================================
CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'folder',
    color TEXT DEFAULT '#3B82F6',
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Index pour tri par ordre
CREATE INDEX IF NOT EXISTS idx_themes_order ON themes(order_index);

-- =============================================
-- TEMPLATES DE CONTAINERS
-- =============================================
CREATE TABLE IF NOT EXISTS container_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_tag TEXT NOT NULL,
    vnc_port INTEGER DEFAULT 5900,
    resources TEXT DEFAULT '{"cpu": "0.5", "memory": "512Mi", "timeout": 7200}',
    created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- EXERCICES
-- =============================================
CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    theme_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK(difficulty IN ('débutant', 'intermédiaire', 'avancé')) DEFAULT 'débutant',
    duration_minutes INTEGER DEFAULT 60,
    course_content TEXT,
    pdf_path TEXT,
    container_template_id TEXT,
    order_index INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE,
    FOREIGN KEY (container_template_id) REFERENCES container_templates(id) ON DELETE SET NULL
);

-- Index pour recherche par thème
CREATE INDEX IF NOT EXISTS idx_exercises_theme ON exercises(theme_id);
CREATE INDEX IF NOT EXISTS idx_exercises_order ON exercises(theme_id, order_index);

-- =============================================
-- SESSIONS DE LABS
-- =============================================
CREATE TABLE IF NOT EXISTS lab_sessions (
    id TEXT PRIMARY KEY,
    exercise_id TEXT NOT NULL,
    student_code TEXT NOT NULL,
    container_id TEXT,
    vnc_url TEXT,
    status TEXT CHECK(status IN ('pending', 'starting', 'running', 'stopped', 'expired', 'error')) DEFAULT 'pending',
    extensions_used INTEGER DEFAULT 0,
    started_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    last_activity TEXT DEFAULT (datetime('now')),
    error_message TEXT,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Index pour recherche sessions actives
CREATE INDEX IF NOT EXISTS idx_lab_sessions_student ON lab_sessions(student_code);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_status ON lab_sessions(status);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_expires ON lab_sessions(expires_at);

-- =============================================
-- ÉTUDIANTS (optionnel, pour tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS students (
    code TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    last_seen TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- PROGRESSION (optionnel)
-- =============================================
CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_code TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('started', 'in_progress', 'completed')) DEFAULT 'started',
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    time_spent_minutes INTEGER DEFAULT 0,
    FOREIGN KEY (student_code) REFERENCES students(code) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    UNIQUE(student_code, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_code);

-- =============================================
-- LOGS D'ACTIVITÉ (optionnel)
-- =============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_code TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_student ON activity_logs(student_code);
