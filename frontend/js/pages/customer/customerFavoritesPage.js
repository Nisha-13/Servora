import { ApiClient } from '../../api.js';
import { RatingStars } from '../../components/ratingStars.js';
import { Toast } from '../../components/toast.js';

export class CustomerFavoritesPage {
  static _activeTab = 'services'; // 'services' | 'providers'
  static _favorites = [];

  static async render(container) {
    container.innerHTML = `
      <div class="py-6 sm:py-8 px-3 sm:px-4 lg:px-8 max-w-6xl mx-auto w-full space-y-6 overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Saved & Favorites</h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">Your saved services and trusted professionals for quick access.</p>
          </div>

          <!-- Tab Selector -->
          <div class="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 self-start max-w-full overflow-x-auto">
            <button
              id="tab-services-btn"
              onclick="window.switchFavTab('services')"
              class="px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${CustomerFavoritesPage._activeTab === 'services' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
            >
              Saved Services
            </button>
            <button
              id="tab-providers-btn"
              onclick="window.switchFavTab('providers')"
              class="px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${CustomerFavoritesPage._activeTab === 'providers' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
            >
              Saved Providers
            </button>
          </div>
        </div>

        <div id="favorites-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-52"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-52"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-52"></div>
        </div>
      </div>
    `;

    window.switchFavTab = (tab) => {
      CustomerFavoritesPage._activeTab = tab;
      const sBtn = document.getElementById('tab-services-btn');
      const pBtn = document.getElementById('tab-providers-btn');
      if (sBtn && pBtn) {
        if (tab === 'services') {
          sBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold transition bg-sky-500 text-white shadow-md';
          pBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold transition text-slate-400 hover:text-white';
        } else {
          pBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold transition bg-sky-500 text-white shadow-md';
          sBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold transition text-slate-400 hover:text-white';
        }
      }
      CustomerFavoritesPage.renderTabContent();
    };

    window.removeFavorite = async (favId, itemTitle = 'Item') => {
      try {
        await ApiClient.delete(`/favorites/${favId}`);
        Toast.success(`Removed "${itemTitle}" from saved list`);
        CustomerFavoritesPage._favorites = CustomerFavoritesPage._favorites.filter(f => f._id !== favId);
        CustomerFavoritesPage.renderTabContent();
      } catch (err) {
        Toast.error(err.message || 'Failed to remove favorite');
      }
    };

    this.loadFavorites();
  }

  static async loadFavorites() {
    const container = document.getElementById('favorites-grid');
    if (!container) return;

    try {
      const res = await ApiClient.get('/favorites?limit=100');
      CustomerFavoritesPage._favorites = res.data?.favorites || [];

      // Update store saved count
      const serviceCount = CustomerFavoritesPage._favorites.filter(f => (f.itemType === 'SERVICE' || f.service) && f.service).length;
      store.setSavedServicesCount(serviceCount);
      if (window.refreshSavedServicesCount) window.refreshSavedServicesCount();

      // If no services but have providers, switch default tab
      const hasServices = CustomerFavoritesPage._favorites.some(f => f.itemType === 'SERVICE' || f.service);
      const hasProviders = CustomerFavoritesPage._favorites.some(f => f.itemType === 'PROVIDER' || f.provider);
      if (!hasServices && hasProviders) {
        CustomerFavoritesPage._activeTab = 'providers';
        const sBtn = document.getElementById('tab-services-btn');
        const pBtn = document.getElementById('tab-providers-btn');
        if (sBtn && pBtn) {
          pBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold transition bg-sky-500 text-white shadow-md';
          sBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold transition text-slate-400 hover:text-white';
        }
      }

      CustomerFavoritesPage.renderTabContent();
    } catch (err) {
      console.error('Favorites error:', err);
    }
  }

