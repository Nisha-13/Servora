import { ApiClient } from '../../api.js';
import { RatingStars } from '../../components/ratingStars.js';
import { store } from '../../state.js';

export class CustomerReviewsPage {
  static async render(container) {
    container.innerHTML = `
      <div class="py-6 sm:py-8 px-3 sm:px-4 lg:px-8 max-w-4xl mx-auto w-full space-y-6 overflow-hidden">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Reviews</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">All reviews you have submitted for completed service bookings.</p>
        </div>
        <div id="reviews-list" class="space-y-4">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-32"></div>
        </div>
      </div>
    `;

    try {
      const res = await ApiClient.get(`/reviews?customer=${store.user?._id || ''}`);
      const reviews = res.data?.reviews || [];
      const container = document.getElementById('reviews-list');
      if (!container) return;

      if (reviews.length === 0) {
        container.innerHTML = `
          <div class="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto"><i data-lucide="star" class="w-6 h-6"></i></div>
            <h3 class="font-bold text-white text-base">No reviews yet</h3>
            <p class="text-xs text-slate-400">After completing a paid booking, you can rate your provider here.</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      container.innerHTML = reviews.map((r) => `
        <div class="glass-card p-5 rounded-2xl border border-slate-800">
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="font-bold text-white text-sm">${r.service?.name || 'Service'}</h3>
              <div class="text-xs text-slate-400">Provider: ${r.provider?.name} • ${new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
            ${RatingStars.render(r.rating)}
          </div>
          <p class="text-xs text-slate-300 leading-relaxed mt-2">${r.comment}</p>
          ${r.providerReply?.comment ? `
            <div class="mt-3 p-3 rounded-xl bg-slate-900 border-l-2 border-sky-400 text-xs text-slate-300">
              <span class="font-bold text-sky-300">Provider Reply:</span> ${r.providerReply.comment}
            </div>
          ` : ''}
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Reviews error:', err);
    }
  }
}
