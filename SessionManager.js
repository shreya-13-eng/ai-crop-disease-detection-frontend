class SessionManager {

    static instance;
    SESSION_KEY = "app_session";

    constructor() {
        if (SessionManager.instance) {
            return SessionManager.instance;
        }
        SessionManager.instance = this;
    }

    static getInstance() {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }


    login({ fullName, username, token }) {
        const sessionData = {
            fullName,
            username,
            token
        };

        localStorage.setItem(
            this.SESSION_KEY,
            JSON.stringify(sessionData)
        );
    }

    getCurrentSession() {
        const data = localStorage.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : null;
    }

    
    getToken() {
        const session = this.getCurrentSession();
        return session ? session.token : null;
    }

   
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
    }


    isLoggedIn() {
        return this.getCurrentSession() !== null;
    }
}

export default SessionManager;