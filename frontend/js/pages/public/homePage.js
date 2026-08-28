import { ApiClient } from '../../api.js';
import { RatingStars } from '../../components/ratingStars.js';

export class HomePage {
  static async render(container) {
    container.innerHTML = `
      <!-- Hero Section -->
      <section class="relative overflow-hidden pt-12 pb-20 px-4 lg:px-8 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent pointer-events-none"></div>
        <div class="max-w-6xl mx-auto text-center relative z-10">
          <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6">
            <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span>Over 2,500+ Verified Service Experts Near You</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
            Book Trusted Local Professionals <br class="hidden sm:inline" />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">On-Demand & In Real-Time</span>
          </h1>

          <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            From expert AC repairs to automotive detailing, electronics, and home renovations. Track service on-site, receive itemized invoices, and settle securely with Cash on Delivery.
          </p>

          <!-- Search Box -->
          <div class="glass-panel p-2.5 rounded-2xl max-w-3xl mx-auto shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-slate-700/60">
            <div class="flex items-center space-x-3 px-4 py-2.5 flex-grow w-full">
              <i data-lucide="search" class="w-5 h-5 text-slate-400 shrink-0"></i>
              <input
                id="hero-search-input"
                type="text"
                placeholder="What service do you need? (e.g. AC Repair, Detailing, CCTV...)"
                class="bg-transparent border-none text-sm text-white placeholder-slate-400 focus:outline-none w-full"
                onkeypress="if(event.key==='Enter') window.handleHeroSearch()"
              />
            </div>
            <button
              onclick="window.handleHeroSearch()"
              class="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition transform active:scale-95 shrink-0"
            >
              Search Services
            </button>
          </div>

          <!-- Trust Badges -->
          <div class="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-10 text-xs text-slate-400">
            <div class="flex items-center space-x-2">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
              <span>100% Background Checked</span>
            </div>
            <div class="flex items-center space-x-2">
              <i data-lucide="clock" class="w-4 h-4 text-sky-400"></i>
              <span>Live Real-Time Tracking</span>
            </div>
            <div class="flex items-center space-x-2">
              <i data-lucide="credit-card" class="w-4 h-4 text-indigo-400"></i>
              <span>Transparent Itemized Invoices</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="py-16 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div class="flex items-end justify-between mb-8">
          <div>
            <div class="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Browse Marketplace</div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Popular Service Categories</h2>
          </div>
          <a href="#/services" class="text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1">
            <span>View All (28+)</span>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </a>
        </div>

        <div id="home-categories-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>
        </div>
      </section>

      <!-- Featured Services Section -->
      <section class="py-16 px-4 lg:px-8 bg-slate-900/30 border-y border-slate-900">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-end justify-between mb-8">
            <div>
              <div class="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Top Rated Services</div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Featured Professional Services</h2>
            </div>
            <a href="#/services" class="text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1">
              <span>Explore Catalog</span>
              <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </a>
          </div>

          <div id="home-featured-services" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="animate-pulse bg-slate-900/60 rounded-2xl h-64"></div>
            <div class="animate-pulse bg-slate-900/60 rounded-2xl h-64"></div>
            <div class="animate-pulse bg-slate-900/60 rounded-2xl h-64"></div>
          </div>
        </div>
      </section>

      <!-- Top Providers Section -->
      <section class="py-16 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div class="flex items-end justify-between mb-8">
          <div>
            <div class="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Expert Professionals</div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Top-Rated Verified Providers</h2>
          </div>
          <a href="#/providers" class="text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1">
            <span>Find More Providers</span>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </a>
        </div>

        <div id="home-top-providers" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-56"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-56"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-56"></div>
        </div>
      </section>

      <!-- Transparent Lifecycle Infographic -->
      <section class="py-16 px-4 lg:px-8 bg-slate-900/40 border-t border-slate-900">
        <div class="max-w-7xl mx-auto text-center">
          <div class="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">How It Works</div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white mb-12">Streamlined 5-Step Service Lifecycle</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="glass-card p-5 rounded-2xl text-left border border-slate-800">
              <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm mb-3">1</div>
              <h3 class="font-bold text-white text-sm mb-1">Book Service</h3>
              <p class="text-xs text-slate-400">Select date, time slot, and address with transparent starting price.</p>
            </div>
            <div class="glass-card p-5 rounded-2xl text-left border border-slate-800">
              <div class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm mb-3">2</div>
              <h3 class="font-bold text-white text-sm mb-1">Provider Accepts</h3>
              <p class="text-xs text-slate-400">Verified provider confirms booking with live status notification.</p>
            </div>
            <div class="glass-card p-5 rounded-2xl text-left border border-slate-800">
              <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">3</div>
              <h3 class="font-bold text-white text-sm mb-1">Work Done On-Site</h3>
              <p class="text-xs text-slate-400">Provider arrives, diagnoses issue, and executes quality service.</p>
            </div>
            <div class="glass-card p-5 rounded-2xl text-left border border-slate-800">
              <div class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-3">4</div>
              <h3 class="font-bold text-white text-sm mb-1">Itemized Invoice</h3>
              <p class="text-xs text-slate-400">Review clear breakdown of service, labor, and spare parts before paying.</p>
            </div>
            <div class="glass-card p-5 rounded-2xl text-left border border-slate-800">
              <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">5</div>
              <h3 class="font-bold text-white text-sm mb-1">Cash & Review</h3>
              <p class="text-xs text-slate-400">Pay cash upon completion, receive provider confirmation, and rate your service.</p>
            </div>
          </div>
        </div>
      </section>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Global helper for search
    window.handleHeroSearch = () => {
      const query = document.getElementById('hero-search-input')?.value || '';
      window.location.hash = `#/services?search=${encodeURIComponent(query)}`;
    };

