/**
 * router.js
 * Handles basic SPA routing by toggling section visibility based on hash.
 */

export const Router = {
    init() {
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        // Handle init load
        this.handleRoute();
    },

    handleRoute() {
        let hash = window.location.hash.substring(1) || 'dashboard'; // Default to dashboard

        // Normalize hash (remove query params if any)
        hash = hash.split('?')[0];

        // Valid routes
        const routes = ['dashboard', 'movies', 'categories', 'api'];
        if (!routes.includes(hash)) {
            hash = 'dashboard';
        }

        this.updateView(hash);
        this.updateSidebar(hash);
    },

    updateView(activeId) {
        // Hide all sections
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });

        // Show active section
        const activeSection = document.getElementById(activeId);
        if (activeSection) {
            activeSection.classList.remove('hidden');
            // Little delay to allow display:block to apply before opacity transition
            setTimeout(() => activeSection.classList.add('active'), 10);

            // Update Title
            const titles = {
                'dashboard': 'Dashboard',
                'movies': 'Gestion des Films',
                'categories': 'Gestion des Catégories',
                'api': 'Données & API'
            };
            document.getElementById('current-page-title').textContent = titles[activeId];
        }
    },

    updateSidebar(activeId) {
        document.querySelectorAll('.nav-item').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + activeId) {
                link.classList.add('active');
            }
        });

        // Mobile menu auto-close
        if (window.innerWidth < 768) {
            document.querySelector('.sidebar').classList.remove('open');
        }
    }
};
