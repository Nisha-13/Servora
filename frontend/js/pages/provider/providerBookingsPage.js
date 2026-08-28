import { ApiClient } from '../../api.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';

export class ProviderBookingsPage {
  static _queryParams = {};

  static async render(container, queryParams = {}) {
    ProviderBookingsPage._queryParams = queryParams;
    const activeTab = queryParams.status || 'ALL';

    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Manage Bookings</h1>
          <p class="text-xs text-slate-400 mt-1">Accept, progress, complete, and generate invoices for customer service requests.</p>
        </div>

        <!-- Status Tabs -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-semibold">
          ${[
            { label: 'All Bookings', status: 'ALL', color: 'sky' },
            { label: 'Pending Requests', status: 'PENDING', color: 'amber' },
            { label: 'Accepted', status: 'ACCEPTED', color: 'blue' },
            { label: 'In Progress', status: 'IN_PROGRESS', color: 'indigo' },
            { label: 'Awaiting Payment', status: 'PAYMENT_PENDING', color: 'rose' },
            { label: 'Completed', status: 'PAID', color: 'emerald' }
          ].map(({ label, status, color }) => {
            const isActive = activeTab === status;
            const activeClass = `bg-${color}-500 text-white shadow-md`;
            const inactiveClass = 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800';
            return `
              <button
                onclick="window.filterProviderBookings('${status}')"
                class="px-4 py-2 rounded-xl transition whitespace-nowrap ${isActive ? activeClass : inactiveClass}"
              >
                ${label}
              </button>
            `;
          }).join('')}
        </div>

        <div id="provider-bookings-list" class="space-y-4">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-48"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-48"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    window.filterProviderBookings = (status) => {
      window.location.hash = (status === 'ALL') ? '#/provider/bookings' : `#/provider/bookings?status=${status}`;
    };

    this.loadBookings(queryParams);
  }

