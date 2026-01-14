/**
 * api.js
 * Module for External API integration (TVMaze Public API).
 */

export const ApiModule = {
    init() {
        console.log('API Module Init');
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM() {
        this.btnFetch = document.getElementById('btn-fetch-api');
        this.resultsContainer = document.getElementById('api-results');
        this.loadingIndicator = document.getElementById('api-loading');
        this.errorContainer = document.getElementById('api-error');
    },

    bindEvents() {
        if (this.btnFetch) {
            this.btnFetch.addEventListener('click', () => this.fetchData());
        }
    },

    fetchData() {
        this.toggleLoading(true);
        this.errorContainer.classList.add('hidden');
        this.resultsContainer.innerHTML = '';

        // API Endpoint: Search for "Cinema" to get random movies/shows
        const endpoint = 'https://api.tvmaze.com/search/shows?q=movie';

        fetch(endpoint)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                this.displayResults(data);
            })
            .catch(error => {
                console.error('API Error:', error);
                this.errorContainer.textContent = 'Erreur lors du chargement : ' + error.message;
                this.errorContainer.classList.remove('hidden');
            })
            .finally(() => {
                this.toggleLoading(false);
            });
    },

    toggleLoading(show) {
        if (show) this.loadingIndicator.classList.remove('hidden');
        else this.loadingIndicator.classList.add('hidden');
    },

    displayResults(data) {
        if (!data || data.length === 0) {
            this.resultsContainer.innerHTML = '<p>Aucun résultat trouvé.</p>';
            return;
        }

        // Limit to 10 items
        const items = data.slice(0, 10);

        items.forEach(item => {
            const show = item.show;
            const div = document.createElement('div');
            div.className = 'api-movie-card';

            const rating = show.rating.average ? `★ ${show.rating.average}` : '';
            const img = show.image && show.image.medium ? show.image.medium : null;
            const year = show.premiered ? show.premiered.split('-')[0] : 'N/A';

            // Just visual
            div.innerHTML = `
                <div style="font-weight:700; color: #3b82f6; margin-bottom:0.5rem;">${show.name}</div>
                <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.5rem;">
                    ${year} • ${show.genres.join(', ') || 'Unknown'}
                </div>
                 <div style="font-size:0.8rem; font-weight:bold; color: #22c55e;">
                    ${rating}
                </div>
            `;
            this.resultsContainer.appendChild(div);
        });

        // Update a KPI (e.g., Total loaded) - Prompt requirement
        // We can just append a KPI card here dynamically or update one if exists
        const count = items.length;
        this.errorContainer.innerHTML = `<span style="color: #22c55e;">Succès ! ${count} éléments récupérés.</span>`;
        this.errorContainer.classList.remove('hidden');
    }
};
