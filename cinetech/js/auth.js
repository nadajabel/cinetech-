/**
 * auth.js
 * Handles user authentication using localStorage.
 */

const USERS_KEY = 'cinetech_users';
const CURRENT_USER_KEY = 'cinetech_current_user';

export const AuthModule = {
    init() {
        if (!localStorage.getItem(USERS_KEY)) {
            localStorage.setItem(USERS_KEY, JSON.stringify([]));
        }
    },

    getUsers() {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    },

    register(username, password) {
        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            throw new Error('Ce nom d\'utilisateur existe déjà.');
        }

        const newUser = { username, password }; // Note: In a real app, hash the password!
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        this.login(username, password);
        return newUser;
    },

    login(username, password) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            return user;
        } else {
            throw new Error('Nom d\'utilisateur ou mot de passe incorrect.');
        }
    },

    logout() {
        localStorage.removeItem(CURRENT_USER_KEY);
        // Force reload or router update could handle this, but for now we just clear state
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    },

    isAuthenticated() {
        return !!localStorage.getItem(CURRENT_USER_KEY);
    }
};
