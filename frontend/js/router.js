import { store } from './state.js';
import { Toast } from './components/toast.js';

// ─── Public Pages ─────────────────────────────────────────────────────────────
import { HomePage } from './pages/public/homePage.js';
import { ServicesPage } from './pages/public/servicesPage.js';
import { ServiceDetailPage } from './pages/public/serviceDetailPage.js';
import { ProvidersPage } from './pages/public/providersPage.js';
import { ProviderDetailPage } from './pages/public/providerDetailPage.js';
import { LoginPage } from './pages/public/loginPage.js';
import { RegisterPage } from './pages/public/registerPage.js';
import { AboutPage, ContactPage } from './pages/public/aboutPage.js';
import { PrivacyPolicyPage, TermsOfServicePage, SecurityGuidelinesPage } from './pages/public/legalPages.js';

// ─── Customer Pages ───────────────────────────────────────────────────────────
import { CustomerDashboardPage } from './pages/customer/customerDashboardPage.js';
import { CustomerBookingsPage } from './pages/customer/customerBookingsPage.js';
import { CustomerInvoicesPage } from './pages/customer/customerInvoicesPage.js';
import { CustomerFavoritesPage } from './pages/customer/customerFavoritesPage.js';
import { CustomerReviewsPage } from './pages/customer/customerReviewsPage.js';
import { CustomerProfilePage } from './pages/customer/customerProfilePage.js';

import { ProviderDashboardPage } from './pages/provider/providerDashboardPage.js';
import { ProviderServicesPage } from './pages/provider/providerServicesPage.js';
import { ProviderBookingsPage } from './pages/provider/providerBookingsPage.js';
import { ProviderEarningsPage, ProviderReviewsPage, ProviderAvailabilityPage } from './pages/provider/providerEarningsPage.js';
import { ProviderProfilePage } from './pages/provider/providerProfilePage.js';

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import { AdminDashboardPage } from './pages/admin/adminDashboardPage.js';
import { AdminUsersPage } from './pages/admin/adminUsersPage.js';
import { AdminCategoriesPage, AdminServicesPage } from './pages/admin/adminCategoriesPage.js';
import { AdminBookingsPage, AdminPaymentsPage, AdminReviewsPage, AdminActivityLogsPage } from './pages/admin/adminBookingsPage.js';

// ─── Shared Pages ─────────────────────────────────────────────────────────────
import { ChatPage } from './pages/shared/chatPage.js';
import { NotificationsPage } from './pages/shared/notificationsPage.js';

