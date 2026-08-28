import { ApiClient } from '../../api.js';
import { RatingStars } from '../../components/ratingStars.js';
import { store } from '../../state.js';
import { Toast } from '../../components/toast.js';

export class ProviderDetailPage {
  static async render(container, providerId) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div id="provider-detail-content" class="animate-fade-in">
          <div class="animate-pulse space-y-6">
            <div class="h-44 bg-slate-900 rounded-2xl"></div>
          </div>
        </div>
      </div>
    `;

    this.loadProvider(providerId);
  }

  static async loadProvider(providerId) {
    const container = document.getElementById('provider-detail-content');
    if (!container) return;

    try {
      const res = await ApiClient.get(`/providers/${providerId}`);
      const { provider, services = [], reviews = [] } = res.data || {};

      if (!provider) {
        container.innerHTML = `<div class="text-center py-16 text-white font-bold">Provider not found</div>`;
        return;
      }

      container.innerHTML = `
        <!-- Provider Hero Header -->
        <div class="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-5">
            <img src="${provider.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop'}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-sky-500/30 shrink-0" />
            <div>
              <div class="flex items-center space-x-2">
                <h1 class="text-2xl sm:text-3xl font-extrabold text-white">${provider.name}</h1>
                ${provider.providerProfile?.isVerified ? `<span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center"><i data-lucide="check-circle" class="w-3.5 h-3.5 mr-1"></i> Verified</span>` : ''}
              </div>
              <div class="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>📍 ${provider.address?.city || 'Pakistan'}</span>
                <span>•</span>
                <span>💼 ${provider.providerProfile?.experienceYears || 5}+ Years Experience</span>
              </div>
              <div class="mt-2">
                ${RatingStars.render(provider.providerProfile?.rating || 4.9, provider.providerProfile?.reviewCount || 20, 'md')}
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-3 shrink-0">
            <button onclick="window.startChatWithProvider('${provider._id}')" class="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition flex items-center space-x-2">
              <i data-lucide="message-square" class="w-4 h-4"></i>
              <span>Send Message</span>
            </button>
            <button id="provider-detail-fav-btn" onclick="window.toggleFavoriteProvider('${provider._id}')" class="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 transition" title="Add to Favorites">
              <i data-lucide="heart" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left: Services & Reviews -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Services Offered -->
            <div>
              <h2 class="text-xl font-bold text-white mb-4">Services by ${provider.name}</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${
                  services.length === 0
                    ? `<div class="col-span-2 glass-panel p-6 rounded-xl text-center text-xs text-slate-400">No active services listed yet.</div>`
                    : services
                        .map(
                          (s) => `
                  <div class="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-[11px] font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10">${s.category?.name || 'Service'}</span>
                        <span class="text-[11px] text-slate-400">${s.estimatedDuration}</span>
                      </div>
                      <h4 class="font-bold text-white text-sm mb-1 line-clamp-1">${s.name}</h4>
                      <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">${s.description}</p>
                    </div>
                    <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div class="text-[10px] text-slate-500 uppercase font-semibold">Starting From</div>
                        <div class="text-sm font-extrabold text-sky-400">Rs. ${s.startingPrice.toLocaleString()}</div>
                      </div>
                      <a href="#/services/${s._id}" class="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 transition">Book</a>
                    </div>
                  </div>
                `
                        )
                        .join('')
                }
              </div>
            </div>

            <!-- Customer Reviews -->
            <div class="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 class="text-base font-bold text-white">Client Feedback & Ratings</h3>
              <div class="space-y-3">
                ${
                  reviews.length === 0
                    ? `<div class="text-xs text-slate-400 py-4 text-center">No reviews yet for this provider.</div>`
                    : reviews
                        .map(
                          (r) => `
                  <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-white">${r.customer?.name || 'Customer'}</span>
                      <span class="text-[10px] text-slate-500">${new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    ${RatingStars.render(r.rating)}
                    <p class="text-xs text-slate-300 leading-relaxed">${r.comment}</p>
                  </div>
                `
                        )
                        .join('')
                }
              </div>
            </div>
          </div>

          <!-- Right: Bio & Availability -->
          <div class="lg:col-span-1 space-y-6">
            <!-- About Bio -->
            <div class="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">About Provider</h3>
              <p class="text-xs text-slate-300 leading-relaxed">${provider.providerProfile?.bio || 'Dedicated professional providing top-tier services.'}</p>
            </div>

            <!-- Working Hours & Availability -->
            <div class="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                <i data-lucide="calendar" class="w-4 h-4 mr-2 text-sky-400"></i> Availability
              </h3>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                  <span class="text-slate-400">Working Days:</span>
                  <span class="font-medium">${provider.providerProfile?.availability?.days?.join(', ') || 'Mon - Sat'}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                  <span class="text-slate-400">Hours:</span>
                  <span class="font-medium">${provider.providerProfile?.availability?.startTime || '09:00'} - ${provider.providerProfile?.availability?.endTime || '18:00'}</span>
                </div>
                <div class="flex justify-between py-1 text-slate-300">
                  <span class="text-slate-400">Service Areas:</span>
                  <span class="font-medium text-right">${provider.providerProfile?.serviceAreas?.join(', ') || 'All Areas'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Check initial favorite status
      let isSaved = false;
      if (store.isAuthenticated && store.role === 'CUSTOMER') {
        try {
          const checkRes = await ApiClient.get(`/favorites/check/${provider._id}`);
          isSaved = checkRes.data?.isFavorite || false;
          const favBtn = document.getElementById('provider-detail-fav-btn');
          if (favBtn && isSaved) {
            favBtn.className = 'p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 transition';
            favBtn.innerHTML = '<i data-lucide="heart" class="w-4 h-4 fill-rose-500 text-rose-500"></i>';
            if (window.lucide) window.lucide.createIcons();
          }
        } catch (_) {}
      }

      window.toggleFavoriteProvider = async (providerId) => {
        if (!store.isAuthenticated) {
          Toast.warning('Please log in to save favorite providers', 'Sign In Required');
          window.location.hash = '#/login';
          return;
        }
        try {
          const favRes = await ApiClient.post('/favorites/toggle', { providerId });
          const isFav = favRes.data?.isFavorite ?? favRes.message?.includes('added');
          const btn = document.getElementById('provider-detail-fav-btn');
          if (btn) {
            if (isFav) {
              btn.className = 'p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 transition';
              btn.innerHTML = '<i data-lucide="heart" class="w-4 h-4 fill-rose-500 text-rose-500"></i>';
            } else {
              btn.className = 'p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 transition';
              btn.innerHTML = '<i data-lucide="heart" class="w-4 h-4"></i>';
            }
            if (window.lucide) window.lucide.createIcons();
          }
          Toast.success(favRes.message || (isFav ? 'Provider added to favorites' : 'Provider removed from favorites'));
        } catch (err) {
          Toast.error(err.message);
        }
      };

      window.startChatWithProvider = async (targetUserId) => {
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
      console.error('Provider detail error:', err);
    }
  }
}
