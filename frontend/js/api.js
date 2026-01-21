// FlexCampus API Client

const API_BASE_URL = 'https://flexcampus-api.flexcampus.workers.dev';

class FlexCampusAPI {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Ajouter le code élève si disponible
        const studentCode = localStorage.getItem('studentCode');
        if (studentCode) {
            config.headers['X-Student-Code'] = studentCode;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Erreur API');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Thématiques
    async getThemes() {
        return this.request('/api/themes');
    }

    async getTheme(themeId) {
        return this.request(`/api/themes/${themeId}`);
    }

    // Exercices
    async getExercise(exerciseId) {
        return this.request(`/api/exercises/${exerciseId}`);
    }

    async getThemeExercises(themeId) {
        return this.request(`/api/themes/${themeId}/exercises`);
    }

    // Labs
    async startLab(exerciseId, studentCode) {
        return this.request('/api/labs/start', {
            method: 'POST',
            body: JSON.stringify({
                exercise_id: exerciseId,
                student_code: studentCode,
            }),
        });
    }

    async getLabStatus(sessionId) {
        return this.request(`/api/labs/${sessionId}`);
    }

    async stopLab(sessionId) {
        return this.request(`/api/labs/${sessionId}`, {
            method: 'DELETE',
        });
    }
}

// Instance globale
const api = new FlexCampusAPI();
