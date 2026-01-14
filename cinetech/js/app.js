/**
 * app.js
 * Main entry point. Initializes modules.
 */

// GLOBAL ERROR HANDLER FOR DEBUGGING
window.onerror = function (msg, url, line, col, error) {
    alert("Erreur JS : " + msg + "\nLigne : " + line);
    return false;
};

import { Router } from './router.js';
import { MoviesModule } from './modules/movies.js';
import { CategoriesModule } from './modules/categories.js';
import { DashboardModule } from './modules/dashboard.js';
import { ApiModule } from './api/api.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('CINE TECH App Initializing...');

    try {
        // Initialize Router
        Router.init();

        // Initialize Modules
        CategoriesModule.init();
        MoviesModule.init();
        DashboardModule.init();
        ApiModule.init();

        console.log('Modules loaded successfully');

        // Mobile Sidebar Toggle
        const toggleBtn = document.getElementById('toggle-menu');
        const sidebar = document.querySelector('.sidebar');

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
    } catch (e) {
        alert('Erreur lors de l\'initialisation de l\'application : ' + e.message);
        console.error(e);
    }
});
