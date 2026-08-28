import { ApiClient } from '../../api.js';
import { RatingStars } from '../../components/ratingStars.js';
import { store } from '../../state.js';
import { Toast } from '../../components/toast.js';

export class ServicesPage {
  static _debounceTimer = null;
  static _savedServiceIds = new Set();

  static async render(container, queryParams = {}) {
    const search = queryParams.search || '';
    const selectedCategory = queryParams.category || '';
    const minRating = queryParams.rating || '';
    const minPrice = queryParams.minPrice || '';
    const maxPrice = queryParams.maxPrice || '';
    const sortBy = queryParams.sortBy || 'createdAt';
    const sortOrder = queryParams.sortOrder || 'desc';
    const currentSort = `${sortBy}-${sortOrder}`;

    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Explore Services</h1>
          <p class="text-sm text-slate-400 mt-1">Browse, search, and instantly book top-rated verified professionals in your city.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar Filters -->
          <div class="lg:col-span-1">
            <div class="glass-panel p-5 rounded-2xl border border-slate-800 sticky top-20 space-y-6">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 class="font-bold text-white text-sm flex items-center">
                  <i data-lucide="sliders-horizontal" class="w-4 h-4 mr-2 text-sky-400"></i> Filters
                </h3>
                <button onclick="window.resetServiceFilters()" class="text-xs text-slate-400 hover:text-sky-400 transition">Reset</button>
              </div>

              <!-- Search (Live debounced) -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Keyword Search</label>
                <div class="relative">
                  <input
                    id="filter-search"
                    type="text"
                    value="${search}"
                    placeholder="e.g. AC Repair, Detailing..."
                    class="glass-input w-full px-3 py-2 rounded-xl text-xs pl-8"
                    oninput="window.debounceLiveFilter()"
                  />
                  <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"></i>
                </div>
              </div>

              <!-- Category -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                <select id="filter-category" onchange="window.debounceLiveFilter()" class="glass-input w-full px-3 py-2 rounded-xl text-xs">
                  <option value="">All Categories</option>
                </select>
              </div>

              <!-- Minimum Rating -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Minimum Rating</label>
                <select id="filter-rating" onchange="window.debounceLiveFilter()" class="glass-input w-full px-3 py-2 rounded-xl text-xs">
                  <option value="" ${!minRating ? 'selected' : ''}>Any Rating</option>
                  <option value="4.5" ${minRating === '4.5' ? 'selected' : ''}>4.5+ Stars ★★★★★</option>
                  <option value="4.0" ${minRating === '4.0' ? 'selected' : ''}>4.0+ Stars ★★★★☆</option>
                  <option value="3.0" ${minRating === '3.0' ? 'selected' : ''}>3.0+ Stars ★★★☆☆</option>
                </select>
              </div>

              <!-- Price Filter -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Price Range (Rs.)</label>
                <div class="grid grid-cols-2 gap-2">
                  <input id="filter-min-price" type="number" value="${minPrice}" placeholder="Min" oninput="window.debounceLiveFilter()" class="glass-input px-2.5 py-1.5 rounded-lg text-xs" />
                  <input id="filter-max-price" type="number" value="${maxPrice}" placeholder="Max" oninput="window.debounceLiveFilter()" class="glass-input px-2.5 py-1.5 rounded-lg text-xs" />
                </div>
              </div>

              <button
                onclick="window.applyServiceFilters()"
                class="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-md shadow-sky-500/20 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>

          <!-- Services Grid & Sorting -->
          <div class="lg:col-span-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              <div id="services-count-text" class="text-xs font-medium text-slate-400">Loading catalog...</div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-slate-400">Sort by:</span>
                <select id="sort-services" onchange="window.applyServiceFilters()" class="glass-input px-3 py-1.5 rounded-lg text-xs">
                  <option value="createdAt-desc" ${currentSort === 'createdAt-desc' ? 'selected' : ''}>Newest First</option>
                  <option value="startingPrice-asc" ${currentSort === 'startingPrice-asc' ? 'selected' : ''}>Price: Low to High</option>
                  <option value="startingPrice-desc" ${currentSort === 'startingPrice-desc' ? 'selected' : ''}>Price: High to Low</option>
                  <option value="rating-desc" ${currentSort === 'rating-desc' ? 'selected' : ''}>Highest Rated</option>
                </select>
              </div>
            </div>

            <!-- Service Cards Grid -->
            <div id="services-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${Array(6).fill('<div class="animate-pulse bg-slate-900/60 rounded-2xl h-64"></div>').join('')}
            </div>

            <!-- Pagination -->
            <div id="services-pagination" class="flex justify-center items-center space-x-2 mt-10"></div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Live Debounced Filter Function
    window.debounceLiveFilter = () => {
      clearTimeout(ServicesPage._debounceTimer);
      ServicesPage._debounceTimer = setTimeout(() => {
        window.applyServiceFilters();
      }, 350);
    };

    window.applyServiceFilters = () => {
      const s = document.getElementById('filter-search')?.value || '';
      const c = document.getElementById('filter-category')?.value || '';
      const r = document.getElementById('filter-rating')?.value || '';
      const minP = document.getElementById('filter-min-price')?.value || '';
      const maxP = document.getElementById('filter-max-price')?.value || '';
      const sortVal = document.getElementById('sort-services')?.value || 'createdAt-desc';
      const [sortByParam, sortOrderParam] = sortVal.split('-');

      const params = new URLSearchParams();
      if (s) params.append('search', s);
      if (c) params.append('category', c);
      if (r) params.append('rating', r);
      if (minP) params.append('minPrice', minP);
      if (maxP) params.append('maxPrice', maxP);
      if (sortByParam) params.append('sortBy', sortByParam);
      if (sortOrderParam) params.append('sortOrder', sortOrderParam);

      window.location.hash = `#/services?${params.toString()}`;
    };

    window.resetServiceFilters = () => {
      window.location.hash = '#/services';
    };

    // Load saved favorites if customer
    if (store.isAuthenticated && store.role === 'CUSTOMER') {
      try {
        const favRes = await ApiClient.get('/favorites?limit=100');
        const list = favRes.data?.favorites || [];
        ServicesPage._savedServiceIds = new Set(
          list.filter((f) => f.service?._id).map((f) => f.service._id)
        );
      } catch (_) {}
    } else {
      ServicesPage._savedServiceIds = new Set();
    }

    window.toggleServiceFavorite = async (serviceId) => {
      if (!store.isAuthenticated) {
        Toast.warning('Please login to save favorite services.', 'Sign In Required');
        window.location.hash = '#/login';
        return;
      }
      try {
        const res = await ApiClient.post('/favorites/toggle', { serviceId });
        const isFav = res.data?.isFavorite ?? (res.message || '').includes('added');

        // Update heart icon visually - use setAttribute for SVG compat
        const heartIcon = document.getElementById(`fav-heart-${serviceId}`);
        if (heartIcon) {
          if (isFav) {
            ServicesPage._savedServiceIds.add(serviceId);
            heartIcon.setAttribute('class', 'w-4 h-4 fill-rose-500 text-rose-500 transition');
          } else {
            ServicesPage._savedServiceIds.delete(serviceId);
            heartIcon.setAttribute('class', 'w-4 h-4 text-slate-300 transition');
          }
        }
        // Refresh navbar cart badge count
        store.setSavedServicesCount(ServicesPage._savedServiceIds.size);
        if (window.refreshSavedServicesCount) window.refreshSavedServicesCount();
        Toast.success(res.message || (isFav ? 'Service saved to favorites! ❤️' : 'Service removed from saved'));
      } catch (err) {
        Toast.error(err.message || 'Failed to update favorite');
      }
    };

    this.loadCatalog(queryParams);
  }

