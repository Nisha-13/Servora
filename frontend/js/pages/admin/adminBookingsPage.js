import { ApiClient } from '../../api.js';
import { Toast } from '../../components/toast.js';

export class AdminBookingsPage {
  static async render(container) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">All Platform Bookings</h1>
          <p class="text-xs text-slate-400 mt-1">View and monitor all service bookings across the platform.</p>
        </div>
        <div id="admin-bookings-table" class="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div class="animate-pulse p-4 space-y-2">${Array(5).fill('<div class="h-10 bg-slate-900 rounded-lg"></div>').join('')}</div>
        </div>
      </div>
    `;

    try {
      const res = await ApiClient.get('/bookings?limit=50');
      const bookings = res.data?.bookings || [];
      const tableContainer = document.getElementById('admin-bookings-table');
      if (!tableContainer) return;

      tableContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="border-b border-slate-800">
              <tr>
                <th class="py-3 px-5 text-left font-semibold text-slate-400 uppercase">Booking #</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Service</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Customer</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Provider</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Date</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-900">
              ${bookings.map((b) => `
                <tr class="hover:bg-slate-900/30">
                  <td class="py-3 px-5 font-mono font-bold text-sky-400">${b.bookingNumber}</td>
                  <td class="py-3 px-4 font-semibold text-white">${b.service?.name || '—'}</td>
                  <td class="py-3 px-4 text-slate-300">${b.customer?.name || '—'}</td>
                  <td class="py-3 px-4 text-slate-300">${b.provider?.name || '—'}</td>
                  <td class="py-3 px-4 text-slate-400">${new Date(b.bookingDate).toLocaleDateString()}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase badge-${b.status.toLowerCase()}">${b.status.replace('_', ' ')}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      console.error('Admin bookings error:', err);
    }
  }
}

export class AdminPaymentsPage {
  static async render(container) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Platform Payments</h1>
          <p class="text-xs text-slate-400 mt-1">All Cash on Delivery payment transactions, verification records, and refund controls.</p>
        </div>
        <div id="admin-payments-table" class="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div class="animate-pulse p-4 space-y-2">${Array(5).fill('<div class="h-10 bg-slate-900 rounded-lg"></div>').join('')}</div>
        </div>
      </div>
    `;

    try {
      const res = await ApiClient.get('/payments?limit=50');
      const payments = res.data?.payments || [];
      const tableContainer = document.getElementById('admin-payments-table');
      if (!tableContainer) return;

      tableContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="border-b border-slate-800">
              <tr>
                <th class="py-3 px-5 text-left font-semibold text-slate-400 uppercase">Payment Ref</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Customer</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Provider</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Amount</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Method</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Status</th>
                <th class="py-3 px-5 text-left font-semibold text-slate-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-900">
              ${payments.map((p) => `
                <tr class="hover:bg-slate-900/30">
                  <td class="py-3 px-5 font-mono text-[10px] text-slate-400 truncate max-w-xs">${p.transactionId || p._id}</td>
                  <td class="py-3 px-4 font-semibold text-white">${p.customer?.name || '—'}</td>
                  <td class="py-3 px-4 text-slate-300">${p.provider?.name || '—'}</td>
                  <td class="py-3 px-4 font-bold text-emerald-400">Rs. ${p.amount?.toLocaleString()}</td>
                  <td class="py-3 px-4 text-slate-400">${p.paymentMethod || 'CASH_ON_DELIVERY'}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : p.status === 'REFUNDED' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}">
                      ${p.status}
                    </span>
                  </td>
                  <td class="py-3 px-5 text-slate-400">${new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      console.error('Admin payments error:', err);
    }
  }
}

export class AdminReviewsPage {
  static async render(container) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Review Moderation</h1>
          <p class="text-xs text-slate-400 mt-1">Monitor and moderate customer reviews across the platform.</p>
        </div>
        <div id="admin-reviews-list" class="space-y-4">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-32"></div>
        </div>
      </div>
    `;

    try {
      const res = await ApiClient.get('/reviews?limit=30');
      const reviews = res.data?.reviews || [];
      const listContainer = document.getElementById('admin-reviews-list');
      if (!listContainer) return;

      if (reviews.length === 0) {
        listContainer.innerHTML = `<div class="glass-panel p-8 rounded-2xl text-center border border-slate-800 text-xs text-slate-400">No reviews found.</div>`;
        return;
      }

      listContainer.innerHTML = reviews.map((r) => `
        <div class="glass-card p-5 rounded-2xl border border-slate-800 flex items-start justify-between gap-4">
          <div class="flex-grow">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-bold text-white">${r.customer?.name} → ${r.provider?.name}</span>
              <span class="text-[10px] text-slate-500">${new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="flex items-center space-x-0.5 mb-2">
              ${Array.from({length: 5}, (_, i) => `<span class="text-xs ${i < r.rating ? 'text-amber-400' : 'text-slate-700'}">★</span>`).join('')}
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">${r.comment}</p>
          </div>
          <button onclick="window.deleteAdminReview('${r._id}')" class="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs transition shrink-0" title="Delete Review">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();

      window.deleteAdminReview = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
        try {
          await ApiClient.delete(`/reviews/${reviewId}`);
          Toast.success('Review deleted');
          AdminReviewsPage.render(document.getElementById('app'));
        } catch (err) {
          Toast.error(err.message);
        }
      };
    } catch (err) {
      console.error('Admin reviews error:', err);
    }
  }
}

