import { store } from '../state.js';

export class Footer {
  static render() {
    const container = document.getElementById('footer-container');
    if (!container) return;

    const user = store.user;
    const isProvider = user?.role === 'PROVIDER';
    const providerLink = isProvider
      ? `<li><a href="#/provider/dashboard" class="hover:text-emerald-400 text-emerald-300 font-semibold transition">Provider Dashboard →</a></li>`
      : `<li><a href="#/register" class="hover:text-sky-400 transition">Join as Service Provider</a></li>`;

    container.innerHTML = `
      <div class="border-t border-slate-900 bg-slate-950/90 text-slate-400 py-12 px-4 lg:px-8 mt-16">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                S
              </div>
              <span class="text-lg font-bold text-white tracking-tight">Serv<span class="text-sky-400">ora</span></span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed mb-4">
              The premier marketplace connecting verified home & professional service experts with home owners and businesses.
            </p>
            <div class="text-xs text-slate-500">
              Enterprise Grade • Real-time Tracking • Cash on Delivery
            </div>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-white mb-4">Popular Categories</h4>
            <ul class="space-y-2 text-xs">
              <li><a href="#/services?category=ac-repair" class="hover:text-sky-400 transition">AC Repair & Maintenance</a></li>
              <li><a href="#/services?category=electrical" class="hover:text-sky-400 transition">Electrical & Wiring</a></li>
              <li><a href="#/services?category=car-detailing" class="hover:text-sky-400 transition">Car Detailing & Spa</a></li>
              <li><a href="#/services?category=laptop-repair" class="hover:text-sky-400 transition">Laptop & Hardware Repair</a></li>
              <li><a href="#/services?category=cctv-installation" class="hover:text-sky-400 transition">CCTV Security Systems</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul class="space-y-2 text-xs">
              <li><a href="#/services" class="hover:text-sky-400 transition">All Services Catalog</a></li>
              <li><a href="#/providers" class="hover:text-sky-400 transition">Verified Provider Directory</a></li>
              ${providerLink}
              <li><a href="#/about" class="hover:text-sky-400 transition">About Servora</a></li>
              <li><a href="#/contact" class="hover:text-sky-400 transition">Support & Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-white mb-4">Security & Verification</h4>
            <p class="text-xs leading-relaxed mb-3">
              All bookings follow a transparent lifecycle with itemized invoicing and Cash on Delivery settlement.
            </p>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <i data-lucide="shield-check" class="w-4 h-4"></i>
              </div>
              <div>
                <div class="text-xs font-semibold text-white">Cash on Delivery</div>
                <div class="text-[10px] text-slate-400">Verified on-site settlement</div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <div>© 2026 Servora Inc. All rights reserved. Built for production excellence.</div>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <a href="#/privacy" class="hover:text-slate-300 transition">Privacy Policy</a>
            <a href="#/terms" class="hover:text-slate-300 transition">Terms of Service</a>
            <a href="#/security" class="hover:text-slate-300 transition">Security Guidelines</a>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }
}
