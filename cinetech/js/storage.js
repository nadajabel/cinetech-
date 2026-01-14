/**
 * storage.js
 * Wrapper for LocalStorage with a project-specific prefix.
 */

const APP_PREFIX = 'CINETECH_';

export const Storage = {
    /**
     * Get data from LocalStorage
     * @param {string} key - The key to retrieve
     * @returns {any} - The parsed JSON data or null
     */
    get(key) {
        try {
            const data = localStorage.getItem(APP_PREFIX + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    },

    /**
     * Save data to LocalStorage
     * @param {string} key - The key to save to
     * @param {any} value - The data to save
     */
    set(key, value) {
        try {
            localStorage.setItem(APP_PREFIX + key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to storage:', error);
        }
    },

    /**
     * Remove data from LocalStorage
     * @param {string} key - The key to remove
     */
    remove(key) {
        localStorage.removeItem(APP_PREFIX + key);
    },

    /**
     * Clear all CINETECH specific data (optional utility)
     */
    clearApp() {
        Object.keys(localStorage).forEach(k => {
            if(k.startsWith(APP_PREFIX)) {
                localStorage.removeItem(k);
            }
        });
    }
};
