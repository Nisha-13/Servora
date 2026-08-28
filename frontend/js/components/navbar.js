import { store } from '../state.js';

export class Navbar {
  static _isOpen = false;

  static render(targetContainer) {
    const container = targetContainer || document.getElementById('navbar-container') || document.getElementById('header-container');
    if (!container) return;
    Navbar._container = container;

    const user = store.user;
    const role = store.role;
    const unreadNotifs = store.state.unreadNotificationCount || 0;
    const unreadMsgs = store.state.unreadMessageCount || 0;
    const currentRoute = window.location.hash || '#/';

    let navLinks = '';
    let mobileNavLinks = '';

    if (role === 'ADMIN') {
      navLinks = `
        <a href="#/" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-300 hover:text-white'} transition">Home</a>
        <a href="#/admin/dashboard" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute.includes('#/admin/dashboard') ? 'bg-purple-500/20 text-purple-300' : 'text-slate-300 hover:text-white'} transition">Dashboard</a>
        <a href="#/admin/users" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute.includes('#/admin/users') ? 'bg-purple-500/20 text-purple-300' : 'text-slate-300 hover:text-white'} transition">Users</a>
        <a href="#/admin/categories" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute.includes('#/admin/categories') ? 'bg-purple-500/20 text-purple-300' : 'text-slate-300 hover:text-white'} transition">Categories</a>
        <a href="#/admin/services" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute.includes('#/admin/services') ? 'bg-purple-500/20 text-purple-300' : 'text-slate-300 hover:text-white'} transition">Services</a>
        <a href="#/admin/bookings" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute.includes('#/admin/bookings') ? 'bg-purple-500/20 text-purple-300' : 'text-slate-300 hover:text-white'} transition">Bookings</a>
        <a href="#/admin/payments" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute.includes('#/admin/payments') ? 'bg-purple-500/20 text-purple-300' : 'text-slate-300 hover:text-white'} transition">Payments</a>
        <a href="#/admin/activity-logs" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute.includes('#/admin/activity-logs') ? 'bg-purple-500/20 text-purple-300' : 'text-slate-300 hover:text-white'} transition">Logs</a>
      `;
    } else if (role === 'PROVIDER') {
      navLinks = `
        <a href="#/" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-300 hover:text-white'} transition">Home</a>
        <a href="#/provider/dashboard" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/provider/dashboard' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:text-white'} transition">Dashboard</a>
        <a href="#/provider/bookings" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/provider/bookings' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:text-white'} transition">Bookings</a>
        <a href="#/provider/services" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/provider/services' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:text-white'} transition">My Services</a>
        <a href="#/provider/earnings" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/provider/earnings' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:text-white'} transition">Earnings</a>
        <a href="#/provider/availability" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/provider/availability' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:text-white'} transition">Availability</a>
        <a href="#/provider/profile" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/provider/profile' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:text-white'} transition">Profile</a>
        <a href="#/chat" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/chat' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:text-white'} transition">Chat</a>
      `;
    } else if (role === 'CUSTOMER') {
      navLinks = `
        <a href="#/" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-300 hover:text-white'} transition">Home</a>
        <a href="#/customer/dashboard" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/customer/dashboard' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:text-white'} transition">Dashboard</a>
        <a href="#/services" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/services' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:text-white'} transition">Find Services</a>
        <a href="#/providers" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/providers' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:text-white'} transition">Providers</a>
        <a href="#/customer/bookings" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/customer/bookings' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:text-white'} transition">Bookings</a>
        <a href="#/customer/invoices" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/customer/invoices' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:text-white'} transition">Invoices</a>
        <a href="#/customer/favorites" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/customer/favorites' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:text-white'} transition">Saved</a>
        <a href="#/customer/profile" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/customer/profile' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:text-white'} transition">Profile</a>
        <a href="#/chat" class="px-2.5 py-1.5 rounded-lg text-xs font-medium ${currentRoute === '#/chat' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:text-white'} transition">Chat</a>
      `;
    } else {
      // Guest
      navLinks = `
        <a href="#/" class="px-3 py-1.5 rounded-lg text-sm font-medium ${currentRoute === '#/' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-300 hover:text-white'} transition">Home</a>
        <a href="#/services" class="px-3 py-1.5 rounded-lg text-sm font-medium ${currentRoute === '#/services' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-300 hover:text-white'} transition">Explore Services</a>
        <a href="#/providers" class="px-3 py-1.5 rounded-lg text-sm font-medium ${currentRoute === '#/providers' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-300 hover:text-white'} transition">Top Providers</a>
        <a href="#/about" class="px-3 py-1.5 rounded-lg text-sm font-medium ${currentRoute === '#/about' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-300 hover:text-white'} transition">About Us</a>
        <a href="#/contact" class="px-3 py-1.5 rounded-lg text-sm font-medium ${currentRoute === '#/contact' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-300 hover:text-white'} transition">Contact</a>
      `;
    }

    mobileNavLinks = navLinks.replace(/px-2.5 py-1.5|px-3 py-1.5/g, 'px-4 py-3 text-sm flex items-center rounded-xl');

    const savedServicesCount = store.savedServicesCount || 0;

    const authActions = user
      ? `
      <div class="flex items-center space-x-2 sm:space-x-3">
        ${
          role === 'CUSTOMER'
            ? `
          <!-- Quick Cart / Saved Services Access with live badge -->
          <a href="#/customer/favorites" class="relative p-2 rounded-xl text-slate-300 hover:text-sky-300 hover:bg-slate-800 transition" title="Saved Services Cart">
            <i data-lucide="shopping-bag" class="w-5 h-5"></i>
            ${
              savedServicesCount > 0
                ? `<span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce shadow-md shadow-sky-500/50">${savedServicesCount}</span>`
                : ''
            }
          </a>
        `
            : ''
        }

        <!-- Notifications Bell with Live Counter -->
        <a href="#/notifications" class="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition" title="Notifications">
          <i data-lucide="bell" class="w-5 h-5"></i>
          ${
            unreadNotifs > 0
              ? `<span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce shadow-md shadow-rose-500/50">${unreadNotifs}</span>`
              : ''
          }
        </a>

