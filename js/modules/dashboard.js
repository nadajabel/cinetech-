/**
 * dashboard.js
 * Module for Dashboard stats and Charts.
 */
import { Storage } from '../storage.js';
import { CategoriesModule } from './categories.js';

export const DashboardModule = {
    charts: {},

    init() {
        console.log('Dashboard Module Init');
        this.cacheDOM();
        // Update stats initially
        this.updateStats();

        // Listen for route changes to refresh charts if needed (or simple polling/event)
        // Ideally we'd use an EventBus, but here we can just update when 'dashboard' is active
        // Alternatively, we expose an update method called by main.

        // Simple hack: update stats every time we click the dashboard link
        const dashboardLink = document.querySelector('a[href="#dashboard"]');
        if (dashboardLink) {
            dashboardLink.addEventListener('click', () => {
                setTimeout(() => this.updateStats(), 50);
            });
        }
    },

    cacheDOM() {
        this.kpiTotal = document.getElementById('kpi-total-movies');
        this.kpiAvg = document.getElementById('kpi-avg-rating');
        this.kpiCats = document.getElementById('kpi-total-categories');
    },

    updateStats() {
        const movies = Storage.get('movies') || [];
        const categories = CategoriesModule.getAll();

        if (this.kpiTotal) this.kpiTotal.textContent = movies.length;
        if (this.kpiCats) this.kpiCats.textContent = categories.length;

        const avg = movies.length > 0
            ? (movies.reduce((sum, m) => sum + (+m.rating), 0) / movies.length).toFixed(1)
            : '0.0';

        if (this.kpiAvg) this.kpiAvg.textContent = avg;

        this.renderCharts(movies, categories);
    },

    renderCharts(movies, categories) {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        // 1. Movies by Genre
        const genreCounts = {};
        categories.forEach(c => genreCounts[c.name] = 0);
        movies.forEach(m => {
            const cat = categories.find(c => c.id === m.categoryId);
            if (cat) {
                genreCounts[cat.name] = (genreCounts[cat.name] || 0) + 1;
            } else {
                genreCounts['Unknown'] = (genreCounts['Unknown'] || 0) + 1;
            }
        });

        const ctxGenre = document.getElementById('moviesByGenreChart');
        if (ctxGenre) {
            if (this.charts.genre) this.charts.genre.destroy();
            this.charts.genre = new Chart(ctxGenre, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(genreCounts),
                    datasets: [{
                        data: Object.values(genreCounts),
                        backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#94a3b8' } },
                        title: { display: true, text: 'Films par Catégorie', color: '#f1f5f9' }
                    }
                }
            });
        }

        // 2. Movies by Year
        const yearCounts = {};
        movies.forEach(m => {
            yearCounts[m.year] = (yearCounts[m.year] || 0) + 1;
        });
        // Sort years
        const sortedYears = Object.keys(yearCounts).sort();

        const ctxYear = document.getElementById('moviesByYearChart');
        if (ctxYear) {
            if (this.charts.year) this.charts.year.destroy();
            this.charts.year = new Chart(ctxYear, {
                type: 'bar',
                data: {
                    labels: sortedYears,
                    datasets: [{
                        label: 'Nombre de films',
                        data: sortedYears.map(y => yearCounts[y]),
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#94a3b8', stepSize: 1 },
                            grid: { color: '#334155' }
                        },
                        x: {
                            ticks: { color: '#94a3b8' },
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Films par Année', color: '#f1f5f9' }
                    }
                }
            });
        }
    }
};

