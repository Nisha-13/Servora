import { ApiClient } from '../../api.js';
import { RatingStars } from '../../components/ratingStars.js';
import { Toast } from '../../components/toast.js';
import { Modal } from '../../components/modal.js';
import { store } from '../../state.js';

export class ProviderEarningsPage {
  static async render(container) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Earnings & Revenue</h1>
          <p class="text-xs text-slate-400 mt-1">Track all your paid invoices and revenue analytics.</p>
        </div>

        <div id="earnings-kpis" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-24"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-24"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-24"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-24"></div>
        </div>

        <div class="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 class="text-base font-bold text-white mb-4 flex items-center">
            <i data-lucide="trending-up" class="w-4 h-4 mr-2 text-emerald-400"></i> Monthly Revenue (Completed Invoices)
          </h3>
          <canvas id="earnings-chart" height="120"></canvas>
        </div>

        <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 class="text-base font-bold text-white mb-2">Paid Invoice History</h3>
          <div id="earnings-invoices-list" class="space-y-3">
            <div class="animate-pulse bg-slate-900/60 rounded-xl h-16"></div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.loadEarnings();
  }

  static _chartInstance = null;

  static async loadEarnings() {
    try {
      if (ProviderEarningsPage._chartInstance) {
        try { ProviderEarningsPage._chartInstance.destroy(); } catch (_) {}
        ProviderEarningsPage._chartInstance = null;
      }

      const res = await ApiClient.get('/invoices?status=PAID');
      const invoices = res.data?.invoices || [];

      const totalEarnings = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const thisMonth = invoices
        .filter((inv) => new Date(inv.updatedAt).getMonth() === new Date().getMonth())
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const avgInvoice = invoices.length ? Math.round(totalEarnings / invoices.length) : 0;

      const kpisGrid = document.getElementById('earnings-kpis');
      if (kpisGrid) {
        kpisGrid.innerHTML = `
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-[11px] font-semibold text-slate-400 uppercase mb-1">Total Earnings</div>
            <div class="text-xl font-extrabold text-emerald-400">Rs. ${totalEarnings.toLocaleString()}</div>
            <div class="text-[10px] text-slate-500 mt-1">Lifetime verified revenue</div>
          </div>
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-[11px] font-semibold text-slate-400 uppercase mb-1">This Month</div>
            <div class="text-xl font-extrabold text-sky-400">Rs. ${thisMonth.toLocaleString()}</div>
            <div class="text-[10px] text-slate-500 mt-1">Current calendar month</div>
          </div>
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-[11px] font-semibold text-slate-400 uppercase mb-1">Paid Invoices</div>
            <div class="text-xl font-extrabold text-purple-400">${invoices.length}</div>
            <div class="text-[10px] text-slate-500 mt-1">Completed jobs billed</div>
          </div>
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="text-[11px] font-semibold text-slate-400 uppercase mb-1">Avg. Invoice Value</div>
            <div class="text-xl font-extrabold text-amber-400">Rs. ${avgInvoice.toLocaleString()}</div>
            <div class="text-[10px] text-slate-500 mt-1">Total revenue ÷ paid jobs</div>
          </div>
        `;
      }

      // Chart
      const chartCanvas = document.getElementById('earnings-chart');
      if (chartCanvas && window.Chart) {
        const monthlyData = {};
        invoices.forEach((inv) => {
          const month = new Date(inv.updatedAt).toLocaleString('default', { month: 'short', year: '2-digit' });
          monthlyData[month] = (monthlyData[month] || 0) + inv.totalAmount;
        });

        // If only 1 month or empty, provide aesthetic curve
        const labels = Object.keys(monthlyData).length > 0 ? Object.keys(monthlyData) : ['May', 'Jun', 'Jul', 'Aug', 'Sep'];
        const dataVals = Object.keys(monthlyData).length > 0 ? Object.values(monthlyData) : [0, 0, 0, 0, totalEarnings];

        ProviderEarningsPage._chartInstance = new window.Chart(chartCanvas, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Earnings (Rs.)',
              data: dataVals,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#10b981',
              pointRadius: 5
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
              y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
            }
          }
        });
      }

      // Invoice List
      const listContainer = document.getElementById('earnings-invoices-list');
      if (listContainer) {
        if (invoices.length === 0) {
          listContainer.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">No paid invoices yet.</div>`;
        } else {
          listContainer.innerHTML = invoices.map((inv) => `
            <div class="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div>
                <div class="font-mono font-bold text-sky-400 text-[11px] mb-0.5">Invoice #${inv.invoiceNumber}</div>
                <div class="font-semibold text-white">${inv.booking?.service?.name || 'Service'}</div>
                <div class="text-slate-400">${inv.customer?.name} • ${new Date(inv.updatedAt).toLocaleDateString()}</div>
              </div>
              <div class="text-right">
                <div class="text-base font-extrabold text-emerald-400">Rs. ${inv.totalAmount.toLocaleString()}</div>
                <div class="text-[10px] text-emerald-600 font-semibold mt-0.5">PAID</div>
              </div>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      console.error('Earnings error:', err);
    }
  }
}

export class ProviderReviewsPage {
  static async render(container) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">My Reviews</h1>
          <p class="text-xs text-slate-400 mt-1">Customer ratings and feedback for services you've completed.</p>
        </div>
        <div id="provider-reviews-list" class="space-y-4">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-32"></div>
        </div>
      </div>
    `;

    try {
      const res = await ApiClient.get(`/reviews?provider=${store.user?._id || ''}`);
      const reviews = res.data?.reviews || [];
      const container = document.getElementById('provider-reviews-list');
      if (!container) return;

      if (reviews.length === 0) {
        container.innerHTML = `
          <div class="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto"><i data-lucide="star" class="w-6 h-6"></i></div>
            <h3 class="font-bold text-white text-base">No reviews yet</h3>
            <p class="text-xs text-slate-400">Complete service bookings to receive customer ratings and feedback.</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      container.innerHTML = reviews.map((r) => `
        <div class="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-2.5">
              <img src="${r.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'}" class="w-9 h-9 rounded-lg object-cover" />
              <div>
                <div class="font-bold text-white text-xs">${r.customer?.name}</div>
                <div class="text-[10px] text-slate-400">${r.service?.name} • ${new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            ${RatingStars.render(r.rating)}
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${r.comment}</p>
          ${r.providerReply?.comment ? `
            <div class="p-3 rounded-xl bg-sky-500/5 border-l-2 border-sky-400 text-xs text-slate-300">
              <span class="font-bold text-sky-300">Your Reply:</span> ${r.providerReply.comment}
            </div>
          ` : `
            <button onclick="window.replyToReview('${r._id}')" class="text-xs text-sky-400 hover:text-sky-300 font-semibold">
              + Reply to this review
            </button>
          `}
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();

      window.replyToReview = (reviewId) => {
        Modal.open({
          title: 'Reply to Customer Review',
          content: `
            <form onsubmit="window.submitReviewReply(event, '${reviewId}')" class="space-y-3 text-xs">
              <textarea id="reply-text" rows="3" required placeholder="Write a professional, friendly response to the customer..." class="glass-input w-full px-3 py-2 rounded-xl text-xs"></textarea>
              <div class="flex justify-end space-x-3">
                <button type="button" onclick="window.Modal.close()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs transition">Post Reply</button>
              </div>
            </form>
          `,
          maxWidth: 'max-w-md'
        });
      };

      window.submitReviewReply = async (event, reviewId) => {
        event.preventDefault();
        const comment = document.getElementById('reply-text')?.value;
        if (!comment) return;

        try {
          await ApiClient.post(`/reviews/${reviewId}/reply`, { comment });
          Modal.close();
          Toast.success('Reply posted successfully!');
          ProviderReviewsPage.render(document.getElementById('app'));
        } catch (err) {
          Toast.error(err.message);
        }
      };

    } catch (err) {
      console.error('Provider reviews error:', err);
    }
  }
}

export class ProviderAvailabilityPage {
  static selectedDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  static async render(container) {
    const user = store.user || {};
    const profile = user.providerProfile || {};
    const availability = profile.availability || {};
    
    if (Array.isArray(availability.days) && availability.days.length > 0) {
      ProviderAvailabilityPage.selectedDays = [...availability.days];
    } else {
      ProviderAvailabilityPage.selectedDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    }

    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-3xl mx-auto w-full space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Availability Settings</h1>
          <p class="text-xs text-slate-400 mt-1">Set your working hours and service coverage areas for customer scheduling.</p>
        </div>

        <form onsubmit="window.saveAvailability(event)" class="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 text-xs">
          <!-- Working Days -->
          <div>
            <label class="block font-bold text-slate-200 text-sm mb-3">Working Days</label>
            <div class="flex flex-wrap gap-2" id="days-selector">
              ${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => `
                <button
                  type="button"
                  id="day-${day}"
                  onclick="window.toggleDay('${day}')"
                  class="px-4 py-2 rounded-xl border transition text-xs font-semibold ${ProviderAvailabilityPage.selectedDays.includes(day) ? 'bg-sky-500 text-white border-sky-500' : 'border-slate-700 text-slate-400 hover:border-slate-500'}"
                >
                  ${day.substring(0,3)}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Time Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Start Time</label>
              <input id="start-time" type="time" value="${availability.startTime || '09:00'}" class="glass-input w-full px-3 py-2.5 rounded-xl text-xs" />
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">End Time</label>
              <input id="end-time" type="time" value="${availability.endTime || '18:00'}" class="glass-input w-full px-3 py-2.5 rounded-xl text-xs" />
            </div>
          </div>

          <!-- Service Areas -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1.5">Service Coverage Areas (comma-separated)</label>
            <textarea id="service-areas" rows="2" placeholder="DHA, Gulberg, Model Town, Johar Town" class="glass-input w-full px-3 py-2 rounded-xl text-xs">${(profile.serviceAreas || []).join(', ')}</textarea>
          </div>

          <div class="flex justify-end">
            <button type="submit" id="save-avail-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition">
              Save Availability
            </button>
          </div>
        </form>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    window.toggleDay = (day) => {
      const current = ProviderAvailabilityPage.selectedDays;
      const btn = document.getElementById(`day-${day}`);
      const idx = current.indexOf(day);

      if (idx >= 0) {
        current.splice(idx, 1);
        if (btn) btn.className = 'px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-500 transition text-xs font-semibold';
      } else {
        current.push(day);
        if (btn) btn.className = 'px-4 py-2 rounded-xl border bg-sky-500 text-white border-sky-500 transition text-xs font-semibold';
      }
    };

    window.saveAvailability = async (event) => {
      event.preventDefault();
      const btn = document.getElementById('save-avail-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

      try {
        const days = ProviderAvailabilityPage.selectedDays;
        const startTime = document.getElementById('start-time')?.value || '09:00';
        const endTime = document.getElementById('end-time')?.value || '18:00';
        const areasRaw = document.getElementById('service-areas')?.value || '';
        const serviceAreas = areasRaw.split(',').map(a => a.trim()).filter(Boolean);

        const res = await ApiClient.put('/providers/availability', {
          availability: { days, startTime, endTime },
          serviceAreas
        });

        // Update local state
        if (store.user) {
          const updatedProfile = {
            ...(store.user.providerProfile || {}),
            availability: { days, startTime, endTime },
            serviceAreas
          };
          store.setUser({ ...store.user, providerProfile: updatedProfile }, store.token);
        }

        Toast.success('Availability & service areas updated successfully!', 'Settings Saved');
      } catch (err) {
        Toast.error(err.message || 'Failed to save availability');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Save Availability'; }
      }
    };
  }
}
