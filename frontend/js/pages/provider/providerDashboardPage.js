import { ApiClient } from '../../api.js';
import { store } from '../../state.js';
import { RatingStars } from '../../components/ratingStars.js';

export class ProviderDashboardPage {
  static async render(container) {
    const user = store.user;
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <!-- Welcome Banner -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Provider Portal</div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white">Welcome, ${user.name} 👨‍🔧</h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">Manage your service bookings, earnings, reviews, and availability.</p>
          </div>
          <div class="flex items-center space-x-3 shrink-0">
            <a href="#/provider/services" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 transition">
              + Add New Service
            </a>
          </div>
        </div>

        <!-- KPI Cards -->
        <div id="provider-kpis" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
        </div>

        <!-- Charts + Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Booking Status Chart -->
          <div class="glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 class="text-base font-bold text-white mb-4 flex items-center">
              <i data-lucide="bar-chart-2" class="w-4 h-4 mr-2 text-emerald-400"></i> Booking Status Overview
            </h3>
            <canvas id="provider-status-chart" height="180"></canvas>
          </div>

          <!-- Recent Bookings Quick View -->
          <div class="glass-panel p-6 rounded-3xl border border-slate-800">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-bold text-white flex items-center">
                <i data-lucide="calendar-check" class="w-4 h-4 mr-2 text-sky-400"></i> Latest Booking Requests
              </h3>
              <a href="#/provider/bookings" class="text-xs font-semibold text-sky-400 hover:text-sky-300">View All →</a>
            </div>
            <div id="provider-recent-bookings" class="space-y-2.5">
              <div class="animate-pulse bg-slate-900/60 rounded-xl h-16"></div>
              <div class="animate-pulse bg-slate-900/60 rounded-xl h-16"></div>
            </div>
          </div>
        </div>

        <!-- Recent Reviews -->
        <div class="glass-panel p-6 rounded-3xl border border-slate-800">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-white flex items-center">
              <i data-lucide="star" class="w-4 h-4 mr-2 text-amber-400"></i> Latest Customer Reviews
            </h3>
            <a href="#/provider/reviews" class="text-xs font-semibold text-sky-400 hover:text-sky-300">See All →</a>
          </div>
          <div id="provider-recent-reviews" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="animate-pulse bg-slate-900/60 rounded-xl h-24"></div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.loadData();
  }

  static async loadData() {
    try {
      const [bookingsRes, reviewsRes] = await Promise.all([
        ApiClient.get('/bookings?limit=20'),
        ApiClient.get(`/reviews?provider=${store.user?._id || ''}&limit=6`)
      ]);

      const bookings = bookingsRes.data?.bookings || [];
      const reviews = reviewsRes.data?.reviews || [];

      // KPI Metrics
      const pending = bookings.filter((b) => b.status === 'PENDING').length;
      const active = bookings.filter((b) => ['ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length;
      const completed = bookings.filter((b) => b.status === 'PAID').length;
      const totalEarnings = bookings
        .filter((b) => b.status === 'PAID' && b.invoice)
        .reduce((sum, b) => sum + (b.invoice?.totalAmount || 0), 0);

      const kpisGrid = document.getElementById('provider-kpis');
      if (kpisGrid) {
        kpisGrid.innerHTML = `
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-xs font-medium text-slate-400 mb-1">Pending Requests</div>
            <div class="text-2xl font-extrabold text-amber-400">${pending}</div>
          </div>
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-xs font-medium text-slate-400 mb-1">Active Jobs</div>
            <div class="text-2xl font-extrabold text-sky-400">${active}</div>
          </div>
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-xs font-medium text-slate-400 mb-1">Completed (Paid)</div>
            <div class="text-2xl font-extrabold text-emerald-400">${completed}</div>
          </div>
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-xs font-medium text-slate-400 mb-1">Total Earnings</div>
            <div class="text-2xl font-extrabold text-purple-400">Rs. ${totalEarnings.toLocaleString()}</div>
          </div>
        `;
      }

      // Status Chart
      const chartCanvas = document.getElementById('provider-status-chart');
      if (chartCanvas && window.Chart) {
        const statusCounts = {};
        bookings.forEach((b) => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1; });

        new window.Chart(chartCanvas, {
          type: 'bar',
          data: {
            labels: Object.keys(statusCounts).map((s) => s.replace('_', ' ')),
            datasets: [{
              label: 'Bookings',
              data: Object.values(statusCounts),
              backgroundColor: ['#f59e0b', '#38bdf8', '#6366f1', '#a78bfa', '#10b981', '#f43f5e', '#64748b'],
              borderRadius: 8,
              borderWidth: 0
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
              y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', font: { size: 10 }, precision: 0 } }
            }
          }
        });
      }

      // Recent Bookings Quick
      const recentContainer = document.getElementById('provider-recent-bookings');
      if (recentContainer) {
        recentContainer.innerHTML = bookings.slice(0, 5).map((b) => `
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div class="flex items-center space-x-2.5">
              <img src="${b.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'}" class="w-8 h-8 rounded-lg object-cover" />
              <div>
                <div class="text-xs font-bold text-white truncate w-32">${b.customer?.name || 'Customer'}</div>
                <div class="text-[10px] text-slate-400">${b.service?.name || 'Service'}</div>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase badge-${b.status.toLowerCase()}">${b.status.replace('_', ' ')}</span>
          </div>
        `).join('');
      }

      // Recent Reviews
      const reviewsContainer = document.getElementById('provider-recent-reviews');
      if (reviewsContainer) {
        if (reviews.length === 0) {
          reviewsContainer.innerHTML = `<div class="col-span-3 text-xs text-slate-400 py-4 text-center">No reviews yet. Complete services to receive customer ratings.</div>`;
        } else {
          reviewsContainer.innerHTML = reviews.map((r) => `
            <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white">${r.customer?.name || 'Customer'}</span>
                <span class="text-[10px] text-slate-500">${new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              ${RatingStars.render(r.rating)}
              <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">${r.comment}</p>
            </div>
          `).join('');
        }
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Provider dashboard error:', err);
    }
  }
}