  static async loadCatalog(queryParams) {
    try {
      // 1. Fetch Categories for Dropdown
      const catsRes = await ApiClient.get('/categories');
      const catSelect = document.getElementById('filter-category');
      if (catSelect && catsRes.data?.categories) {
        catsRes.data.categories.forEach((cat) => {
          const opt = document.createElement('option');
          opt.value = cat._id;
          opt.textContent = `${cat.name} (${cat.group})`;
          if (queryParams.category === cat._id || queryParams.category === cat.slug) {
            opt.selected = true;
          }
          catSelect.appendChild(opt);
        });
      }

      // 2. Build Query String
      const params = new URLSearchParams();
      if (queryParams.search) params.append('search', queryParams.search);
      if (queryParams.category) params.append('category', queryParams.category);
      if (queryParams.rating) params.append('minRating', queryParams.rating);
      if (queryParams.minPrice) params.append('minPrice', queryParams.minPrice);
      if (queryParams.maxPrice) params.append('maxPrice', queryParams.maxPrice);
      if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);
      if (queryParams.sortOrder) params.append('sortOrder', queryParams.sortOrder);
      const currentPage = parseInt(queryParams.page || 1, 10);
      const pageSize = 12;
      params.append('page', currentPage);
      params.append('limit', pageSize);

      const servRes = await ApiClient.get(`/services?${params.toString()}`);
      const services = servRes.data?.services || [];
      const total = servRes.data?.total || 0;
      const totalPages = servRes.data?.pages || Math.ceil(total / pageSize) || 1;

      const countText = document.getElementById('services-count-text');
      if (countText) {
        countText.innerHTML = `Showing <span class="text-white font-bold">${services.length}</span> of <span class="text-white font-bold">${total}</span> professional services (Page ${currentPage} of ${totalPages})`;
      }

      const grid = document.getElementById('services-grid');
      const paginationContainer = document.getElementById('services-pagination');
      if (!grid) return;

      if (services.length === 0) {
        grid.className = 'col-span-3 text-center py-16 glass-panel rounded-2xl border border-slate-800';
        grid.innerHTML = `
          <div class="w-16 h-16 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <i data-lucide="search-x" class="w-8 h-8"></i>
          </div>
          <h3 class="text-base font-bold text-white mb-1">No services found matching your criteria</h3>
          <p class="text-xs text-slate-400 mb-4">Try clearing filters or searching for different keywords.</p>
          <button onclick="window.resetServiceFilters()" class="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold">Reset Filters</button>
        `;
        if (paginationContainer) paginationContainer.innerHTML = '';
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      grid.innerHTML = services
        .map((s) => {
          const isSaved = ServicesPage._savedServiceIds.has(s._id);
          return `
            <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between group">
              <div>
                <div class="relative h-44 overflow-hidden bg-slate-900">
                  <img src="${s.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'" />
                  <div class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-[11px] font-bold text-sky-300 border border-slate-700/50">
                    ${s.category?.name || 'Service'}
                  </div>
                  <button
                    onclick="window.toggleServiceFavorite('${s._id}')"
                    class="absolute top-3 left-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/50 hover:bg-slate-900 transition"
                    title="Favorite Service"
                  >
                    <i id="fav-heart-${s._id}" data-lucide="heart" class="w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-rose-400'} transition"></i>
                  </button>
                </div>
                <div class="p-5">
                  <div class="flex items-center justify-between mb-2">
                    ${RatingStars.render(s.rating || 5, s.reviewCount || 10)}
                    <span class="text-[11px] text-slate-400 flex items-center"><i data-lucide="clock" class="w-3 h-3 mr-1"></i>${s.estimatedDuration || '1-2 hrs'}</span>
                  </div>
                  <h3 class="font-bold text-white text-base mb-1.5 line-clamp-1">${s.name}</h3>
                  <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">${s.description}</p>
                  
                  <div class="flex items-center space-x-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                    <img src="${s.provider?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}" class="w-5 h-5 rounded-full object-cover" />
                    <span class="font-medium truncate">${s.provider?.name || 'Verified Pro'}</span>
                  </div>
                </div>
              </div>
              <div class="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-900">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">Starting Price</span>
                  <div class="text-base font-extrabold text-sky-400">Rs. ${(s.startingPrice || 0).toLocaleString()}</div>
                </div>
                <a href="#/services/${s._id}" class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition">
                  View & Book
                </a>
              </div>
            </div>
          `;
        })
        .join('');

      // Render Pagination Buttons
      if (paginationContainer) {
        if (totalPages <= 1) {
          paginationContainer.innerHTML = '';
        } else {
          let paginationHtml = '';

          // Prev Button
          paginationHtml += `
            <button
              onclick="window.goToServicePage(${currentPage - 1})"
              ${currentPage <= 1 ? 'disabled class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 text-xs cursor-not-allowed"' : 'class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs font-semibold"'}
            >
              ← Prev
            </button>
          `;

          // Page number buttons
          for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
              paginationHtml += `
                <button
                  onclick="window.goToServicePage(${p})"
                  class="px-3.5 py-2 rounded-xl text-xs font-bold transition ${p === currentPage ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'}"
                >
                  ${p}
                </button>
              `;
            } else if (p === currentPage - 2 || p === currentPage + 2) {
              paginationHtml += `<span class="text-slate-600 text-xs px-1">...</span>`;
            }
          }

          // Next Button
          paginationHtml += `
            <button
              onclick="window.goToServicePage(${currentPage + 1})"
              ${currentPage >= totalPages ? 'disabled class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 text-xs cursor-not-allowed"' : 'class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs font-semibold"'}
            >
              Next →
            </button>
          `;

          paginationContainer.innerHTML = paginationHtml;
        }
      }

      window.goToServicePage = (newPage) => {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        urlParams.set('page', newPage);
        window.location.hash = `#/services?${urlParams.toString()}`;
      };

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Catalog load error:', err);
    }
  }
}
