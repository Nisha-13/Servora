import { ApiClient } from '../../api.js';
import { store } from '../../state.js';
import { RatingStars } from '../../components/ratingStars.js';

export class CustomerDashboardPage {
  static async render(container) {
    const user = store.user;

    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <!-- Welcome Banner -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Customer Portal</div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white">Hello, ${user.name} 👋</h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">Manage your active service requests, pending invoices, and trusted providers.</p>
          </div>
          <div class="flex items-center space-x-3 shrink-0">
            <a href="#/services" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 transition">
              + Book New Service
            </a>
          </div>
        </div>

        <!-- Pending Invoices Banner Alert (if any) -->
        <div id="customer-pending-invoice-alert"></div>

        <!-- KPIs Cards Grid -->
        <div id="customer-kpis-grid" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
        </div>

        <!-- Recent Bookings & Favorites -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Bookings (2 Cols) -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-white">Recent Service Bookings</h2>
              <a href="#/customer/bookings" class="text-xs font-semibold text-sky-400 hover:text-sky-300">View All →</a>
            </div>

            <div id="customer-recent-bookings" class="space-y-3">
              <div class="animate-pulse bg-slate-900/60 rounded-2xl h-40"></div>
              <div class="animate-pulse bg-slate-900/60 rounded-2xl h-40"></div>
            </div>
          </div>

          <!-- Saved Providers (1 Col) -->
          <div class="lg:col-span-1 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-white">Saved Providers</h2>
              <a href="#/providers" class="text-xs font-semibold text-sky-400 hover:text-sky-300">Explore</a>
            </div>

            <div id="customer-favorite-providers" class="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
              <div class="animate-pulse bg-slate-900/60 rounded-xl h-20"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.loadDashboardData();
  }

  static async loadDashboardData() {
    try {
      const [bookingsRes, invoicesRes, favsRes] = await Promise.all([
        ApiClient.get('/bookings?limit=50'),
        ApiClient.get('/invoices'),
        ApiClient.get('/favorites?limit=100')
      ]);

      const bookings = bookingsRes.data?.bookings || [];
      const invoices = invoicesRes.data?.invoices || [];
      const allFavorites = favsRes.data?.favorites || [];

      // Filter exclusively saved providers
      const providerFavorites = allFavorites.filter(
        (f) => f.itemType === 'PROVIDER' && f.provider && f.provider._id
      );

      // Check for pending unpaid invoices
      const pendingInvoices = invoices.filter((inv) => inv.status === 'PENDING');
      const alertContainer = document.getElementById('customer-pending-invoice-alert');
      if (alertContainer && pendingInvoices.length > 0) {
        const topPending = pendingInvoices[0];
        alertContainer.innerHTML = `
          <div class="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div class="flex items-center space-x-3.5">
              <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <i data-lucide="alert-triangle" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="text-sm font-bold text-white">Pending Service Invoice #${topPending.invoiceNumber}</h4>
                <p class="text-xs text-rose-300">Amount due: <strong class="text-white">Rs. ${topPending.totalAmount.toLocaleString()}</strong>. Please settle to complete booking.</p>
              </div>
            </div>
            <a href="#/customer/bookings?highlight=${topPending.booking?._id || ''}" class="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition text-center shrink-0">
              Pay Invoice Now
            </a>
          </div>
        `;
      }

      // Render Dynamic KPIs
      const kpisGrid = document.getElementById('customer-kpis-grid');
      if (kpisGrid) {
        const activeCount = bookings.filter((b) => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length;
        const completedCount = bookings.filter((b) => ['PAID', 'COMPLETED'].includes(b.status)).length;
        const unpaidCount = pendingInvoices.length;
        const savedCount = providerFavorites.length;

        kpisGrid.innerHTML = `
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-xs font-medium text-slate-400 mb-1">Active Bookings</div>
            <div class="text-2xl font-extrabold text-sky-400">${activeCount}</div>
          </div>
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-xs font-medium text-slate-400 mb-1">Pending Invoices</div>
            <div class="text-2xl font-extrabold text-rose-400">${unpaidCount}</div>
          </div>
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-xs font-medium text-slate-400 mb-1">Completed Services</div>
            <div class="text-2xl font-extrabold text-emerald-400">${completedCount}</div>
          </div>
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-xs font-medium text-slate-400 mb-1">Saved Providers</div>
            <div class="text-2xl font-extrabold text-purple-400">${savedCount}</div>
          </div>
        `;
      }

      // Render Recent Bookings
      const recentContainer = document.getElementById('customer-recent-bookings');
      if (recentContainer) {
        if (bookings.length === 0) {
          recentContainer.innerHTML = `
            <div class="glass-panel p-8 rounded-2xl text-center border border-slate-800 text-slate-400 text-xs">
              You haven't made any bookings yet.
              <a href="#/services" class="text-sky-400 font-semibold ml-1">Explore Services →</a>
            </div>
          `;
        } else {
          recentContainer.innerHTML = bookings
            .slice(0, 5)
            .map(
              (b) => `
            <div class="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start space-x-3.5">
                <img src="${b.provider?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}" class="w-12 h-12 rounded-xl object-cover ring-2 ring-sky-500/20 shrink-0" />
                <div>
                  <div class="flex items-center space-x-2">
                    <h3 class="font-bold text-white text-sm">${b.service?.name || 'Service'}</h3>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase badge-${b.status.toLowerCase()}">${b.status.replace('_', ' ')}</span>
                  </div>
                  <div class="text-xs text-slate-400 mt-1">
                    Provider: <strong class="text-slate-300">${b.provider?.name || 'Verified Provider'}</strong> • ${new Date(b.bookingDate).toLocaleDateString()} (${b.timeSlot})
                  </div>
                  <div class="text-xs font-semibold text-sky-400 mt-1">
                    ${b.invoice ? `Final Amount: Rs. ${b.invoice.totalAmount?.toLocaleString()}` : `Est. Starting: Rs. ${(b.startingPrice || 0).toLocaleString()}`}
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-2 shrink-0">
                <a href="#/customer/bookings?id=${b._id}" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition">
                  Details
                </a>
                ${
                  b.status === 'PAYMENT_PENDING'
                    ? `<a href="#/customer/bookings?pay=${b._id}" class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition">Pay Now</a>`
                    : ''
                }
              </div>
            </div>
          `
            )
            .join('');
        }
      }

      // Render Saved Providers (strictly verified providers without undefined)
      const favContainer = document.getElementById('customer-favorite-providers');
      if (favContainer) {
        if (providerFavorites.length === 0) {
          favContainer.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">No saved providers yet.<br><a href="#/providers" class="text-sky-400 font-semibold mt-1 inline-block">Browse Providers →</a></div>`;
        } else {
          favContainer.innerHTML = providerFavorites
            .slice(0, 5)
            .map(
              (f) => `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
              <div class="flex items-center space-x-2.5">
                <img src="${f.provider?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'}" class="w-8 h-8 rounded-lg object-cover ring-1 ring-sky-500/30" />
                <div>
                  <h4 class="text-xs font-bold text-white truncate w-32">${f.provider?.name || 'Service Provider'}</h4>
                  <div class="text-[10px] text-slate-400">${f.provider?.address?.city || 'Verified Expert'}</div>
                </div>
              </div>
              <a href="#/providers/${f.provider?._id}" class="text-xs text-sky-400 hover:text-sky-300 font-semibold px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition">View</a>
            </div>
          `
            )
            .join('');
        }
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Customer dashboard error:', err);
    }
  }
}
