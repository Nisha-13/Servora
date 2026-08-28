import { ApiClient } from '../../api.js';
import { RatingStars } from '../../components/ratingStars.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { store } from '../../state.js';

export class ServiceDetailPage {
  static async render(container, serviceId) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div id="service-detail-content" class="animate-fade-in">
          <div class="animate-pulse space-y-6">
            <div class="h-8 bg-slate-900 rounded w-1/3"></div>
            <div class="h-64 bg-slate-900 rounded-2xl"></div>
          </div>
        </div>
      </div>
    `;

    this.loadService(serviceId);
  }

  static async loadService(serviceId) {
    const container = document.getElementById('service-detail-content');
    if (!container) return;

    try {
      const res = await ApiClient.get(`/services/${serviceId}`);
      const service = res.data?.service;

      if (!service) {
        container.innerHTML = `
          <div class="text-center py-16">
            <h2 class="text-xl font-bold text-white mb-2">Service Not Found</h2>
            <a href="#/services" class="text-sky-400 font-semibold text-sm">← Back to Services</a>
          </div>
        `;
        return;
      }

      // Fetch reviews for this service
      const reviewsRes = await ApiClient.get(`/reviews?service=${serviceId}`);
      const reviews = reviewsRes.data?.reviews || [];

      container.innerHTML = `
        <!-- Breadcrumb -->
        <div class="flex items-center space-x-2 text-xs text-slate-400 mb-6">
          <a href="#/" class="hover:text-white transition">Home</a>
          <span>/</span>
          <a href="#/services" class="hover:text-white transition">Services</a>
          <span>/</span>
          <a href="#/services?category=${service.category?._id}" class="hover:text-white transition">${service.category?.name || 'Category'}</a>
          <span>/</span>
          <span class="text-slate-200 font-medium">${service.name}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content Column -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Header & Images -->
            <div>
              <div class="inline-block px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
                ${service.category?.name || 'Professional Service'}
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-3">${service.name}</h1>
              <div class="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                ${RatingStars.render(service.rating || 5, service.reviewCount || 10, 'md')}
                <span class="flex items-center"><i data-lucide="clock" class="w-3.5 h-3.5 mr-1 text-sky-400"></i> ${service.estimatedDuration}</span>
                <span class="flex items-center"><i data-lucide="map-pin" class="w-3.5 h-3.5 mr-1 text-emerald-400"></i> ${service.serviceArea?.join(', ') || 'Citywide'}</span>
              </div>
            </div>

            <!-- Main Image Banner -->
            <div class="rounded-2xl overflow-hidden glass-panel border border-slate-800 h-72 sm:h-96">
              <img src="${service.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1000&h=700&fit=crop'}" class="w-full h-full object-cover" alt="${service.name}" />
            </div>

            <!-- Description & Service Scope -->
            <div class="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 class="text-base font-bold text-white">Service Overview & Scope</h3>
              <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line">${service.description}</p>

              <div class="pt-4 border-t border-slate-800">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">What's Included:</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div class="flex items-center space-x-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i><span>Certified & Verified Technician</span></div>
                  <div class="flex items-center space-x-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i><span>On-site Inspection & Diagnostics</span></div>
                  <div class="flex items-center space-x-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i><span>Transparent Itemized Invoicing</span></div>
                  <div class="flex items-center space-x-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i><span>Servora Quality Guarantee</span></div>
                </div>
              </div>
            </div>

            <!-- Customer Reviews Section -->
            <div class="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-base font-bold text-white">Customer Reviews</h3>
                  <div class="text-xs text-slate-400 mt-0.5">Verified feedback from completed service bookings</div>
                </div>
                <div>${RatingStars.render(service.rating || 5, service.reviewCount || 10, 'md')}</div>
              </div>

              <div class="space-y-4">
                ${
                  reviews.length === 0
                    ? `<div class="text-xs text-slate-400 py-4 text-center">No reviews yet for this service. Be the first to book and share your feedback!</div>`
                    : reviews
                        .map(
                          (r) => `
                  <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2.5">
                        <img src="${r.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'}" class="w-7 h-7 rounded-full object-cover" />
                        <span class="text-xs font-bold text-white">${r.customer?.name || 'Verified Customer'}</span>
                      </div>
                      <span class="text-[10px] text-slate-500">${new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    ${RatingStars.render(r.rating)}
                    <p class="text-xs text-slate-300 leading-relaxed">${r.comment}</p>
                    ${
                      r.providerReply?.comment
                        ? `
                      <div class="ml-4 p-3 rounded-lg bg-slate-800/60 border-l-2 border-sky-400 text-xs text-slate-300 mt-2">
                        <span class="font-bold text-sky-300">Provider Response:</span> ${r.providerReply.comment}
                      </div>
                    `
                        : ''
                    }
                  </div>
                `
                        )
                        .join('')
                }
              </div>
            </div>
          </div>

