export class Modal {
  static open({ title, content, maxWidth = 'max-w-lg', onClose = null }) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    window._modalCloseCallback = onClose;

    container.innerHTML = `
      <div id="modal-backdrop" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onclick="if(event.target.id==='modal-backdrop') window.Modal.close()">
        <div class="glass-panel w-full ${maxWidth} rounded-2xl shadow-2xl overflow-hidden border border-slate-700/60 transition-all transform animate-fade-in my-8 max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
            <h3 class="text-lg font-bold text-white tracking-tight">${title}</h3>
            <button onclick="window.Modal.close()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-grow text-slate-200">
            ${content}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.body.style.overflow = 'hidden';
  }

  static close() {
    const container = document.getElementById('modal-container');
    if (container) {
      container.innerHTML = '';
    }
    document.body.style.overflow = '';
    if (typeof window._modalCloseCallback === 'function') {
      window._modalCloseCallback();
      window._modalCloseCallback = null;
    }
  }
}

window.Modal = Modal;
