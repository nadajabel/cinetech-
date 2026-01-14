/**
 * categories.js
 * Module for managing Categories (CRUD: Create, Read, Delete).
 */
import { Storage } from '../storage.js';

export const CategoriesModule = {
    init() {
        console.log('Categories Module Init');
        this.cacheDOM();
        this.bindEvents();


        // Seed initial data if empty
        if (!Storage.get('categories')) {
            const defaults = [
                { id: 'cat_1', name: 'Action' },
                { id: 'cat_2', name: 'Drame' },
                { id: 'cat_3', name: 'Science-Fiction' },
                { id: 'cat_4', name: 'Comédie' },
                { id: 'cat_5', name: 'Romance' },
            ];
            Storage.set('categories', defaults);
        }

        // Ensure "Comedy" exists and is unique (handle French/English duplicates)
        const allCats = this.getAll();
        const frenchIndex = allCats.findIndex(c => c.name.toLowerCase() === 'comédie');
        const englishIndex = allCats.findIndex(c => c.name.toLowerCase() === 'comedy');

        if (frenchIndex !== -1 && englishIndex !== -1) {
            // Both exist, remove French (keep English as requested)
            allCats.splice(frenchIndex, 1);
            Storage.set('categories', allCats);
        } else if (frenchIndex !== -1) {
            // Only French exists, rename to English
            allCats[frenchIndex].name = 'Comedy';
            Storage.set('categories', allCats);
        } else if (englishIndex === -1) {
            // Neither exists, add Comedy
            allCats.push({ id: 'cat_' + Date.now(), name: 'Comedy' });
            Storage.set('categories', allCats);
        }

        this.renderList();
    },

    cacheDOM() {
        this.listBody = document.getElementById('categories-list-body');
        this.formContainer = document.getElementById('category-form-container');
        this.addBtn = document.getElementById('btn-open-cat-form');
        this.cancelBtn = document.getElementById('btn-cancel-cat');
        this.form = document.getElementById('category-form');
        this.nameInput = document.getElementById('cat-name');
    },

    bindEvents() {
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => {
                this.formContainer.classList.remove('hidden');
                this.nameInput.focus();
            });
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                this.formContainer.classList.add('hidden');
                this.form.reset();
            });
        }

        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCategory();
            });
        }

        // Event delegation for delete
        if (this.listBody) {
            this.listBody.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-delete-cat')) {
                    const id = e.target.dataset.id;
                    this.deleteCategory(id);
                }
            });
        }
    },

    getAll() {
        return Storage.get('categories') || [];
    },

    addCategory() {
        const name = this.nameInput.value.trim();
        if (!name) return;

        const categories = this.getAll();

        // Simple duplicate check
        if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            alert('Cette catégorie existe déjà !');
            return;
        }

        const newCat = {
            id: 'cat_' + Date.now(),
            name: name
        };

        categories.push(newCat);
        Storage.set('categories', categories);

        this.renderList();
        this.form.reset();
        this.formContainer.classList.add('hidden');
    },

    deleteCategory(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        let categories = this.getAll();
        categories = categories.filter(c => c.id !== id);
        Storage.set('categories', categories);
        this.renderList();
    },

    renderList() {
        if (!this.listBody) return;

        const categories = this.getAll();

        // Sort alphabetically
        categories.sort((a, b) => a.name.localeCompare(b.name));

        // Get movie counts per category for the UI
        const movies = Storage.get('movies') || [];

        this.listBody.innerHTML = '';
        categories.forEach(cat => {
            const count = movies.filter(m => m.categoryId === cat.id).length;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${cat.name}</strong></td>
                <td><span class="movie-rating">${count} films</span></td>
                <td>
                    <button class="btn btn-sm btn-danger btn-delete-cat" data-id="${cat.id}">Supprimer</button>
                </td>
            `;
            this.listBody.appendChild(tr);
        });

        // Update global KPI if Dashboard module listens or on refresh
        // For now, simpler to leave update to Dashboard Init or specific event
    }
};