export class AdminActivityLogsPage {
  static _page = 1;
  static _limit = 20;
  static _total = 0;

  static async render(container, queryParams = {}) {
    AdminActivityLogsPage._page = parseInt(queryParams.page || 1);
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-6xl mx-auto w-full space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Platform Activity Logs</h1>
            <p class="text-xs text-slate-400 mt-1">Full audit trail of all user and system actions across the platform.</p>
          </div>
          <div id="log-count-badge" class="text-xs text-slate-400 glass-panel px-4 py-2 rounded-xl border border-slate-800"></div>
        </div>
        <div id="admin-activity-logs-container" class="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div class="animate-pulse p-4 space-y-2">${Array(8).fill('<div class="h-10 bg-slate-900 rounded-lg"></div>').join('')}</div>
        </div>
        <div id="logs-pagination" class="flex items-center justify-center space-x-2 mt-4"></div>
      </div>
    `;

    this.loadLogs();
  }

  static async loadLogs() {
    try {
      const page = AdminActivityLogsPage._page;
      const limit = AdminActivityLogsPage._limit;
      const res = await ApiClient.get(`/admin/activity-logs?limit=${limit}&page=${page}`);
      const logs = res.data?.logs || [];
      const total = res.data?.total || logs.length;
      AdminActivityLogsPage._total = total;

      // Update count badge
      const badge = document.getElementById('log-count-badge');
      if (badge) badge.textContent = `Showing ${(page-1)*limit+1}–${Math.min(page*limit, total)} of ${total} logs`;

      const tableContainer = document.getElementById('admin-activity-logs-container');
      if (!tableContainer) return;

      if (logs.length === 0) {
        tableContainer.innerHTML = `<div class="p-8 text-center text-xs text-slate-400">No activity logs found.</div>`;
      } else {
        tableContainer.innerHTML = `
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="border-b border-slate-800">
                <tr>
                  <th class="py-3 px-5 text-left font-semibold text-slate-400 uppercase">User</th>
                  <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Action</th>
                  <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">Description</th>
                  <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase">IP Address</th>
                  <th class="py-3 px-5 text-left font-semibold text-slate-400 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-900">
                ${logs.map((log) => `
                  <tr class="hover:bg-slate-900/30">
                    <td class="py-3 px-5">
                      <div class="font-bold text-white">${log.user?.name || 'System'}</div>
                      <div class="text-[10px] text-slate-500">${log.user?.role || ''}</div>
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-purple-300">${log.action}</span>
                    </td>
                    <td class="py-3 px-4 text-slate-400 max-w-xs truncate">${log.description || log.entityType || '—'}</td>
                    <td class="py-3 px-4 font-mono text-[10px] text-slate-500">${log.ipAddress || '—'}</td>
                    <td class="py-3 px-5 text-slate-400 whitespace-nowrap">${new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      // Pagination Controls
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const paginationEl = document.getElementById('logs-pagination');
      if (paginationEl && totalPages > 1) {
        const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition';
        const activeCls = 'bg-sky-500 text-white';
        const inactiveCls = 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600';
        const disabledCls = 'bg-slate-900 text-slate-700 border border-slate-900 cursor-not-allowed';

        let pages = '';
        for (let p = 1; p <= totalPages; p++) {
          if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
            pages += `<button onclick="window.goToLogPage(${p})" class="${btnBase} ${p === page ? activeCls : inactiveCls}">${p}</button>`;
          } else if (p === page - 2 || p === page + 2) {
            pages += `<span class="text-slate-600 text-xs">…</span>`;
          }
        }

        paginationEl.innerHTML = `
          <button onclick="window.goToLogPage(${page - 1})" ${page === 1 ? 'disabled' : ''} class="${btnBase} ${page === 1 ? disabledCls : inactiveCls}">
            ← Prev
          </button>
          ${pages}
          <button onclick="window.goToLogPage(${page + 1})" ${page === totalPages ? 'disabled' : ''} class="${btnBase} ${page === totalPages ? disabledCls : inactiveCls}">
            Next →
          </button>
        `;

        window.goToLogPage = (p) => {
          if (p < 1 || p > totalPages) return;
          AdminActivityLogsPage._page = p;
          window.location.hash = `#/admin/activity-logs?page=${p}`;
        };
      } else if (paginationEl) {
        paginationEl.innerHTML = '';
      }

    } catch (err) {
      console.error('Activity logs error:', err);
    }
  }
}

