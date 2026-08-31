import { ApiClient } from '../../api.js';
import { RatingStars } from '../../components/ratingStars.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';

export class CustomerBookingsPage {
  static async render(container, queryParams = {}) {
    const activeTab = queryParams.status || 'ALL';

    container.innerHTML = `
      <div class="py-6 sm:py-8 px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-6 overflow-hidden">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Service Bookings</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Track appointments, review itemized invoices, and pay completed services.</p>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-semibold max-w-full">
          <button onclick="window.filterCustomerBookings('ALL')" class="px-4 py-2 rounded-xl transition shrink-0 ${activeTab === 'ALL' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white bg-slate-900'}">
            All Bookings
          </button>
          <button onclick="window.filterCustomerBookings('PENDING')" class="px-4 py-2 rounded-xl transition shrink-0 ${activeTab === 'PENDING' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white bg-slate-900'}">
            Pending Requests
          </button>
          <button onclick="window.filterCustomerBookings('ACCEPTED')" class="px-4 py-2 rounded-xl transition shrink-0 ${activeTab === 'ACCEPTED' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white bg-slate-900'}">
            Accepted
          </button>
          <button onclick="window.filterCustomerBookings('IN_PROGRESS')" class="px-4 py-2 rounded-xl transition shrink-0 ${activeTab === 'IN_PROGRESS' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white bg-slate-900'}">
            In Progress
          </button>
          <button onclick="window.filterCustomerBookings('PAYMENT_PENDING')" class="px-4 py-2 rounded-xl transition shrink-0 ${activeTab === 'PAYMENT_PENDING' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white bg-slate-900'}">
            Payment Pending (Cash)
          </button>
          <button onclick="window.filterCustomerBookings('PAID')" class="px-4 py-2 rounded-xl transition shrink-0 ${activeTab === 'PAID' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white bg-slate-900'}">
            Completed & Paid
          </button>
        </div>

        <!-- Bookings List Container -->
        <div id="customer-bookings-list" class="space-y-4">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-44"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-44"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    window.filterCustomerBookings = (status) => {
      window.location.hash = status === 'ALL' ? '#/customer/bookings' : `#/customer/bookings?status=${status}`;
    };