          <!-- Sidebar Booking Action & Provider Profile -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Price & Booking Card -->
            <div class="glass-panel p-6 rounded-2xl border border-sky-500/30 sticky top-20 space-y-6 shadow-2xl">
              <div>
                <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Estimated Starting Price</span>
                <div class="text-3xl font-extrabold text-sky-400 mt-1">Rs. ${service.startingPrice.toLocaleString()}</div>
                <p class="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Final invoice is calculated on-site by the provider based on parts and labor required.
                </p>
              </div>

              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div class="flex items-center justify-between text-slate-300">
                  <span class="text-slate-400">Duration:</span>
                  <span class="font-semibold">${service.estimatedDuration}</span>
                </div>
                <div class="flex items-center justify-between text-slate-300">
                  <span class="text-slate-400">Cancellation:</span>
                  <span class="text-emerald-400 font-semibold">Free before arrival</span>
                </div>
                <div class="flex items-center justify-between text-slate-300">
                  <span class="text-slate-400">Payment:</span>
                  <span class="text-sky-300 font-semibold">Pay after service completion</span>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <button
                  onclick="window.openBookingModal('${service._id}', '${service.name.replace(/'/g, "\\'")}', ${service.startingPrice})"
                  class="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition transform active:scale-98 flex items-center justify-center space-x-2"
                >
                  <i data-lucide="calendar-check" class="w-4 h-4"></i>
                  <span>Book This Service</span>
                </button>
                <button
                  id="service-detail-fav-btn"
                  onclick="window.toggleServiceDetailFavorite('${service._id}')"
                  class="p-3.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 border border-slate-700 transition"
                  title="Save Service"
                >
                  <i data-lucide="heart" class="w-5 h-5"></i>
                </button>
              </div>

              <!-- Provider Profile Summary -->
              <div class="pt-6 border-t border-slate-800">
                <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Service Provider</div>
                <div class="flex items-center space-x-3 mb-3">
                  <img src="${service.provider?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}" class="w-11 h-11 rounded-xl object-cover ring-2 ring-sky-500/30" />
                  <div>
                    <h4 class="font-bold text-white text-sm flex items-center">
                      ${service.provider?.name || 'Provider'}
                      ${service.provider?.providerProfile?.isVerified ? `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400 ml-1"></i>` : ''}
                    </h4>
                    <div class="text-[11px] text-slate-400">${service.provider?.address?.city || 'Pakistan'}</div>
                  </div>
                </div>
                ${RatingStars.render(service.provider?.providerProfile?.rating || 4.9, service.provider?.providerProfile?.reviewCount || 20)}
                <div class="mt-4 flex space-x-2">
                  <a href="#/providers/${service.provider?._id}" class="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-center text-xs font-semibold text-slate-200 transition">
                    View Profile
                  </a>
                  <button onclick="window.startChatWithUser('${service.provider?._id}')" class="px-3 py-2 rounded-xl bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 border border-sky-500/20 text-xs font-semibold transition">
                    <i data-lucide="message-square" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Modal Helper for Booking
      window.openBookingModal = (sId, sName, sPrice) => {
        if (!store.isAuthenticated) {
          Toast.warning('Please sign in as a customer to book a service', 'Authentication Required');
          window.location.hash = '#/login';
          return;
        }

        const user = store.user;
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const modalContent = `
          <form id="booking-modal-form" onsubmit="window.submitServiceBooking(event, '${sId}')" class="space-y-4 text-xs">
            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
              <div>
                <div class="font-bold text-white text-sm">${sName}</div>
                <div class="text-slate-400">Starting Price: Rs. ${sPrice.toLocaleString()}</div>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 text-[11px] font-bold">Step 1 of 5</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Appointment Date *</label>
                <input id="booking-date" type="date" min="${tomorrow}" value="${tomorrow}" required class="glass-input w-full px-3 py-2 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Preferred Time Slot *</label>
                <select id="booking-time-slot" required class="glass-input w-full px-3 py-2 rounded-xl text-xs">
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Noon)</option>
                  <option value="02:00 PM - 04:00 PM" selected>02:00 PM - 04:00 PM (Afternoon)</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                  <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Night)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Street Address *</label>
              <input id="booking-street" type="text" placeholder="House/Apartment #, Street, Block" value="${user.address?.street || ''}" required class="glass-input w-full px-3 py-2 rounded-xl text-xs" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">City *</label>
                <input id="booking-city" type="text" placeholder="Lahore, Karachi, Islamabad" value="${user.address?.city || 'Lahore'}" required class="glass-input w-full px-3 py-2 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Zip Code</label>
                <input id="booking-zip" type="text" placeholder="54000" value="${user.address?.zipCode || ''}" class="glass-input w-full px-3 py-2 rounded-xl text-xs" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Problem Description / Notes</label>
              <textarea id="booking-notes" rows="2.5" placeholder="Briefly describe the issue or specific requirements..." class="glass-input w-full px-3 py-2 rounded-xl text-xs"></textarea>
            </div>

            <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] leading-relaxed">
              💡 <strong>Cash on Delivery:</strong> No advance payment required. The service provider will inspect and complete work on-site, issue a final itemized invoice, and you will pay in cash upon completion.
            </div>

            <div class="flex items-center justify-end space-x-3 pt-2">
              <button type="button" onclick="window.Modal.close()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition">
                Cancel
              </button>
              <button type="submit" id="submit-booking-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition">
                Confirm & Request Booking
              </button>
            </div>
          </form>
        `;

        Modal.open({
          title: 'Schedule Service Appointment',
          content: modalContent,
          maxWidth: 'max-w-xl'
        });
      };

      window.submitServiceBooking = async (event, sId) => {
        event.preventDefault();
        const submitBtn = document.getElementById('submit-booking-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Submitting Request...';
        }

        try {
          const bookingDate = document.getElementById('booking-date').value;
          const timeSlot = document.getElementById('booking-time-slot').value;
          const street = document.getElementById('booking-street').value;
          const city = document.getElementById('booking-city').value;
          const zipCode = document.getElementById('booking-zip').value;
          const notes = document.getElementById('booking-notes').value;

          const res = await ApiClient.post('/bookings', {
            serviceId: sId,
            bookingDate,
            timeSlot,
            address: { street, city, zipCode },
            notes
          });

          Modal.close();
          Toast.success(`Booking #${res.data?.booking?.bookingNumber} submitted! The provider has been notified.`, 'Booking Requested');
          window.location.hash = '#/customer/bookings';
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Confirm & Request Booking';
          }
        }
      };

      // Check initial favorite status
      if (store.isAuthenticated && store.role === 'CUSTOMER') {
        try {
          const checkRes = await ApiClient.get(`/favorites/check-service/${service._id}`);
          const isSaved = checkRes.data?.isFavorite || false;
          const favBtn = document.getElementById('service-detail-fav-btn');
          if (favBtn && isSaved) {
            favBtn.className = 'p-3.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 transition';
            favBtn.innerHTML = '<i data-lucide="heart" class="w-5 h-5 fill-rose-500 text-rose-500"></i>';
            if (window.lucide) window.lucide.createIcons();
          }
        } catch (_) {}
      }

      window.toggleServiceDetailFavorite = async (sId) => {
        if (!store.isAuthenticated) {
          Toast.warning('Please log in to save favorite services', 'Sign In Required');
          window.location.hash = '#/login';
          return;
        }
        try {
          const favRes = await ApiClient.post('/favorites/toggle', { serviceId: sId });
          const isFav = favRes.data?.isFavorite ?? favRes.message?.includes('added');
          const btn = document.getElementById('service-detail-fav-btn');
          if (btn) {
            if (isFav) {
              btn.className = 'p-3.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 transition';
              btn.innerHTML = '<i data-lucide="heart" class="w-5 h-5 fill-rose-500 text-rose-500"></i>';
            } else {
              btn.className = 'p-3.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 border border-slate-700 transition';
              btn.innerHTML = '<i data-lucide="heart" class="w-5 h-5"></i>';
            }
            if (window.lucide) window.lucide.createIcons();
          }
          Toast.success(favRes.message || (isFav ? 'Service saved to favorites' : 'Service removed from saved'));
        } catch (err) {
          Toast.error(err.message);
        }
      };

      window.startChatWithUser = async (targetUserId) => {
        if (!store.isAuthenticated) {
          Toast.warning('Please sign in to chat with providers', 'Sign In Required');
          window.location.hash = '#/login';
          return;
        }

        try {
          const convRes = await ApiClient.post('/conversations', { targetUserId });
          const convId = convRes.data?.conversation?._id;
          window.location.hash = `#/chat?id=${convId}`;
        } catch (err) {
          Toast.error(err.message || 'Could not initiate chat');
        }
      };
    } catch (err) {
      console.error('Failed to load service detail:', err);
    }
  }
}
