// FlexCampus - Application principale

// État de l'application
const state = {
    themes: [],
    currentTheme: null,
    currentExercise: null,
    currentLabSession: null,
};

// Éléments DOM
const elements = {
    themesNav: document.getElementById('themes-nav'),
    themesGrid: document.getElementById('themes-grid'),
    exercisesList: document.getElementById('exercises-list'),
    courseContent: document.getElementById('course-content'),
    studentCodeInput: document.getElementById('studentCode'),
    loading: document.getElementById('loading'),
};

// =============================================
// INITIALISATION
// =============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Charger le code élève depuis localStorage
    const savedCode = localStorage.getItem('studentCode');
    if (savedCode) {
        elements.studentCodeInput.value = savedCode;
    }

    // Sauvegarder le code élève
    elements.studentCodeInput.addEventListener('change', (e) => {
        localStorage.setItem('studentCode', e.target.value);
    });

    // Initialiser les onglets
    initTabs();

    // Charger les thématiques
    await loadThemes();
});

// =============================================
// CHARGEMENT DES DONNÉES
// =============================================

async function loadThemes() {
    showLoading(true);
    try {
        const response = await api.getThemes();
        state.themes = response.data;
        renderThemesNav();
        renderThemesGrid();
    } catch (error) {
        console.error('Erreur chargement thématiques:', error);
        alert('Erreur lors du chargement des thématiques');
    } finally {
        showLoading(false);
    }
}

async function loadTheme(themeId) {
    showLoading(true);
    try {
        const response = await api.getTheme(themeId);
        state.currentTheme = response.data;
        renderThemeView();
        showView('theme');

        // Mettre à jour la nav
        document.querySelectorAll('.theme-nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.themeId === themeId);
        });
    } catch (error) {
        console.error('Erreur chargement thème:', error);
        alert('Erreur lors du chargement de la thématique');
    } finally {
        showLoading(false);
    }
}

async function loadExercise(exerciseId) {
    showLoading(true);
    try {
        const response = await api.getExercise(exerciseId);
        state.currentExercise = response.data;
        renderExerciseView();
        showView('exercise');
    } catch (error) {
        console.error('Erreur chargement exercice:', error);
        alert('Erreur lors du chargement de l\'exercice');
    } finally {
        showLoading(false);
    }
}

// =============================================
// RENDU
// =============================================

function renderThemesNav() {
    const icons = {
        'brain': '🧠',
        'shield': '🛡️',
        'cloud': '☁️',
        'code': '💻',
        'folder': '📁',
    };

    elements.themesNav.innerHTML = state.themes.map(theme => `
        <div class="theme-nav-item" data-theme-id="${theme.id}" onclick="loadTheme('${theme.id}')">
            <span class="theme-dot" style="background: ${theme.color}"></span>
            <span>${theme.name}</span>
        </div>
    `).join('');
}

function renderThemesGrid() {
    const icons = {
        'brain': '🧠',
        'shield': '🛡️',
        'cloud': '☁️',
        'code': '💻',
        'folder': '📁',
    };

    elements.themesGrid.innerHTML = state.themes.map(theme => `
        <div class="theme-card" style="--theme-color: ${theme.color}" onclick="loadTheme('${theme.id}')">
            <div class="theme-icon">${icons[theme.icon] || '📁'}</div>
            <h3>${theme.name}</h3>
            <p>${theme.description}</p>
            <div class="theme-stats">
                <span>📚 ${theme.exercise_count} exercices</span>
            </div>
        </div>
    `).join('');
}

