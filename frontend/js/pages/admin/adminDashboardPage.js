import { ApiClient } from '../../api.js';

export class AdminDashboardPage {
  static _charts = [];

  static async render(container) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900">
          <div class="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Administration Panel</div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white">Platform Overview Dashboard</h1>
          <p class="text-xs text-slate-400 mt-1">Real-time KPIs, platform analytics, and operational health.</p>
        </div>

        <!-- KPI Cards -->
        <div id="admin-kpis" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          ${Array(6).fill('<div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>').join('')}
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 class="text-base font-bold text-white mb-4 flex items-center">
              <i data-lucide="trending-up" class="w-4 h-4 mr-2 text-purple-400"></i> Monthly Revenue Trend
            </h3>
            <canvas id="admin-revenue-chart" height="200"></canvas>
          </div>
          <div class="glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 class="text-base font-bold text-white mb-4 flex items-center">
              <i data-lucide="bar-chart-2" class="w-4 h-4 mr-2 text-sky-400"></i> Booking Volumes by Status
            </h3>
            <canvas id="admin-bookings-chart" height="200"></canvas>
          </div>
        </div>

        <!-- Recent Activity Table -->
        <div class="glass-panel p-6 rounded-3xl border border-slate-800">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-white flex items-center">
              <i data-lucide="activity" class="w-4 h-4 mr-2 text-emerald-400"></i> Latest Platform Activity
            </h3>
            <a href="#/admin/activity-logs" class="text-xs font-semibold text-sky-400 hover:text-sky-300">View All Logs →</a>
          </div>
          <div id="admin-activity-table">
            <div class="animate-pulse bg-slate-900/60 rounded-xl h-40"></div>
          </div>
        </div>

