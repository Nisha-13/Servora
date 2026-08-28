import { ApiClient } from '../../api.js';
import { Toast } from '../../components/toast.js';
import { store } from '../../state.js';

export class NotificationsPage {
  static async render(container) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-3xl mx-auto w-full space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Notifications</h1>
            <p class="text-xs text-slate-400 mt-1">All platform alerts, booking updates, and system messages.</p>
          </div>
          <button onclick="window.markAllRead()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center space-x-2">
            <i data-lucide="check-check" class="w-3.5 h-3.5"></i>
            <span>Mark All Read</span>
          </button>
        </div>

        <div id="notifications-list" class="space-y-3">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-20"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-20"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-20"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Reset notification badge immediately when entering the page;
    // the real count comes back once loadNotifications resolves.
    this.loadNotifications();
  }

  static getNotifLink(n) {
    const role = store.role;
    const bookingId = n.data?.bookingId;
    const invoiceId = n.data?.invoiceId;

    if (n.type === 'NEW_MESSAGE') return '#/chat';
    if (invoiceId) {
      return role === 'CUSTOMER' ? `#/customer/invoices?id=${invoiceId}` : `#/provider/bookings`;
    }
    if (bookingId) {
      return role === 'CUSTOMER' ? `#/customer/bookings?id=${bookingId}` : `#/provider/bookings`;
    }
    return null;
  }

  static async loadNotifications() {
    const listContainer = document.getElementById('notifications-list');
    if (!listContainer) return;

    try {
      const res = await ApiClient.get('/notifications?limit=50');
      const notifications = res.data?.notifications || [];
      const unreadCount = res.data?.unreadCount ?? 0;

      // Always sync the store so the navbar badge stays accurate
      store.setUnreadNotificationCount(unreadCount);

      if (notifications.length === 0) {
        listContainer.innerHTML = `
          <div class="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto">
              <i data-lucide="bell" class="w-6 h-6"></i>
            </div>
            <h3 class="font-bold text-white text-base">No notifications yet</h3>
            <p class="text-xs text-slate-400">Booking updates, payment receipts, and messages will appear here.</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      listContainer.innerHTML = notifications.map((n) => {
        const iconMap = {
          BOOKING_CREATED: { icon: 'calendar-plus', color: 'sky' },
          BOOKING_ACCEPTED: { icon: 'check-circle', color: 'blue' },
          BOOKING_REJECTED: { icon: 'x-circle', color: 'rose' },
          BOOKING_IN_PROGRESS: { icon: 'play-circle', color: 'indigo' },
          BOOKING_COMPLETED: { icon: 'check-circle-2', color: 'purple' },
          INVOICE_CREATED: { icon: 'file-text', color: 'amber' },
          PAYMENT_RECEIVED: { icon: 'credit-card', color: 'emerald' },
          REVIEW_RECEIVED: { icon: 'star', color: 'amber' },
          NEW_MESSAGE: { icon: 'message-square', color: 'sky' },
          BOOKING_CANCELLED: { icon: 'calendar-x', color: 'rose' },
          PAYMENT_REMINDER: { icon: 'clock', color: 'amber' }
        };

        const typeInfo = iconMap[n.type] || { icon: 'bell', color: 'slate' };
        const link = NotificationsPage.getNotifLink(n);

        return `
          <div class="glass-card p-4 rounded-2xl border ${n.isRead ? 'border-slate-900/40 opacity-60' : 'border-sky-500/20 bg-sky-500/5'} flex items-start space-x-4 group">
            <div class="w-10 h-10 rounded-xl bg-${typeInfo.color}-500/20 text-${typeInfo.color}-400 flex items-center justify-center shrink-0 mt-0.5">
              <i data-lucide="${typeInfo.icon}" class="w-5 h-5"></i>
            </div>
            <div class="flex-grow min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    ${!n.isRead ? '<span class="w-2 h-2 rounded-full bg-sky-500 inline-block shrink-0"></span>' : ''}
                    <h4 class="text-xs font-bold text-white">${n.title || n.type.replace(/_/g, ' ')}</h4>
                  </div>
                  <p class="text-[11px] text-slate-300 mt-0.5 leading-relaxed">${n.message}</p>
                  ${link ? `
                    <a href="${link}" class="text-[11px] text-sky-400 hover:text-sky-300 font-semibold mt-1.5 inline-flex items-center space-x-1"
                      onclick="!${n.isRead} && window.markOneRead('${n._id}')">
                      <span>View Details</span>
                      <i data-lucide="arrow-right" class="w-3 h-3"></i>
                    </a>
                  ` : ''}
                </div>
                <div class="flex flex-col items-end space-y-2 shrink-0">
                  <span class="text-[10px] text-slate-500 whitespace-nowrap">${new Date(n.createdAt).toLocaleString()}</span>
                  ${!n.isRead ? `
                    <button onclick="window.markOneRead('${n._id}')" 
                      class="text-[10px] text-sky-400 hover:text-sky-300 font-semibold transition opacity-0 group-hover:opacity-100"
                      title="Mark as read">
                      Mark Read
                    </button>
                  ` : '<span class="text-[10px] text-slate-600">Read</span>'}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide) window.lucide.createIcons();

      window.markOneRead = async (notifId) => {
        try {
          await ApiClient.patch(`/notifications/${notifId}/read`);
          // Decrement via store so navbar re-renders automatically
          const current = store.state.unreadNotificationCount || 0;
          store.setUnreadNotificationCount(Math.max(0, current - 1));
          NotificationsPage.loadNotifications();
        } catch (err) {
          Toast.error(err.message);
        }
      };

      window.markAllRead = async () => {
        try {
          await ApiClient.patch('/notifications/read-all');
          // Zero out via store so navbar badge clears immediately
          store.setUnreadNotificationCount(0);
          Toast.success('All notifications marked as read');
          NotificationsPage.loadNotifications();
        } catch (err) {
          Toast.error(err.message || 'Failed to mark notifications');
        }
      };

    } catch (err) {
      console.error('Notifications error:', err);
    }
  }
}