        <!-- Chat Icon with Live Unread-Message Counter -->
        ${role === 'CUSTOMER' || role === 'PROVIDER' ? `
        <a href="#/chat" class="relative p-2 rounded-xl text-slate-300 hover:text-emerald-300 hover:bg-slate-800 transition" title="Messages">
          <i data-lucide="message-square" class="w-5 h-5"></i>
          ${
            unreadMsgs > 0
              ? `<span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce shadow-md shadow-emerald-500/50">${unreadMsgs > 99 ? '99+' : unreadMsgs}</span>`
              : ''
          }
        </a>
        ` : ''}

        <!-- User Dropdown / Profile Badge -->
        <div class="flex items-center space-x-2 pl-1 sm:pl-2 border-l border-slate-800">
          <a href="${role === 'CUSTOMER' ? '#/customer/profile' : role === 'PROVIDER' ? '#/provider/profile' : '#/admin/dashboard'}" class="flex items-center space-x-2 hover:opacity-80 transition">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}" alt="${user.name}" class="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30" />
            <div class="hidden md:block text-left">
              <div class="text-xs font-bold text-white leading-tight max-w-[100px] truncate">${user.name}</div>
              <div class="text-[10px] text-brand-400 font-semibold uppercase tracking-wider">${user.role}</div>
            </div>
          </a>
          <button onclick="window.quickLogout()" title="Logout" class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Mobile Menu Toggle Button -->
        <button id="mobile-menu-btn" onclick="window.toggleMobileNavbar()" class="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden transition">
          <i id="mobile-menu-icon" data-lucide="menu" class="w-6 h-6"></i>
        </button>
      </div>
    `
      : `
      <div class="flex items-center space-x-2 sm:space-x-3">
        <a href="#/login" class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition">Sign In</a>
        <a href="#/register" class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 transition">
          Join Free
        </a>
        <!-- Mobile Menu Toggle Button -->
        <button id="mobile-menu-btn" onclick="window.toggleMobileNavbar()" class="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden transition">
          <i id="mobile-menu-icon" data-lucide="menu" class="w-6 h-6"></i>
        </button>
      </div>
    `;

    container.innerHTML = `
      <nav class="glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 relative z-50">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <a href="#/" class="flex items-center space-x-2.5 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 group-hover:scale-105 transition transform">
              <i data-lucide="layers" class="w-6 h-6"></i>
            </div>
            <div>
              <span class="text-xl font-extrabold tracking-tight text-white flex items-center">
                Serv<span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">ora</span>
              </span>
            </div>
          </a>

          <!-- Desktop Navigation Links -->
          <div class="hidden lg:flex items-center space-x-1">
            ${navLinks}
          </div>

          <!-- Auth Actions / User Menu & Mobile Toggle -->
          <div>
            ${authActions}
          </div>
        </div>

        <!-- Mobile Drawer Menu -->
        <div id="mobile-drawer-menu" class="hidden lg:hidden mt-3 pt-3 border-t border-slate-800/80 flex flex-col space-y-1">
          ${mobileNavLinks}
        </div>
      </nav>
    `;

    if (window.lucide) window.lucide.createIcons();

    window.toggleMobileNavbar = () => {
      const drawer = document.getElementById('mobile-drawer-menu');
      const icon = document.getElementById('mobile-menu-icon');
      if (!drawer) return;

      const isHidden = drawer.classList.contains('hidden');
      if (isHidden) {
        drawer.classList.remove('hidden');
        if (icon) icon.setAttribute('data-lucide', 'x');
      } else {
        drawer.classList.add('hidden');
        if (icon) icon.setAttribute('data-lucide', 'menu');
      }
      if (window.lucide) window.lucide.createIcons();
    };
  }

  /** Re-render navbar when auth state changes */
  static update() {
    const container = Navbar._container || document.getElementById('navbar-container') || document.getElementById('header-container');
    if (container) {
      Navbar.render(container);
    }
  }
}
