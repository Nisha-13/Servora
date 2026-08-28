export class Toast {
  static show({ title, message, type = 'info', duration = 4500 }) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `pointer-events-auto flex items-start space-x-3 p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-x-10 opacity-0 ${
      type === 'success'
        ? 'bg-slate-900/95 border-emerald-500/30 text-emerald-300'
        : type === 'error'
        ? 'bg-slate-900/95 border-rose-500/30 text-rose-300'
        : type === 'warning'
        ? 'bg-slate-900/95 border-amber-500/30 text-amber-300'
        : 'bg-slate-900/95 border-blue-500/30 text-blue-300'
    }`;

    const iconHtml =
      type === 'success'
        ? `<div class="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0"><i data-lucide="check-circle" class="w-5 h-5"></i></div>`
        : type === 'error'
        ? `<div class="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0"><i data-lucide="alert-circle" class="w-5 h-5"></i></div>`
        : type === 'warning'
        ? `<div class="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0"><i data-lucide="alert-triangle" class="w-5 h-5"></i></div>`
        : `<div class="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0"><i data-lucide="bell" class="w-5 h-5"></i></div>`;

    toast.innerHTML = `
      ${iconHtml}
      <div class="flex-grow pr-2">
        <h4 class="font-semibold text-sm text-white">${title || (type.charAt(0).toUpperCase() + type.slice(1))}</h4>
        <p class="text-xs text-slate-300 mt-0.5 leading-relaxed">${message}</p>
      </div>
      <button onclick="document.getElementById('${toastId}').remove()" class="text-slate-500 hover:text-white p-1 transition">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-10', 'opacity-0');
      toast.classList.add('translate-x-0', 'opacity-100');
    });

    // Auto dismiss
    setTimeout(() => {
      if (document.getElementById(toastId)) {
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  static success(message, title = 'Success') {
    this.show({ title, message, type: 'success' });
  }

  static error(message, title = 'Error') {
    this.show({ title, message, type: 'error' });
  }

  static warning(message, title = 'Warning') {
    this.show({ title, message, type: 'warning' });
  }

  static info(message, title = 'Notification') {
    this.show({ title, message, type: 'info' });
  }
}