  static async loadBookings(queryParams) {
    const listContainer = document.getElementById('provider-bookings-list');
    if (!listContainer) return;

    try {
      let endpoint = '/bookings?limit=30&asProvider=true';
      if (queryParams.status && queryParams.status !== 'ALL') {
        endpoint += `&status=${queryParams.status}`;
      }

      const res = await ApiClient.get(endpoint);
      const bookings = res.data?.bookings || [];

      if (bookings.length === 0) {
        listContainer.innerHTML = `
          <div class="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto"><i data-lucide="inbox" class="w-6 h-6"></i></div>
            <h3 class="font-bold text-white text-base">No bookings in this category</h3>
            <p class="text-xs text-slate-400">Bookings from customers will appear here when they request your services.</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      listContainer.innerHTML = bookings.map((b) => `
        <div class="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div class="flex items-center space-x-2.5 mb-1">
                <span class="text-xs font-mono font-bold text-sky-400">${b.bookingNumber}</span>
                <span class="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase badge-${b.status.toLowerCase()}">${b.status.replace('_', ' ')}</span>
              </div>
              <h3 class="text-base font-bold text-white">${b.service?.name || 'Service'}</h3>
            </div>
            <div class="text-xs text-slate-400">${new Date(b.bookingDate).toLocaleDateString()} (${b.timeSlot})</div>
          </div>

          <!-- Customer Details & Address -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <img src="${b.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'}" class="w-10 h-10 rounded-xl object-cover" />
              <div>
                <div class="text-[10px] text-slate-500 uppercase">Customer</div>
                <div class="font-bold text-white">${b.customer?.name}</div>
                <div class="text-slate-400">${b.customer?.phone || 'N/A'}</div>
              </div>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div class="text-[10px] text-slate-500 uppercase mb-1">Service Address</div>
              <div class="font-semibold text-slate-200">${b.address?.street || 'Not specified'}</div>
              <div class="text-slate-400">${b.address?.city}</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div class="text-[10px] text-slate-500 uppercase mb-1">Notes from Customer</div>
              <div class="text-slate-300 line-clamp-2">${b.notes || 'No special notes.'}</div>
            </div>
          </div>

          <!-- Action Buttons by Status -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button onclick="window.startDirectChatProvider('${b.customer?._id}', '${b._id}')" class="px-3.5 py-2 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 text-xs font-semibold transition flex items-center space-x-1.5">
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
              <span>Message Customer</span>
            </button>

            <div class="flex flex-wrap items-center gap-2">
              ${b.status === 'PENDING' ? `
                <button onclick="window.updateBookingStatus('${b._id}', 'ACCEPTED')" class="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5">
                  <i data-lucide="check" class="w-3.5 h-3.5"></i><span>Accept Booking</span>
                </button>
                <button onclick="window.updateBookingStatus('${b._id}', 'REJECTED')" class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs transition">
                  Decline
                </button>
              ` : ''}

              ${b.status === 'ACCEPTED' ? `
                <button onclick="window.updateBookingStatus('${b._id}', 'IN_PROGRESS')" class="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5">
                  <i data-lucide="play" class="w-3.5 h-3.5"></i><span>Start Service</span>
                </button>
              ` : ''}

              ${b.status === 'IN_PROGRESS' ? `
                <button onclick="window.updateBookingStatus('${b._id}', 'SERVICE_COMPLETED')" class="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5"></i><span>Mark Service Complete</span>
                </button>
              ` : ''}

              ${b.status === 'SERVICE_COMPLETED' && !b.invoice ? `
                <button onclick="window.openGenerateInvoiceModal('${b._id}', '${b.service?.name?.replace(/'/g, "\\'")}')" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center space-x-2">
                  <i data-lucide="file-text" class="w-4 h-4"></i><span>Generate Invoice</span>
                </button>
              ` : ''}

              ${b.status === 'PAYMENT_PENDING' ? `
                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span class="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-1.5">
                    <i data-lucide="banknote" class="w-3.5 h-3.5"></i>
                    <span>Cash Payment Pending — Rs. ${(b.invoice?.totalAmount || b.startingPrice || 0).toLocaleString()}</span>
                  </span>
                  <button onclick="window.confirmCashPaymentReceived('${b._id}', '${b.invoice?._id || b.invoice || ''}', ${b.invoice?.totalAmount || b.startingPrice || 0})" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition flex items-center space-x-1.5">
                    <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                    <span>Confirm Cash Received</span>
                  </button>
                </div>
              ` : ''}

              ${b.status === 'PAID' ? `
                <span class="text-xs text-emerald-400 font-semibold flex items-center">
                  <i data-lucide="check-circle" class="w-4 h-4 mr-1.5"></i> Completed & Paid – Rs. ${b.invoice?.totalAmount?.toLocaleString()}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();

      window.confirmCashPaymentReceived = async (bookingId, invoiceId, amount) => {
        const ok = confirm(`Confirm receipt of Rs. ${Number(amount).toLocaleString()} in physical cash from customer?`);
        if (!ok) return;

        try {
          await ApiClient.post('/payments/confirm-cash', { bookingId, invoiceId: invoiceId || undefined });
          Toast.success('Cash payment confirmed! Booking is now completed and marked as PAID.', 'Payment Confirmed');
          ProviderBookingsPage.loadBookings(ProviderBookingsPage._queryParams);
        } catch (err) {
          Toast.error(err.message || 'Failed to confirm cash payment');
        }
      };

      window.updateBookingStatus = async (bookingId, newStatus) => {
        const reason = ['REJECTED', 'CANCELLED'].includes(newStatus)
          ? (prompt(`Reason for ${newStatus}:`) || 'No reason provided')
          : null;

        try {
          await ApiClient.patch(`/bookings/${bookingId}/status`, { status: newStatus, ...(reason && { reason }) });
          Toast.success(`Booking status updated to ${newStatus.replace('_', ' ')}`);
          ProviderBookingsPage.loadBookings(ProviderBookingsPage._queryParams);
        } catch (err) {
          Toast.error(err.message || 'Status update failed');
        }
      };

      window.openGenerateInvoiceModal = (bookingId, serviceName) => {
        Modal.open({
          title: 'Generate Itemized Invoice',
          content: `
            <div class="text-xs space-y-5">
              <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div class="font-bold text-white text-sm">${serviceName}</div>
                <div class="text-slate-400 text-[11px]">Fill in the breakdown below. All amounts in Rs. (PKR).</div>
              </div>
              <form onsubmit="window.submitInvoice(event, '${bookingId}')" class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold text-slate-300 mb-1">Service Fee *</label>
                    <input id="inv-service-fee" type="number" min="0" value="1500" required class="glass-input w-full px-3 py-2 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-300 mb-1">Labor Fee</label>
                    <input id="inv-labor-fee" type="number" min="0" value="800" class="glass-input w-full px-3 py-2 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-300 mb-1">Parts / Materials Fee</label>
                    <input id="inv-parts-fee" type="number" min="0" value="0" class="glass-input w-full px-3 py-2 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-300 mb-1">Extra / Miscellaneous</label>
                    <input id="inv-extra-fee" type="number" min="0" value="0" class="glass-input w-full px-3 py-2 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-300 mb-1">Tax Amount</label>
                    <input id="inv-tax" type="number" min="0" value="0" class="glass-input w-full px-3 py-2 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-300 mb-1">Discount</label>
                    <input id="inv-discount" type="number" min="0" value="0" class="glass-input w-full px-3 py-2 rounded-xl text-xs" />
                  </div>
                </div>
                <div>
                  <label class="block font-semibold text-slate-300 mb-1">Invoice Notes</label>
                  <textarea id="inv-notes" rows="2" placeholder="Additional notes for the customer..." class="glass-input w-full px-3 py-2 rounded-xl text-xs"></textarea>
                </div>
                <div class="flex justify-end space-x-3 pt-2">
                  <button type="button" onclick="window.Modal.close()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                  <button type="submit" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg transition">Issue Invoice & Request Cash Payment</button>
                </div>
              </form>
            </div>
          `,
          maxWidth: 'max-w-lg'
        });
      };

      window.submitInvoice = async (event, bookingId) => {
        event.preventDefault();
        try {
          const payload = {
            bookingId,
            serviceFee: parseFloat(document.getElementById('inv-service-fee').value || '0'),
            laborFee: parseFloat(document.getElementById('inv-labor-fee').value || '0'),
            partsFee: parseFloat(document.getElementById('inv-parts-fee').value || '0'),
            extraFee: parseFloat(document.getElementById('inv-extra-fee').value || '0'),
            tax: parseFloat(document.getElementById('inv-tax').value || '0'),
            discount: parseFloat(document.getElementById('inv-discount').value || '0'),
            notes: document.getElementById('inv-notes').value
          };

          await ApiClient.post('/invoices', payload);
          Modal.close();
          Toast.success('Invoice issued! Customer will settle in cash upon completion.', 'Invoice Sent');
          ProviderBookingsPage.loadBookings(ProviderBookingsPage._queryParams);
        } catch (err) {
          Toast.error(err.message || 'Failed to create invoice');
        }
      };

      window.startDirectChatProvider = async (targetUserId, bookingId) => {
        try {
          const res = await ApiClient.post('/conversations', { targetUserId, bookingId });
          window.location.hash = `#/chat?id=${res.data?.conversation?._id}`;
        } catch (err) {
          Toast.error(err.message);
        }
      };

    } catch (err) {
      console.error('Provider bookings error:', err);
    }
  }
}