  static renderTabContent() {
    const container = document.getElementById('favorites-grid');
    if (!container) return;

    const tab = CustomerFavoritesPage._activeTab;
    const all = CustomerFavoritesPage._favorites;

    if (tab === 'services') {
      const services = all.filter(f => (f.itemType === 'SERVICE' || f.service) && f.service);

      if (services.length === 0) {
        container.innerHTML = `
          <div class="col-span-3 glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto"><i data-lucide="wrench" class="w-6 h-6"></i></div>
            <h3 class="font-bold text-white text-base">No saved services yet</h3>
            <p class="text-xs text-slate-400">Browse service listings and click the heart icon to save services for fast booking.</p>
            <a href="#/services" class="inline-block px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-xs shadow-md">Explore Services</a>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      container.innerHTML = services.map((fav) => {
        const s = fav.service || {};
        return `
          <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between group">
            <div>
              <div class="relative h-40 overflow-hidden bg-slate-900">
                <img src="${s.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-[11px] font-bold text-sky-300 border border-slate-700/50">
                  ${s.category?.name || 'Service'}
                </div>
                <button onclick="window.removeFavorite('${fav._id}', '${(s.name || '').replace(/'/g, "\\'")}')" class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-rose-400 hover:bg-rose-500/20 transition text-xs" title="Remove from saved">
                  <i data-lucide="x" class="w-4 h-4"></i>
                </button>
              </div>
              <div class="p-5">
                <div class="flex items-center justify-between mb-2">
                  ${RatingStars.render(s.rating || 5, s.reviewCount || 10)}
                  <span class="text-[11px] text-slate-400 flex items-center"><i data-lucide="clock" class="w-3 h-3 mr-1"></i>${s.estimatedDuration || '1-2 hrs'}</span>
                </div>
                <h3 class="font-bold text-white text-sm mb-1.5 line-clamp-1">${s.name}</h3>
                <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">${s.description || 'Professional home and commercial service.'}</p>
                <div class="flex items-center space-x-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  <img src="${s.provider?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}" class="w-5 h-5 rounded-full object-cover" />
                  <span class="font-medium truncate">${s.provider?.name || 'Verified Pro'}</span>
                </div>
              </div>
            </div>
            <div class="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-900">
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-semibold">Starting Price</span>
                <div class="text-sm font-extrabold text-sky-400">Rs. ${(s.startingPrice || 0).toLocaleString()}</div>
              </div>
              <a href="#/services/${s._id}" class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition">
                Book Now
              </a>
            </div>
          </div>
        `;
      }).join('');

    } else {
      const providers = all.filter(f => (f.itemType === 'PROVIDER' || f.provider) && f.provider);

      if (providers.length === 0) {
        container.innerHTML = `
          <div class="col-span-3 glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto"><i data-lucide="heart" class="w-6 h-6"></i></div>
            <h3 class="font-bold text-white text-base">No saved providers yet</h3>
            <p class="text-xs text-slate-400">Browse provider profiles and click the heart icon to save them here for quick re-booking.</p>
            <a href="#/providers" class="inline-block px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-xs shadow-md">Find Providers</a>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      container.innerHTML = providers.map((fav) => {
        const p = fav.provider || {};
        return `
          <div class="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <img src="${p.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}" class="w-12 h-12 rounded-xl object-cover ring-2 ring-sky-500/30" />
                  <div>
                    <h3 class="font-bold text-white text-sm">${p.name}</h3>
                    <div class="text-[11px] text-slate-400">${p.address?.city || 'Pakistan'}</div>
                  </div>
                </div>
                <button onclick="window.removeFavorite('${fav._id}', '${(p.name || '').replace(/'/g, "\\'")}')" class="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-[11px]" title="Remove from favorites">
                  <i data-lucide="x" class="w-4 h-4"></i>
                </button>
              </div>
              ${RatingStars.render(p.providerProfile?.rating || 4.9, p.providerProfile?.reviewCount || 10)}
              <p class="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">${p.providerProfile?.bio || 'Trusted professional on Servora.'}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-800 flex space-x-2">
              <a href="#/providers/${p._id}" class="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-center text-xs font-semibold text-white transition">View Profile</a>
              <a href="#/services?provider=${p._id}" class="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-center text-xs font-semibold text-white transition">Book Service</a>
            </div>
          </div>
        `;
      }).join('');
    }

    if (window.lucide) window.lucide.createIcons();
  }
}