    // Fetch dynamic categories and featured services
    this.loadData();
  }

  static async loadData() {
    try {
      const [catsRes, servsRes, provsRes] = await Promise.all([
        ApiClient.get('/categories'),
        ApiClient.get('/services?limit=6'),
        ApiClient.get('/providers?limit=3')
      ]);

      // Render Categories
      const categoriesGrid = document.getElementById('home-categories-grid');
      if (categoriesGrid && catsRes.data?.categories) {
        const categories = catsRes.data.categories.slice(0, 12);
        categoriesGrid.innerHTML = categories
          .map(
            (cat) => `
          <a href="#/services?category=${cat._id}" class="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center group border border-slate-800/80 hover:border-sky-500/40 transition">
            <div class="w-12 h-12 rounded-xl bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2.5 transition">
              <i data-lucide="${cat.icon || 'tool'}" class="w-6 h-6"></i>
            </div>
            <span class="text-xs font-semibold text-slate-200 group-hover:text-white">${cat.name}</span>
            <span class="text-[10px] text-slate-400 mt-0.5">${cat.group}</span>
          </a>
        `
          )
          .join('');
      }

      // Render Featured Services
      const servicesContainer = document.getElementById('home-featured-services');
      if (servicesContainer && servsRes.data?.services) {
        const services = servsRes.data.services;
        servicesContainer.innerHTML = services
          .map(
            (s) => `
          <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
            <div>
              <div class="relative h-44 overflow-hidden bg-slate-900">
                <img src="${s.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-sky-300 border border-slate-700/50">
                  ${s.category?.name || 'Service'}
                </div>
              </div>
              <div class="p-5">
                <div class="flex items-center justify-between mb-2">
                  ${RatingStars.render(s.rating || 5, s.reviewCount || 10)}
                  <span class="text-[11px] text-slate-400 flex items-center"><i data-lucide="clock" class="w-3 h-3 mr-1"></i>${s.estimatedDuration}</span>
                </div>
                <h3 class="font-bold text-white text-base mb-1.5 line-clamp-1">${s.name}</h3>
                <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">${s.description}</p>
                <div class="flex items-center space-x-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  <img src="${s.provider?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}" class="w-5 h-5 rounded-full object-cover" />
                  <span class="font-medium">${s.provider?.name || 'Verified Pro'}</span>
                </div>
              </div>
            </div>
            <div class="px-5 pb-5 pt-2 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-semibold">Starting Price</span>
                <div class="text-base font-extrabold text-sky-400">Rs. ${s.startingPrice.toLocaleString()}</div>
              </div>
              <a href="#/services/${s._id}" class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition">
                Book Now
              </a>
            </div>
          </div>
        `
          )
          .join('');
      }

      // Render Providers
      const providersContainer = document.getElementById('home-top-providers');
      if (providersContainer && provsRes.data?.providers) {
        const providers = provsRes.data.providers;
        providersContainer.innerHTML = providers
          .map(
            (p) => `
          <div class="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <img src="${p.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop'}" class="w-12 h-12 rounded-xl object-cover ring-2 ring-sky-500/30" />
                  <div>
                    <h3 class="font-bold text-white text-sm flex items-center">
                      ${p.name}
                      ${p.providerProfile?.isVerified ? `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 ml-1.5 inline"></i>` : ''}
                    </h3>
                    <div class="text-xs text-slate-400">${p.address?.city || 'Pakistan'} • ${p.providerProfile?.experienceYears || 5}+ yrs exp</div>
                  </div>
                </div>
              </div>
              ${RatingStars.render(p.providerProfile?.rating || 4.9, p.providerProfile?.reviewCount || 20)}
              <p class="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">${p.providerProfile?.bio || 'Verified service professional on Servora.'}</p>
            </div>
            <div class="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span class="text-xs text-emerald-400 font-medium flex items-center"><span class="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 inline-block"></span>Available</span>
              <a href="#/providers/${p._id}" class="text-xs font-semibold text-sky-400 hover:text-sky-300">View Profile →</a>
            </div>
          </div>
        `
          )
          .join('');
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Home Page data load failed:', err);
    }
  }
}
