export class RatingStars {
  static render(rating = 0, reviewCount = null, size = 'sm') {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    const iconSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

    let html = '<div class="inline-flex items-center space-x-0.5 text-amber-400">';
    for (let i = 0; i < fullStars; i++) {
      html += `<svg class="${iconSize} fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    }
    if (hasHalf) {
      html += `<svg class="${iconSize} fill-current text-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" opacity="0.6"/></svg>`;
    }
    for (let i = 0; i < emptyStars; i++) {
      html += `<svg class="${iconSize} text-slate-700 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    }
    html += `<span class="ml-1.5 font-semibold text-slate-200 text-xs">${rating > 0 ? rating.toFixed(1) : 'New'}</span>`;
    if (reviewCount !== null) {
      html += `<span class="text-slate-400 text-xs ml-1">(${reviewCount})</span>`;
    }
    html += '</div>';
    return html;
  }

  static renderInput(initialRating = 5) {
    return `
      <div id="star-rating-selector" class="flex items-center space-x-2 text-2xl text-amber-400 cursor-pointer" data-rating="${initialRating}">
        ${[1, 2, 3, 4, 5]
          .map(
            (val) => `
          <button type="button" onclick="window.setReviewRating(${val})" class="hover:scale-125 transition transform" id="star-btn-${val}">
            ★
          </button>
        `
          )
          .join('')}
      </div>
    `;
  }
}
