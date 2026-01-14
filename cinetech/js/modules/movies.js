/**
 * movies.js
 * Module for managing Movie data and UI (Full CRUD).
 */
import { Storage } from '../storage.js';
import { CategoriesModule } from './categories.js';

export const MoviesModule = {
    init() {
        console.log('Movies Module Init');
        this.cacheDOM();
        this.bindEvents();
        this.renderList();
    },

    cacheDOM() {
        this.listContainer = document.getElementById('movies-list');
        this.formContainer = document.getElementById('movie-form-container');
        this.form = document.getElementById('movie-form');
        this.addBtn = document.getElementById('btn-add-movie');
        this.cancelBtn = document.getElementById('btn-cancel-movie');
        this.formTitle = document.getElementById('form-title');

        // Inputs
        this.idInput = document.getElementById('movie-id');
        this.titleInput = document.getElementById('movie-title');
        this.categorySelect = document.getElementById('movie-category');
        this.yearInput = document.getElementById('movie-year');
        this.durationInput = document.getElementById('movie-duration');
        this.ratingInput = document.getElementById('movie-rating');

        // Filters
        this.searchInput = document.getElementById('movie-search');
        this.sortSelect = document.getElementById('movie-sort');
    },

    bindEvents() {
        // Show Form
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => {
                this.resetForm();
                this.updateCategoryOptions();
                this.formContainer.classList.remove('hidden');
                this.titleInput.focus();
            });
        }

        // Search & Sort with Debounce
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.renderList());
        }
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => this.renderList());
        }

        // Cancel Form
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                this.formContainer.classList.add('hidden');
            });
        }

        // Submit Form (Add/Edit)
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveMovie();
            });
        }

        // Event delegation for Edit/Delete
        if (this.listContainer) {
            this.listContainer.addEventListener('click', (e) => {
                // Handle Delete
                if (e.target.closest('.btn-delete-movie')) {
                    const id = e.target.closest('.btn-delete-movie').dataset.id;
                    this.deleteMovie(id);
                }
                // Handle Edit
                if (e.target.closest('.btn-edit-movie')) {
                    const id = e.target.closest('.btn-edit-movie').dataset.id;
                    this.editMovie(id);
                }
            });
        }
    },

    getAll() {
        return Storage.get('movies') || [];
    },

    updateCategoryOptions() {
        const categories = CategoriesModule.getAll();
        this.categorySelect.innerHTML = '<option value="">-- Sélectionner --</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            this.categorySelect.appendChild(option);
        });
    },

    resetForm() {
        this.form.reset();
        this.idInput.value = '';
        this.formTitle.textContent = 'Nouveau Film';
    },

    saveMovie() {
        const title = this.titleInput.value.trim();
        const categoryId = this.categorySelect.value;
        const year = parseInt(this.yearInput.value);
        const duration = parseInt(this.durationInput.value);
        const rating = parseFloat(this.ratingInput.value);
        const id = this.idInput.value;

        if (!title || !categoryId || isNaN(year) || isNaN(rating)) {
            alert('Veuillez remplir tous les champs correctement.');
            return;
        }

        let movies = this.getAll();

        if (id) {
            // Update existing
            const index = movies.findIndex(m => m.id === id);
            if (index !== -1) {
                movies[index] = { ...movies[index], title, categoryId, year, duration, rating };
            }
        } else {
            // Create new
            const newMovie = {
                id: 'mov_' + Date.now(),
                title,
                categoryId,
                year,
                duration,
                rating,
                addedAt: new Date().toISOString()
            };
            movies.push(newMovie);
        }

        Storage.set('movies', movies);
        this.formContainer.classList.add('hidden');
        this.renderList();
    },

    deleteMovie(id) {
        if (!confirm('Voulez-vous vraiment supprimer ce film ?')) return;

        let movies = this.getAll();
        movies = movies.filter(m => m.id !== id);
        Storage.set('movies', movies);
        this.renderList();
    },

    editMovie(id) {
        const movies = this.getAll();
        const movie = movies.find(m => m.id === id);
        if (!movie) return;

        this.updateCategoryOptions();

        this.idInput.value = movie.id;
        this.titleInput.value = movie.title;
        this.categorySelect.value = movie.categoryId;
        this.yearInput.value = movie.year;
        this.durationInput.value = movie.duration;
        this.ratingInput.value = movie.rating;

        this.formTitle.textContent = 'Modifier Film';
        this.formContainer.classList.remove('hidden');
        this.titleInput.focus();

        // Scroll to form
        this.formContainer.scrollIntoView({ behavior: 'smooth' });
    },

    renderList() {
        if (!this.listContainer) return;

        let movies = this.getAll();
        const categories = CategoriesModule.getAll();
        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        const sortMode = this.sortSelect ? this.sortSelect.value : 'title';

        // Filter
        if (searchTerm) {
            movies = movies.filter(m => {
                const cat = categories.find(c => c.id === m.categoryId);
                const catName = cat ? cat.name.toLowerCase() : '';
                return m.title.toLowerCase().includes(searchTerm) || catName.includes(searchTerm);
            });
        }

        // Sort
        movies.sort((a, b) => {
            if (sortMode === 'title') return a.title.localeCompare(b.title);
            if (sortMode === 'rating') return b.rating - a.rating; // Descending
            if (sortMode === 'year') return b.year - a.year; // Descending
            return 0;
        });

        this.listContainer.innerHTML = '';

        if (movies.length === 0) {
            this.listContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Aucun film trouvé.</p>';
            return;
        }

        movies.forEach(movie => {
            const cat = categories.find(c => c.id === movie.categoryId);
            const catName = cat ? cat.name : 'Inconnu';

            // Random gradient for poster since we don't handle images
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <div class="movie-poster-placeholder">
                    ${movie.title.charAt(0).toUpperCase()}
                </div>
                <div class="movie-info">
                    <div class="movie-header">
                        <div class="movie-title">${movie.title}</div>
                        <div class="movie-rating">★ ${movie.rating}</div>
                    </div>
                    <div class="movie-meta">
                        <span>${movie.year}</span> • 
                        <span>${catName}</span> • 
                        <span>${movie.duration} min</span>
                    </div>
                    <div class="movie-actions">
                        <button class="btn btn-sm btn-primary btn-edit-movie" data-id="${movie.id}">Modifier</button>
                        <button class="btn btn-sm btn-danger btn-delete-movie" data-id="${movie.id}">Supprimer</button>
                    </div>
                </div>
            `;
            this.listContainer.appendChild(card);
        });
    }
};

