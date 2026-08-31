import { ApiClient } from '../../api.js';

export class CustomerInvoicesPage {
  static async render(container) {
    container.innerHTML = `
      <div class="py-6 sm:py-8 px-3 sm:px-4 lg:px-8 max-w-5xl mx-auto w-full space-y-6 overflow-hidden">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Invoices</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Complete billing history with itemized invoice breakdowns and Cash on Delivery status.</p>
        </div>
        <div id="invoices-list" class="space-y-4">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-40"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-40"></div>
        </div>
      </div>
    `;

    this.loadInvoices();
  }

  static async loadInvoices() {
    const container = document.getElementById('invoices-list');
    if (!container) return;

    try {
      const res = await ApiClient.get('/invoices');
      const invoices = res.data?.invoices || [];

      if (invoices.length === 0) {
        container.innerHTML = `
          <div class="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto"><i data-lucide="receipt" class="w-6 h-6"></i></div>
            <h3 class="font-bold text-white text-base">No invoices yet</h3>
            <p class="text-xs text-slate-400">Invoices appear after your provider completes the service.</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      container.innerHTML = invoices.map((inv) => `
        <div class="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div class="text-xs font-mono font-bold text-sky-400 mb-1">Invoice #${inv.invoiceNumber}</div>
              <h3 class="text-sm font-bold text-white">${inv.booking?.service?.name || 'Service'}</h3>
              <div class="text-xs text-slate-400 mt-0.5">Provider: ${inv.provider?.name || 'Provider'} • ${new Date(inv.createdAt).toLocaleDateString()}</div>
            </div>
            <span class="px-3 py-1 rounded-lg text-xs font-extrabold uppercase ${inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}">
              ${inv.status === 'PAID' ? 'PAID' : 'PAYMENT PENDING'}
            </span>
          </div>

          <!-- Itemized Breakdown -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div class="text-slate-500 text-[10px] uppercase font-semibold mb-0.5">Service Fee</div>
              <div class="font-bold text-slate-200">Rs. ${(inv.serviceFee || 0).toLocaleString()}</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div class="text-slate-500 text-[10px] uppercase font-semibold mb-0.5">Labor Fee</div>
              <div class="font-bold text-slate-200">Rs. ${(inv.laborFee || 0).toLocaleString()}</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div class="text-slate-500 text-[10px] uppercase font-semibold mb-0.5">Parts Fee</div>
              <div class="font-bold text-slate-200">Rs. ${(inv.partsFee || 0).toLocaleString()}</div>
            </div>
            <div class="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <div class="text-sky-400 text-[10px] uppercase font-semibold mb-0.5">Total Due</div>
              <div class="font-extrabold text-sky-300 text-sm">Rs. ${inv.totalAmount?.toLocaleString()}</div>
            </div>
          </div>

          ${inv.status === 'PENDING' ? `
          <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center space-x-3">
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <i data-lucide="banknote" class="w-4 h-4"></i>
            </div>
            <div class="text-xs">
              <div class="font-bold text-amber-300">Cash on Delivery</div>
              <div class="text-slate-400 text-[11px]">Pay the service provider in cash after the service is completed.</div>
            </div>
          </div>
          ` : `
          <div class="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Cash payment of Rs. ${inv.totalAmount?.toLocaleString()} verified on ${new Date(inv.paidAt || inv.updatedAt).toLocaleDateString()}</span>
          </div>
          `}
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Invoices load error:', err);
    }
  }
}