// ─── Helper to parse query string from hash ───────────────────────────────────
function parseHashQuery(hash) {
  const [path, queryString] = hash.replace(/^#/, '').split('?');
  const params = {};
  if (queryString) {
    queryString.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }
  return { path, params };
}

// ─── Auth Guards ──────────────────────────────────────────────────────────────
function requireAuth(redirectTo = '#/login') {
  if (!store.isAuthenticated) {
    Toast.warning('Please sign in to access this page.', 'Sign In Required');
    window.location.hash = redirectTo;
    return false;
  }
  return true;
}

function requireRole(role) {
  if (!store.isAuthenticated) {
    Toast.warning('Please sign in to access this page.', 'Sign In Required');
    window.location.hash = '#/login';
    return false;
  }
  if (store.user?.role !== role) {
    Toast.error(`This page requires ${role} access.`, 'Access Denied');
    // Redirect based on actual role
    if (store.user?.role === 'ADMIN') window.location.hash = '#/admin/dashboard';
    else if (store.user?.role === 'PROVIDER') window.location.hash = '#/provider/dashboard';
    else window.location.hash = '#/customer/dashboard';
    return false;
  }
  return true;
}

// ─── Route Table ──────────────────────────────────────────────────────────────
const routes = {
  '/': (container, _p) => HomePage.render(container),
  '/services': (container, p) => ServicesPage.render(container, p),
  '/services/:id': (container, _p, id) => ServiceDetailPage.render(container, id),
  '/providers': (container, p) => ProvidersPage.render(container, p),
  '/providers/:id': (container, _p, id) => ProviderDetailPage.render(container, id),
  '/login': (container) => {
    if (store.isAuthenticated) { window.location.hash = '#/'; return; }
    LoginPage.render(container);
  },
  '/register': (container) => {
    if (store.isAuthenticated) { window.location.hash = '#/'; return; }
    RegisterPage.render(container);
  },
  '/about': (container) => AboutPage.render(container),
  '/contact': (container) => ContactPage.render(container),
  '/privacy': (container) => PrivacyPolicyPage.render(container),
  '/terms': (container) => TermsOfServicePage.render(container),
  '/security': (container) => SecurityGuidelinesPage.render(container),

  // Customer
  '/customer/dashboard': (container, p) => {
    if (!requireRole('CUSTOMER')) return;
    CustomerDashboardPage.render(container, p);
  },
  '/customer/bookings': (container, p) => {
    if (!requireRole('CUSTOMER')) return;
    CustomerBookingsPage.render(container, p);
  },
  '/customer/invoices': (container, p) => {
    if (!requireRole('CUSTOMER')) return;
    CustomerInvoicesPage.render(container, p);
  },
  '/customer/favorites': (container, p) => {
    if (!requireRole('CUSTOMER')) return;
    CustomerFavoritesPage.render(container, p);
  },
  '/customer/reviews': (container, p) => {
    if (!requireRole('CUSTOMER')) return;
    CustomerReviewsPage.render(container, p);
  },
  '/customer/profile': (container, p) => {
    if (!requireRole('CUSTOMER')) return;
    CustomerProfilePage.render(container, p);
  },

  // Provider
  '/provider/dashboard': (container, p) => {
    if (!requireRole('PROVIDER')) return;
    ProviderDashboardPage.render(container, p);
  },
  '/provider/services': (container, p) => {
    if (!requireRole('PROVIDER')) return;
    ProviderServicesPage.render(container, p);
  },
  '/provider/bookings': (container, p) => {
    if (!requireRole('PROVIDER')) return;
    ProviderBookingsPage.render(container, p);
  },
  '/provider/earnings': (container, p) => {
    if (!requireRole('PROVIDER')) return;
    ProviderEarningsPage.render(container, p);
  },
  '/provider/reviews': (container, p) => {
    if (!requireRole('PROVIDER')) return;
    ProviderReviewsPage.render(container, p);
  },
  '/provider/availability': (container, p) => {
    if (!requireRole('PROVIDER')) return;
    ProviderAvailabilityPage.render(container, p);
  },
  '/provider/profile': (container, p) => {
    if (!requireRole('PROVIDER')) return;
    ProviderProfilePage.render(container, p);
  },

  // Admin
  '/admin/dashboard': (container, p) => {
    if (!requireRole('ADMIN')) return;
    AdminDashboardPage.render(container, p);
  },
  '/admin/users': (container, p) => {
    if (!requireRole('ADMIN')) return;
    AdminUsersPage.render(container, p);
  },
  '/admin/categories': (container, p) => {
    if (!requireRole('ADMIN')) return;
    AdminCategoriesPage.render(container, p);
  },
  '/admin/services': (container, p) => {
    if (!requireRole('ADMIN')) return;
    AdminServicesPage.render(container, p);
  },
  '/admin/bookings': (container, p) => {
    if (!requireRole('ADMIN')) return;
    AdminBookingsPage.render(container, p);
  },
  '/admin/payments': (container, p) => {
    if (!requireRole('ADMIN')) return;
    AdminPaymentsPage.render(container, p);
  },
  '/admin/reviews': (container, p) => {
    if (!requireRole('ADMIN')) return;
    AdminReviewsPage.render(container, p);
  },
  '/admin/activity-logs': (container, p) => {
    if (!requireRole('ADMIN')) return;
    AdminActivityLogsPage.render(container, p);
  },

  // Shared
  '/chat': (container, p) => {
    if (!requireAuth()) return;
    ChatPage.render(container, p);
  },
  '/notifications': (container, p) => {
    if (!requireAuth()) return;
    NotificationsPage.render(container, p);
  },
};

// ─── Main Router Handler ──────────────────────────────────────────────────────
export function handleRouteChange() {
  const hash = window.location.hash || '#/';
  const { path, params } = parseHashQuery(hash);
  const appContainer = document.getElementById('app');

  if (!appContainer) return;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Exact route match
  if (routes[path]) {
    routes[path](appContainer, params);
    return;
  }

  // Dynamic routes with params: /services/:id, /providers/:id
  const dynamicPatterns = [
    { pattern: /^\/services\/([^/]+)$/, key: '/services/:id' },
    { pattern: /^\/providers\/([^/]+)$/, key: '/providers/:id' }
  ];

  for (const { pattern, key } of dynamicPatterns) {
    const match = path.match(pattern);
    if (match) {
      routes[key](appContainer, params, match[1]);
      return;
    }
  }

  // 404 Fallback
  appContainer.innerHTML = `
    <div class="py-24 px-4 text-center">
      <div class="w-20 h-20 rounded-3xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto mb-6">
        <i data-lucide="map-x" class="w-10 h-10"></i>
      </div>
      <h1 class="text-4xl font-extrabold text-white mb-2">404</h1>
      <p class="text-base text-slate-400 mb-6">This page doesn't exist or has been moved.</p>
      <a href="#/" class="inline-block px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition">
        Back to Home
      </a>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();
}
