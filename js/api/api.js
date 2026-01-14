/**
 * api.js
 * Module for External API integration (TVMaze Public API).
 */
import { MoviesModule } from '../modules/movies.js';
import { CategoriesModule } from '../modules/categories.js';

export const ApiModule = {
    init() {
        console.log('API Module Init');
        this.cacheDOM();
        this.bindEvents();

        // Check if we need to auto-populate (if empty library)
        const movies = MoviesModule.getAll();
        if (movies.length === 0) {
            console.log('Library empty. Auto-populating...');
            this.autoPopulate();
        }
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

    autoPopulate() {
        // Use a better query for "movies" - searching "cinema" or specific high-rated shows
        const endpoint = 'https://api.tvmaze.com/search/shows?q=cinema';

        if (this.loadingIndicator) this.toggleLoading(true);

        fetch(endpoint)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    // Limit to 20 items for initial population
                    const items = data.slice(0, 20);
                    const moviesToAdd = [];

                    items.forEach(item => {
                        const show = item.show;
                        const year = show.premiered ? show.premiered.split('-')[0] : '2020';

                        // Map Category
                        const categories = CategoriesModule.getAll();
                        let catId = categories.length > 0 ? categories[0].id : '';
                        if (categories.length > 0 && show.genres && show.genres.length > 0) {
                            const matchingCat = categories.find(c => c.name.toLowerCase() === show.genres[0].toLowerCase());
                            if (matchingCat) catId = matchingCat.id;
                        }

                        moviesToAdd.push({
                            title: show.name,
                            year: parseInt(year) || new Date().getFullYear(),
                            duration: show.runtime || 60,
                            rating: show.rating && show.rating.average ? show.rating.average : (Math.floor(Math.random() * 5) + 5), // Mock rating if missing
                            poster: show.image && show.image.medium ? show.image.medium : null,
                            categoryId: catId
                        });
                    });

                    MoviesModule.addMoviesBulk(moviesToAdd);

                    if (this.errorContainer) {
                        this.errorContainer.innerHTML = `<span style="color: #22c55e;">Films ajoutés automatiquement !</span>`;
                        this.errorContainer.classList.remove('hidden');
                    }
                }
            })
            .catch(err => console.error('Auto-populate error:', err))
            .finally(() => {
                if (this.loadingIndicator) this.toggleLoading(false);
            });
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
                <button class="btn btn-sm btn-success btn-add-api" style="margin-top:0.5rem; width:100%;">+ Ajouter</button>
            `;

            const btnAdd = div.querySelector('.btn-add-api');
            btnAdd.addEventListener('click', () => {
                const categories = CategoriesModule.getAll();
                // Try to match category by name (first genre), else default to first category
                let catId = '';
                if (categories.length > 0) {
                    catId = categories[0].id; // Default
                    if (show.genres && show.genres.length > 0) {
                        const matchingCat = categories.find(c => c.name.toLowerCase() === show.genres[0].toLowerCase());
                        if (matchingCat) catId = matchingCat.id;
                    }
                }

                const movieData = {
                    title: show.name,
                    year: parseInt(year) || new Date().getFullYear(),
                    duration: show.runtime || 0,
                    rating: show.rating && show.rating.average ? show.rating.average : 0,
                    poster: img,
                    categoryId: catId
                };

                MoviesModule.addMovieFromApi(movieData);
            });

            this.resultsContainer.appendChild(div);
        });

        // Update a KPI (e.g., Total loaded) - Prompt requirement
        // We can just append a KPI card here dynamically or update one if exists
        const count = items.length;
        this.errorContainer.innerHTML = `<span style="color: #22c55e;">Succès ! ${count} éléments récupérés.</span>`;
        this.errorContainer.classList.remove('hidden');
    }
};