    this.loadBookings(queryParams);
  }

  static async loadBookings(queryParams) {
    const listContainer = document.getElementById('customer-bookings-list');
    if (!listContainer) return;

    try {
      let endpoint = '/bookings?limit=30';
      if (queryParams.status && queryParams.status !== 'ALL') {
        endpoint += `&status=${queryParams.status}`;
      }

      const res = await ApiClient.get(endpoint);
      const bookings = res.data?.bookings || [];

      if (bookings.length === 0) {
        listContainer.innerHTML = `
          <div class="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto">
              <i data-lucide="inbox" class="w-6 h-6"></i>
            </div>
            <h3 class="font-bold text-white text-base">No bookings found in this category</h3>
            <p class="text-xs text-slate-400">Looking for a service? Explore our catalog of verified professionals.</p>
            <a href="#/services" class="inline-block px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-xs shadow-md">Browse Services</a>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      listContainer.innerHTML = bookings
        .map(
          (b) => `
        <div class="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4 sm:space-y-5 transition overflow-hidden">
          <!-- Top Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-slate-800/80 pb-3 sm:pb-4">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-mono font-bold text-sky-400">${b.bookingNumber}</span>
                <span class="text-slate-500">•</span>
                <span class="text-xs text-slate-400">Created ${new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-white mt-1 truncate">${b.service?.name || 'Professional Service'}</h3>
            </div>
            <div class="shrink-0 self-start sm:self-auto">
              <span class="px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-extrabold uppercase badge-${b.status.toLowerCase()}">
                ${b.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <!-- Middle Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
            <!-- Provider Info -->
            <div class="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 min-w-0">
              <img src="${b.provider?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}" class="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-500/20 shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="text-[10px] text-slate-500 uppercase font-semibold">Service Provider</div>
                <div class="font-bold text-white truncate">${b.provider?.name}</div>
                <div class="text-slate-400 text-[11px] truncate">${b.provider?.phone || '+92 300 0000000'}</div>
              </div>
            </div>

            <!-- Schedule & Address -->
            <div class="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 min-w-0">
              <div class="text-[10px] text-slate-500 uppercase font-semibold">Appointment</div>
              <div class="font-semibold text-slate-200">${new Date(b.bookingDate).toLocaleDateString()} (${b.timeSlot})</div>
              <div class="text-slate-400 text-[11px] truncate">${b.address?.street}, ${b.address?.city}</div>
            </div>

            <!-- Pricing / Invoice Summary -->
            <div class="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 min-w-0">
              <div class="text-[10px] text-slate-500 uppercase font-semibold">Billing Summary</div>
              ${
                b.invoice
                  ? `
                <div class="font-extrabold text-sm ${b.invoice.status === 'PAID' ? 'text-emerald-400' : 'text-rose-400'}">
                  Rs. ${b.invoice.totalAmount?.toLocaleString()} (${b.invoice.status})
                </div>
                <div class="text-slate-400 text-[10px]">Invoice #${b.invoice.invoiceNumber || 'Final'}</div>
              `
                  : `
                <div class="font-extrabold text-sm text-sky-400">Rs. ${b.startingPrice?.toLocaleString()} (Est. Starting)</div>
                <div class="text-slate-400 text-[10px]">Invoice generated upon completion</div>
              `
              }
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="window.viewBookingBreakdown('${b._id}')" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center space-x-1.5 flex-1 sm:flex-none justify-center">
                <i data-lucide="file-text" class="w-3.5 h-3.5 shrink-0"></i>
                <span>View Timeline & Invoice</span>
              </button>
              <button onclick="window.startDirectChat('${b.provider?._id}', '${b._id}')" class="px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 text-xs font-semibold transition flex items-center space-x-1.5 flex-1 sm:flex-none justify-center">
                <i data-lucide="message-square" class="w-3.5 h-3.5 shrink-0"></i>
                <span>Chat Provider</span>
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              ${
                b.status === 'PAYMENT_PENDING' && b.invoice
                  ? `
                <div class="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-semibold flex items-center space-x-1.5 max-w-full break-words">
                  <i data-lucide="banknote" class="w-4 h-4 shrink-0"></i>
                  <span>Cash on Delivery: Rs. ${b.invoice.totalAmount?.toLocaleString()}</span>
                </div>
              `
                  : ''
              }

              ${
                b.status === 'PAID' && !b.hasReview
                  ? `
                <button onclick="window.openReviewModal('${b._id}', '${b.service?.name?.replace(/'/g, "\\'")}', '${b.provider?.name?.replace(/'/g, "\\'")}')" class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition flex items-center space-x-1.5 flex-1 sm:flex-none justify-center">
                  <i data-lucide="star" class="w-4 h-4 shrink-0"></i>
                  <span>Leave Review</span>
                </button>
              `
                  : ''
              }

              ${
                b.status === 'PAID' && b.hasReview
                  ? `
                <span class="text-xs text-emerald-400 font-semibold flex items-center"><i data-lucide="check-circle" class="w-4 h-4 mr-1 shrink-0"></i> Review Submitted</span>
              `
                  : ''
              }

              ${
                ['PENDING', 'ACCEPTED'].includes(b.status)
                  ? `
                <button onclick="window.cancelCustomerBooking('${b._id}')" class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs transition flex-1 sm:flex-none justify-center">
                  Cancel Booking
                </button>
              `
                  : ''
              }
            </div>
          </div>
        </div>
      `
        )
        .join('');

      if (window.lucide) window.lucide.createIcons();

      // Booking Actions
      window.viewBookingBreakdown = async (bId) => {
        try {
          const res = await ApiClient.get(`/bookings/${bId}`);
          const booking = res.data?.booking;
          const invoice = booking?.invoice;

          const content = `
            <div class="space-y-6 text-xs">
              <!-- Status Machine Stepper -->
              <div>
                <div class="font-bold text-white text-sm mb-3">Booking Progress Lifecycle</div>
                <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  ${booking.statusHistory
                    ?.map(
                      (sh) => `
                    <div class="flex items-start space-x-3">
                      <div class="w-2.5 h-2.5 rounded-full bg-sky-400 mt-1 shrink-0"></div>
                      <div class="flex-grow">
                        <div class="font-bold text-white uppercase text-[11px]">${sh.status.replace('_', ' ')}</div>
                        <div class="text-slate-400 text-[10px]">${sh.note || ''} • ${new Date(sh.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <!-- Itemized Invoice Breakdown if available -->
              ${
                invoice
                  ? `
                <div>
                  <div class="font-bold text-white text-sm mb-3">Itemized Invoice #${invoice.invoiceNumber}</div>
                  <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div class="space-y-1.5 border-b border-slate-800 pb-3">
                      ${(invoice.items || [])
                        .map(
                          (item) => `
                        <div class="flex justify-between text-slate-300">
                          <span>${item.title} <strong class="text-slate-500">(${item.type})</strong></span>
                          <span class="font-mono font-semibold">Rs. ${item.amount.toLocaleString()}</span>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                    <div class="space-y-1 pt-1 text-slate-300">
                      <div class="flex justify-between"><span class="text-slate-400">Service Fee:</span><span>Rs. ${(invoice.serviceFee || 0).toLocaleString()}</span></div>
                      <div class="flex justify-between"><span class="text-slate-400">Labor Fee:</span><span>Rs. ${(invoice.laborFee || 0).toLocaleString()}</span></div>
                      <div class="flex justify-between"><span class="text-slate-400">Parts Fee:</span><span>Rs. ${(invoice.partsFee || 0).toLocaleString()}</span></div>
                    </div>
                    <div class="pt-2 border-t border-slate-700 flex justify-between font-extrabold text-sm text-white">
                      <span>Total Amount Due:</span>
                      <span class="text-sky-400 font-mono">Rs. ${invoice.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              `
                  : `
                <div class="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                  Estimated Starting Price: <strong>Rs. ${booking.startingPrice?.toLocaleString()}</strong>. The provider will generate the final itemized invoice upon completing on-site service.
                </div>
              `
              }
            </div>
          `;

          Modal.open({
            title: `Booking #${booking.bookingNumber}`,
            content,
            maxWidth: 'max-w-lg'
          });
        } catch (err) {
          Toast.error(err.message || 'Could not load details');
        }
      };

      window.openReviewModal = (bId, sName, pName) => {
        window._currentReviewRating = 5;

        const content = `
          <form onsubmit="window.submitReview(event, '${bId}')" class="space-y-4 text-xs">
            <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div class="font-bold text-white text-sm">${sName}</div>
              <div class="text-slate-400">Provider: ${pName}</div>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-2">Rating</label>
              ${RatingStars.renderInput(5)}
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Your Review / Feedback *</label>
              <textarea id="review-comment" rows="3" required placeholder="Describe your experience with the technician, punctuality, and service quality..." class="glass-input w-full px-3 py-2 rounded-xl text-xs"></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-2">
              <button type="button" onclick="window.Modal.close()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
              <button type="submit" id="submit-review-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-lg transition">Submit Review</button>
            </div>
          </form>
        `;

        Modal.open({
          title: 'Write a Review',
          content,
          maxWidth: 'max-w-md'
        });
      };

      window.setReviewRating = (val) => {
        window._currentReviewRating = val;
        for (let i = 1; i <= 5; i++) {
          const starBtn = document.getElementById(`star-btn-${i}`);
          if (starBtn) {
            starBtn.style.color = i <= val ? '#fbbf24' : '#334155';
          }
        }
      };

      window.submitReview = async (event, bId) => {
        event.preventDefault();
        const submitBtn = document.getElementById('submit-review-btn');
        if (submitBtn) submitBtn.disabled = true;

        try {
          const comment = document.getElementById('review-comment')?.value || '';
          const rating = window._currentReviewRating || 5;

          await ApiClient.post('/reviews', {
            bookingId: bId,
            rating,
            comment
          });

          Modal.close();
          Toast.success('Thank you for rating your service!', 'Review Submitted');
          CustomerBookingsPage.loadBookings(queryParams);
        } catch (err) {
          if (submitBtn) submitBtn.disabled = false;
        }
      };

      window.cancelCustomerBooking = async (bId) => {
        const reason = prompt('Please enter a reason for cancelling this booking:');
        if (reason === null) return;

        try {
          await ApiClient.patch(`/bookings/${bId}/status`, {
            status: 'CANCELLED',
            reason: reason || 'Cancelled by customer'
          });
          Toast.info('Booking has been cancelled.');
          CustomerBookingsPage.loadBookings(queryParams);
        } catch (err) {
          // Handled
        }
      };

      window.startDirectChat = async (targetUserId, bookingId) => {
        try {
          const res = await ApiClient.post('/conversations', { targetUserId, bookingId });
          window.location.hash = `#/chat?id=${res.data?.conversation?._id}`;
        } catch (err) {
          Toast.error(err.message);
        }
      };
    } catch (err) {
      console.error('Customer bookings error:', err);
    }
  }
}
