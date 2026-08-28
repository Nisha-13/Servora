import { store } from './state.js';
import { Navbar } from './components/navbar.js';
import { Footer } from './components/footer.js';
import { Toast } from './components/toast.js';
import { Modal } from './components/modal.js';
import { RatingStars } from './components/ratingStars.js';
import { initSocketClient } from './socket.js';
import { handleRouteChange } from './router.js';

// ─── Bootstrap App ─────────────────────────────────────────────────────────────
async function bootstrap() {
  // Restore persisted session
  store.restore();

  // Mount global component references for inline usage
  window.Toast = Toast;
  window.Modal = Modal;
  window.store = store;

  // Render layout shells
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    Navbar.render(navbarContainer);
    Navbar.update(); // Reflect auth state
  }

  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    Footer.render(footerContainer);
  }

  // Init socket if already authenticated
  if (store.isAuthenticated) {
    initSocketClient();
    window.refreshSavedServicesCount();
    window.refreshUnreadCounts();
  }

  // Initial route render
  handleRouteChange();

  // Listen to hash changes
  window.addEventListener('hashchange', () => {
    handleRouteChange();
    Navbar.update(); // Keep nav in sync
    window.refreshSavedServicesCount();
    if (store.isAuthenticated) window.refreshUnreadCounts();
  });

  // Listen to store auth changes to update navbar
  store.subscribe(() => {
    Navbar.update();
  });
}

window.refreshSavedServicesCount = async () => {
  if (store.isAuthenticated && store.role === 'CUSTOMER') {
    try {
      const res = await fetch('http://localhost:5000/api/favorites?limit=100', {
        headers: { Authorization: `Bearer ${store.token}` }
      });
      const data = await res.json().catch(() => ({}));
      const list = data.data?.favorites || [];
      const serviceCount = list.filter((f) => (f.itemType === 'SERVICE' || f.service) && f.service).length;
      store.setSavedServicesCount(serviceCount);
    } catch (_) {}
  } else {
    store.setSavedServicesCount(0);
  }
};

window.refreshUnreadCounts = async () => {
  if (!store.isAuthenticated) return;
  try {
    // Fetch unread notifications count
    // Backend GET /notifications always returns unreadCount in response regardless of filter
    const notifRes = await fetch('http://localhost:5000/api/notifications?limit=1', {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    const notifData = await notifRes.json().catch(() => ({}));
    const unreadNotifs = notifData.data?.unreadCount ?? 0;
    store.setUnreadNotificationCount(unreadNotifs);

    // Fetch unread message count from conversations
    if (store.role === 'CUSTOMER' || store.role === 'PROVIDER') {
      const convRes = await fetch('http://localhost:5000/api/conversations', {
        headers: { Authorization: `Bearer ${store.token}` }
      });
      const convData = await convRes.json().catch(() => ({}));
      const conversations = convData.data?.conversations || [];
      const myId = store.user?._id;
      const totalUnread = conversations.reduce((sum, c) => {
        const unread = c.unreadCount ?? (c.participants?.find?.((p) => (p._id || p) === myId)?.unreadCount ?? 0);
        return sum + (Number(unread) || 0);
      }, 0);
      store.setUnreadMessageCount(totalUnread);
    }
  } catch (_) {}
};

// ─── Quick Demo Login Helpers ──────────────────────────────────────────────────
// These are accessible via the demo banner at the top of the page
window.quickLogin = async (role) => {
  const credentials = {
    CUSTOMER: { email: 'usman.customer@servora.com', password: 'Password123!' },
    PROVIDER: { email: 'ahmed.tech@servora.com', password: 'Password123!' },
    ADMIN: { email: 'admin@servora.com', password: 'Admin123!' }
  };

  const creds = credentials[role];
  if (!creds) {
    Toast.error(`Unknown demo role: ${role}`);
    return;
  }

  try {
    Toast.info(`Signing in as ${role}...`, 'Demo Login');

    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });

    const data = await res.json();

    if (!res.ok) {
      Toast.error(data.message || 'Demo login failed. Make sure the backend is running and seeded.', 'Login Error');
      return;
    }

    const { user, token } = data.data || {};
    store.setUser(user, token);
    initSocketClient();
    window.refreshSavedServicesCount();
    window.refreshUnreadCounts();
    Toast.success(`Welcome, ${user.name}! Logged in as ${user.role}.`, '🚀 Demo Active');

    // Route by role
    if (user.role === 'ADMIN') window.location.hash = '#/admin/dashboard';
    else if (user.role === 'PROVIDER') window.location.hash = '#/provider/dashboard';
    else window.location.hash = '#/customer/dashboard';
  } catch (err) {
    Toast.error('Could not connect to backend. Make sure `npm run dev` is running in the backend directory.', 'Connection Error');
  }
};

window.quickLogout = () => {
  store.clearUser();
  Toast.info('Signed out successfully.', 'Logged Out');
  window.location.hash = '#/';
  Navbar.update();
};

// ─── Start Application ─────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
