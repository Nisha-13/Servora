export class StateStore {
  constructor() {
    this.state = {
      user: null,
      token: localStorage.getItem('servora_token') || null,
      unreadNotificationCount: 0,
      unreadMessageCount: 0,
      savedServicesCount: 0,
      currentRoute: window.location.hash || '#/',
      favorites: new Set()
    };
    this.listeners = [];

    // Load initial user from localStorage if exists
    const storedUser = localStorage.getItem('servora_user');
    if (storedUser) {
      try {
        this.state.user = JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('servora_user');
      }
    }
  }

  get user() {
    return this.state.user;
  }

  get token() {
    return this.state.token;
  }

  get role() {
    return this.state.user?.role || 'GUEST';
  }

  get isAuthenticated() {
    return Boolean(this.state.token && this.state.user);
  }

  get savedServicesCount() {
    return this.state.savedServicesCount || 0;
  }

  setUser(user, token = null) {
    this.state.user = user;
    if (user) {
      localStorage.setItem('servora_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('servora_user');
    }

    if (token !== null) {
      this.state.token = token;
      if (token) {
        localStorage.setItem('servora_token', token);
      } else {
        localStorage.removeItem('servora_token');
      }
    }
    this.notify();
  }

  setSavedServicesCount(count) {
    this.state.savedServicesCount = Math.max(0, count);
    this.notify();
  }

  setUnreadNotificationCount(count) {
    this.state.unreadNotificationCount = count;
    this.notify();
  }

  setUnreadMessageCount(count) {
    this.state.unreadMessageCount = count;
    this.notify();
  }

  setCurrentRoute(route) {
    this.state.currentRoute = route;
    this.notify();
  }

  /** Alias for logout – called by app.js after explicit sign-out */
  clearUser() {
    this.logout();
  }

  /** Called on startup – state is already restored via constructor, this is a no-op hook */
  restore() {
    // State is restored from localStorage in the constructor.
    // This method exists so app.js can call restore() explicitly for clarity.
  }

  logout() {
    this.state.user = null;
    this.state.token = null;
    this.state.unreadNotificationCount = 0;
    this.state.unreadMessageCount = 0;
    this.state.favorites.clear();
    localStorage.removeItem('servora_token');
    localStorage.removeItem('servora_user');
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const store = new StateStore();