function renderThemeView() {
    const theme = state.currentTheme;
    const icons = {
        'brain': '🧠',
        'shield': '🛡️',
        'cloud': '☁️',
        'code': '💻',
        'folder': '📁',
    };

    document.getElementById('theme-title').innerHTML = `${icons[theme.icon] || '📁'} ${theme.name}`;
    document.getElementById('theme-description').textContent = theme.description;

    elements.exercisesList.innerHTML = theme.exercises.map(ex => `
        <div class="exercise-card" onclick="loadExercise('${ex.id}')">
            <div class="exercise-info">
                <h3>${ex.title}</h3>
                <p>${ex.description || ''}</p>
            </div>
            <div class="exercise-meta">
                <span class="badge ${ex.difficulty.toLowerCase().replace('é', 'e')}">${ex.difficulty}</span>
                <span>⏱ ${ex.duration_minutes} min</span>
                <div class="exercise-icons">
                    ${ex.has_lab ? '🖥️' : ''}
                    ${ex.has_pdf ? '📄' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderExerciseView() {
    const exercise = state.currentExercise;

    document.getElementById('exercise-title').textContent = exercise.title;
    document.getElementById('exercise-difficulty').textContent = exercise.difficulty;
    document.getElementById('exercise-difficulty').className = `badge ${exercise.difficulty.toLowerCase().replace('é', 'e')}`;
    document.getElementById('exercise-duration').textContent = `⏱ ${exercise.duration_minutes} min`;

    // Rendu du contenu Markdown
    if (exercise.course_content) {
        elements.courseContent.innerHTML = marked.parse(exercise.course_content);
    } else {
        elements.courseContent.innerHTML = '<p>Aucun contenu de cours disponible.</p>';
    }

    // Bouton retour
    document.getElementById('btn-back-to-theme').onclick = () => {
        if (state.currentTheme) {
            showView('theme');
        } else {
            showView('home');
        }
    };

    // Configuration du lab
    const startBtn = document.getElementById('btn-start-lab');
    const stopBtn = document.getElementById('btn-stop-lab');

    if (exercise.container_id) {
        startBtn.style.display = 'inline-flex';
        startBtn.onclick = () => startLab(exercise.id);
        stopBtn.onclick = () => stopLab();
    } else {
        startBtn.style.display = 'none';
        document.getElementById('lab-status').textContent = 'Pas de lab disponible pour cet exercice';
    }

    // Reset tab to course
    document.querySelectorAll('.tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === 0);
    });
    document.querySelectorAll('.tab-content').forEach((content, i) => {
        content.classList.toggle('active', i === 0);
    });
}

// =============================================
// GESTION DES LABS
// =============================================

async function startLab(exerciseId) {
    const studentCode = elements.studentCodeInput.value.trim();

    if (!studentCode) {
        alert('Veuillez entrer votre code élève dans la sidebar');
        elements.studentCodeInput.focus();
        return;
    }

    const statusEl = document.getElementById('lab-status');
    const startBtn = document.getElementById('btn-start-lab');
    const stopBtn = document.getElementById('btn-stop-lab');
    const vncContainer = document.getElementById('vnc-container');

    try {
        statusEl.textContent = 'Démarrage du lab...';
        statusEl.className = 'lab-status starting';
        startBtn.disabled = true;

        const response = await api.startLab(exerciseId, studentCode);
        state.currentLabSession = response.data;

        statusEl.textContent = `Lab en cours de démarrage... (Session: ${state.currentLabSession.session_id})`;
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
        vncContainer.style.display = 'flex';

        // Polling pour vérifier le statut
        pollLabStatus(state.currentLabSession.session_id);

    } catch (error) {
        console.error('Erreur démarrage lab:', error);
        statusEl.textContent = `Erreur: ${error.message}`;
        statusEl.className = 'lab-status';
        startBtn.disabled = false;
    }
}

async function pollLabStatus(sessionId) {
    const statusEl = document.getElementById('lab-status');

    try {
        const response = await api.getLabStatus(sessionId);
        const session = response.data;
        state.currentLabSession = session;

        if (session.status === 'running' && session.vnc_url) {
            statusEl.textContent = 'Lab prêt !';
            statusEl.className = 'lab-status running';
            // TODO: Connecter noVNC
            document.querySelector('.vnc-placeholder').textContent =
                'Lab prêt ! L\'intégration VNC sera disponible prochainement.';
        } else if (session.status === 'starting') {
            statusEl.textContent = 'Lab en cours de démarrage...';
            statusEl.className = 'lab-status starting';
            // Continuer le polling
            setTimeout(() => pollLabStatus(sessionId), 3000);
        } else if (session.status === 'error') {
            statusEl.textContent = `Erreur: ${session.error_message || 'Erreur inconnue'}`;
            statusEl.className = 'lab-status';
        }
    } catch (error) {
        console.error('Erreur polling lab:', error);
    }
}

async function stopLab() {
    if (!state.currentLabSession) return;

    const statusEl = document.getElementById('lab-status');
    const startBtn = document.getElementById('btn-start-lab');
    const stopBtn = document.getElementById('btn-stop-lab');
    const vncContainer = document.getElementById('vnc-container');

    try {
        await api.stopLab(state.currentLabSession.session_id);

        state.currentLabSession = null;
        statusEl.textContent = 'Lab arrêté';
        statusEl.className = 'lab-status';
        startBtn.style.display = 'inline-flex';
        startBtn.disabled = false;
        stopBtn.style.display = 'none';
        vncContainer.style.display = 'none';

    } catch (error) {
        console.error('Erreur arrêt lab:', error);
        alert('Erreur lors de l\'arrêt du lab');
    }
}

// =============================================
// NAVIGATION
// =============================================

function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`view-${viewName}`).classList.add('active');

    // Mettre à jour la nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
}

function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;

            // Update tab buttons
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.toggle('active', t.dataset.tab === tabName);
            });

            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === `tab-${tabName}`);
            });
        });
    });
}

// =============================================
// UTILITAIRES
// =============================================

function showLoading(show) {
    elements.loading.classList.toggle('active', show);
}

// Navigation home via sidebar
document.querySelector('[data-view="home"]')?.addEventListener('click', () => {
    showView('home');
    document.querySelectorAll('.theme-nav-item').forEach(el => el.classList.remove('active'));
});
