
// SessionManager.js - Simple session management
class SessionManager {
    constructor() {
        this.sessionKey = 'agriscan_session';
        this.session = null;
        this.loadSession();
    }
    
    static getInstance() {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }
    
    loadSession() {
        const saved = localStorage.getItem(this.sessionKey);
        if (saved) {
            try {
                this.session = JSON.parse(saved);
            } catch (e) {
                this.session = null;
            }
        }
    }
    
    saveSession() {
        if (this.session) {
            localStorage.setItem(this.sessionKey, JSON.stringify(this.session));
        } else {
            localStorage.removeItem(this.sessionKey);
        }
    }
    
    login(userData) {
        this.session = {
            ...userData,
            loginTime: new Date().toISOString()
        };
        this.saveSession();
        return true;
    }
    
    logout() {
        this.session = null;
        this.saveSession();
        return true;
    }
    
    isLoggedIn() {
        return this.session !== null;
    }
    
    getCurrentSession() {
        return this.session;
    }
    
    getToken() {
        return this.session?.token || null;
    }
    
    getUser() {
        return this.session;
    }
}

export default SessionManager;