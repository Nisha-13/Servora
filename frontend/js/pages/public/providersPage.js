import { ApiClient } from '../../api.js';
import { RatingStars } from '../../components/ratingStars.js';
import { store } from '../../state.js';
import { Toast } from '../../components/toast.js';

let liveSearchTimer = null;
let savedProviderIds = new Set();

export class ProvidersPage {
  static async render(container, queryParams = {}) {
    const search = queryParams.search || '';

    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Verified Service Providers</h1>
            <p class="text-sm text-slate-400 mt-1">Discover vetted technicians, certified contractors, and verified professionals.</p>
          </div>

          <!-- Search / City Bar -->
          <div class="flex items-center space-x-2">
            <div class="relative">
              <input
                id="provider-search-input"
                type="text"
                placeholder="Search provider or specialty..."
                value="${search}"
                onkeydown="if(event.key === 'Enter') window.applyProviderSearch()"
                oninput="window.handleLiveProviderSearch(this.value)"
                class="glass-input px-3.5 py-2.5 rounded-xl text-xs pl-8 w-64 focus:ring-2 focus:ring-sky-500"
              />
              <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3"></i>
            </div>
            <button onclick="window.applyProviderSearch()" class="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-md shadow-sky-500/20">
              Search
            </button>
          </div>
        </div>

        <div id="providers-list-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-64"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-64"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-64"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    window.applyProviderSearch = () => {
      const q = document.getElementById('provider-search-input')?.value || '';
      ProvidersPage.loadProviders({ search: q });
    };

    window.handleLiveProviderSearch = (val) => {
      clearTimeout(liveSearchTimer);
      liveSearchTimer = setTimeout(() => {
        ProvidersPage.loadProviders({ search: val.trim() });
      }, 250);
    };

    // Load saved favorites if customer
    if (store.isAuthenticated && store.role === 'CUSTOMER') {
      try {
        const favRes = await ApiClient.get('/favorites?limit=100');
        const list = favRes.data?.favorites || [];
        savedProviderIds = new Set(list.filter(f => f.provider?._id).map(f => f.provider._id));
      } catch (_) {}
    }

    this.loadProviders(queryParams);
  }

  static async loadProviders(queryParams = {}) {
    const container = document.getElementById('providers-list-grid');
    if (!container) return;

    try {
      const params = new URLSearchParams();
      if (queryParams.search) params.append('search', queryParams.search);
      params.append('limit', 20);

      const res = await ApiClient.get(`/providers?${params.toString()}`);
      const providers = res.data?.providers || [];

      if (providers.length === 0) {
        container.innerHTML = `<div class="col-span-3 text-center py-16 glass-panel rounded-2xl border border-slate-800 text-slate-400 text-sm">No service providers found matching your search.</div>`;
        return;
      }

      container.innerHTML = providers
        .map((p) => {
          const isSaved = savedProviderIds.has(p._id);
          return `
            <div class="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center space-x-3.5">
                    <img src="${p.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop'}" class="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-500/30" />
                    <div>
                      <h3 class="font-bold text-white text-base flex items-center">
                        ${p.name}
                        ${p.providerProfile?.isVerified ? `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 ml-1.5 inline"></i>` : ''}
                      </h3>
                      <div class="text-xs text-slate-400">${p.address?.city || 'Pakistan'} • ${p.providerProfile?.experienceYears || 5}+ yrs exp</div>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  ${RatingStars.render(p.providerProfile?.rating || 4.9, p.providerProfile?.reviewCount || 20)}
                </div>

                <p class="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  ${p.providerProfile?.bio || 'Professional service specialist registered on Servora platform.'}
                </p>

                <div class="flex flex-wrap gap-1.5 mb-4">
                  ${(p.providerProfile?.serviceAreas || ['Citywide'])
                    .slice(0, 3)
                    .map((area) => `<span class="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400">${area}</span>`)
                    .join('')}
                </div>
              </div>

              <div class="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <a href="#/providers/${p._id}" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-center text-xs font-semibold text-white transition">
                  View Profile & Services
                </a>
                <button
                  id="fav-btn-${p._id}"
                  onclick="window.toggleFavoriteProvider('${p._id}')"
                  class="p-2.5 rounded-xl transition ${isSaved ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400'}"
                  title="${isSaved ? 'Remove Favorite' : 'Save Favorite'}"
                >
                  <i data-lucide="heart" class="w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}"></i>
                </button>
              </div>
            </div>
          `;
        })
        .join('');

      if (window.lucide) window.lucide.createIcons();

      window.toggleFavoriteProvider = async (providerId) => {
        if (!store.isAuthenticated) {
          Toast.warning('Please log in to save favorite providers', 'Sign In Required');
          window.location.hash = '#/login';
          return;
        }
        try {
          const favRes = await ApiClient.post('/favorites/toggle', { providerId });
          const isFav = favRes.data?.isFavorite ?? favRes.message?.includes('added');
          const btn = document.getElementById(`fav-btn-${providerId}`);

          if (isFav) {
            savedProviderIds.add(providerId);
            if (btn) {
              btn.className = 'p-2.5 rounded-xl transition bg-rose-500/20 text-rose-400 border border-rose-500/30';
              btn.innerHTML = '<i data-lucide="heart" class="w-4 h-4 fill-rose-500 text-rose-500"></i>';
            }
          } else {
            savedProviderIds.delete(providerId);
            if (btn) {
              btn.className = 'p-2.5 rounded-xl transition bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400';
              btn.innerHTML = '<i data-lucide="heart" class="w-4 h-4"></i>';
            }
          }
          if (window.lucide) window.lucide.createIcons();
          Toast.success(favRes.message || (isFav ? 'Provider added to favorites' : 'Provider removed from favorites'));
        } catch (err) {
          Toast.error(err.message);
        }
      };
    } catch (err) {
      console.error('Providers load error:', err);
    }
  }
}