        <!-- Recent Bookings -->
        <div class="glass-panel p-6 rounded-3xl border border-slate-800">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-white flex items-center">
              <i data-lucide="calendar-check" class="w-4 h-4 mr-2 text-sky-400"></i> Recent Bookings
            </h3>
            <a href="#/admin/bookings" class="text-xs font-semibold text-sky-400 hover:text-sky-300">View All →</a>
          </div>
          <div id="admin-recent-bookings">
            <div class="animate-pulse bg-slate-900/60 rounded-xl h-32"></div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.loadDashboard();
  }

  static destroyCharts() {
    AdminDashboardPage._charts.forEach((c) => { try { c.destroy(); } catch (_) {} });
    AdminDashboardPage._charts = [];
  }

  static async loadDashboard() {
    AdminDashboardPage.destroyCharts();
    try {
      const [kpiRes, activityRes] = await Promise.all([
        ApiClient.get('/admin/dashboard'),
        ApiClient.get('/admin/activity-logs?limit=10')
      ]);

      const kpis = kpiRes.data?.kpis || kpiRes.data || {};
      const logs = activityRes.data?.logs || kpiRes.data?.recentActivity || [];
      const recentBookings = kpiRes.data?.recentBookings || [];

      // KPI Grid
      const kpiGrid = document.getElementById('admin-kpis');
      if (kpiGrid) {
        // Use server-computed avgInvoice (or fallback to local calc)
        const avgInvoice = kpis.avgInvoice || (kpis.totalRevenue && kpis.completedBookings
          ? Math.round(kpis.totalRevenue / kpis.completedBookings)
          : 0);

        const activeProviders = kpis.activeProviders ?? kpis.totalProviders ?? 0;

        const items = [
          { label: 'Total Users', value: kpis.totalUsers || 0, color: 'sky', icon: 'users', sub: `${kpis.totalCustomers || 0} customers` },
          { label: 'Active Providers', value: activeProviders, color: 'emerald', icon: 'briefcase', sub: 'registered pros' },
          { label: 'Total Bookings', value: kpis.totalBookings || 0, color: 'blue', icon: 'calendar', sub: `${kpis.pendingBookings || 0} pending` },
          { label: 'Active Services', value: kpis.totalServices || 0, color: 'indigo', icon: 'wrench', sub: `${kpis.totalCategories || 0} categories` },
          { label: 'Total Revenue', value: `Rs. ${(kpis.totalRevenue || 0).toLocaleString()}`, color: 'purple', icon: 'dollar-sign', sub: `${kpis.completedBookings || 0} paid` },
          { label: 'Avg. Invoice', value: avgInvoice > 0 ? `Rs. ${avgInvoice.toLocaleString()}` : 'N/A', color: 'amber', icon: 'receipt', sub: 'per completed booking' }
        ];

        kpiGrid.innerHTML = items.map((item) => `
          <div class="glass-card p-5 rounded-2xl border border-slate-800 hover:border-${item.color}-500/30 transition">
            <div class="flex items-center justify-between mb-2">
              <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">${item.label}</div>
              <div class="w-7 h-7 rounded-lg bg-${item.color}-500/20 text-${item.color}-400 flex items-center justify-center">
                <i data-lucide="${item.icon}" class="w-3.5 h-3.5"></i>
              </div>
            </div>
            <div class="text-xl font-extrabold text-white">${item.value}</div>
            <div class="text-[10px] text-slate-500 mt-1">${item.sub}</div>
          </div>
        `).join('');
      }

      // Revenue Chart
      const revCanvas = document.getElementById('admin-revenue-chart');
      if (revCanvas && window.Chart) {
        const monthlyData = kpis.monthlyRevenue || [
          { month: 'Apr', revenue: 12000 }, { month: 'May', revenue: 18500 }, { month: 'Jun', revenue: 14200 },
          { month: 'Jul', revenue: 22000 }, { month: 'Aug', revenue: 19800 }, { month: 'Sep', revenue: 25000 }
        ];
        const revChart = new window.Chart(revCanvas, {
          type: 'line',
          data: {
            labels: monthlyData.map((m) => m.month),
            datasets: [{
              label: 'Revenue (Rs.)',
              data: monthlyData.map((m) => m.revenue),
              borderColor: '#a78bfa',
              backgroundColor: 'rgba(167, 139, 250, 0.08)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#a78bfa',
              pointBorderColor: '#1e1b4b',
              pointRadius: 5
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
              y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => `Rs.${(v/1000).toFixed(0)}k` } }
            }
          }
        });
        AdminDashboardPage._charts.push(revChart);
      }

      // Bookings Status Chart
      const bookingsCanvas = document.getElementById('admin-bookings-chart');
      if (bookingsCanvas && window.Chart) {
        const statusData = kpis.bookingsByStatus || [
          { status: 'PENDING', count: kpis.pendingBookings || 0 },
          { status: 'PAID', count: kpis.completedBookings || 0 },
          { status: 'CANCELLED', count: kpis.cancelledBookings || 0 },
          { status: 'PAYMENT_PENDING', count: kpis.pendingPayments || 0 }
        ];
        const bkChart = new window.Chart(bookingsCanvas, {
          type: 'doughnut',
          data: {
            labels: statusData.map((b) => b.status.replace(/_/g, ' ')),
            datasets: [{
              data: statusData.map((b) => b.count),
              backgroundColor: ['#f59e0b', '#10b981', '#f43f5e', '#6366f1'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
                labels: { color: '#94a3b8', font: { size: 10 }, padding: 10, boxWidth: 10 }
              }
            },
            cutout: '65%'
          }
        });
        AdminDashboardPage._charts.push(bkChart);
      }

      // Activity Logs Table
      const actTable = document.getElementById('admin-activity-table');
      if (actTable) {
        if (logs.length === 0) {
          actTable.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">No activity logs yet.</div>`;
        } else {
          actTable.innerHTML = `
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b border-slate-800">
                    <th class="py-2.5 pr-4 text-left font-semibold text-slate-400">User</th>
                    <th class="py-2.5 pr-4 text-left font-semibold text-slate-400">Action</th>
                    <th class="py-2.5 pr-4 text-left font-semibold text-slate-400">Description</th>
                    <th class="py-2.5 text-left font-semibold text-slate-400">Time</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-900">
                  ${logs.map((log) => `
                    <tr class="hover:bg-slate-900/40">
                      <td class="py-2.5 pr-4 font-semibold text-slate-200">${log.user?.name || 'System'}</td>
                      <td class="py-2.5 pr-4">
                        <span class="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-purple-300">${log.action}</span>
                      </td>
                      <td class="py-2.5 pr-4 text-slate-400 max-w-xs truncate">${log.description || log.entityType || '—'}</td>
                      <td class="py-2.5 text-slate-500 whitespace-nowrap">${new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        }
      }

      // Recent Bookings
      const recentEl = document.getElementById('admin-recent-bookings');
      if (recentEl) {
        if (recentBookings.length === 0) {
          recentEl.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">No bookings yet.</div>`;
        } else {
          recentEl.innerHTML = `
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b border-slate-800">
                    <th class="py-2.5 pr-4 text-left font-semibold text-slate-400">Booking #</th>
                    <th class="py-2.5 pr-4 text-left font-semibold text-slate-400">Customer</th>
                    <th class="py-2.5 pr-4 text-left font-semibold text-slate-400">Service</th>
                    <th class="py-2.5 pr-4 text-left font-semibold text-slate-400">Status</th>
                    <th class="py-2.5 text-left font-semibold text-slate-400">Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-900">
                  ${recentBookings.map((b) => {
                    const statusColors = { PENDING: 'amber', ACCEPTED: 'blue', IN_PROGRESS: 'indigo', PAID: 'emerald', CANCELLED: 'rose', PAYMENT_PENDING: 'orange' };
                    const sc = statusColors[b.status] || 'slate';
                    return `
                      <tr class="hover:bg-slate-900/40">
                        <td class="py-2.5 pr-4 font-mono text-sky-400">${b.bookingNumber || b._id?.slice(-6)}</td>
                        <td class="py-2.5 pr-4 text-slate-200">${b.customer?.name || '—'}</td>
                        <td class="py-2.5 pr-4 text-slate-400 truncate max-w-[160px]">${b.service?.name || '—'}</td>
                        <td class="py-2.5 pr-4">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-${sc}-500/20 text-${sc}-300">${b.status}</span>
                        </td>
                        <td class="py-2.5 text-slate-500 whitespace-nowrap">${new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;
        }
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Admin dashboard error:', err);
    }
  }
}
