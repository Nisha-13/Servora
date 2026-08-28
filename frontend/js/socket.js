import { CONFIG } from './config.js';
import { store } from './state.js';
import { Toast } from './components/toast.js';

let socket = null;

export const initSocketClient = () => {
  if (!store.token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return;
  }

  if (socket && socket.connected) {
    return;
  }

  if (window.io) {
    socket = window.io(CONFIG.SOCKET_URL, {
      auth: { token: store.token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to real-time server with socket ID:', socket.id);
    });

    // Listen for new notifications
    socket.on('notification:new', ({ notification, unreadCount }) => {
      if (unreadCount !== undefined) {
        store.setUnreadNotificationCount(unreadCount);
      }
      Toast.info(notification.message, notification.title || 'New Notification');
      
      // Dispatch custom DOM event for active views to re-fetch
      window.dispatchEvent(new CustomEvent('servora:notification', { detail: notification }));
    });

    socket.on('notification:unread_count', ({ unreadCount }) => {
      store.setUnreadNotificationCount(unreadCount);
    });

    // Listen for booking status updates
    socket.on('booking:status_updated', (booking) => {
      Toast.success(`Booking #${booking.bookingNumber} is now ${booking.status}`, 'Booking Updated');
      window.dispatchEvent(new CustomEvent('servora:booking_updated', { detail: booking }));
    });

    socket.on('booking:new_request', (booking) => {
      Toast.info(`New booking #${booking.bookingNumber} received for ${booking.service?.name}`, 'New Booking Request');
      window.dispatchEvent(new CustomEvent('servora:booking_new', { detail: booking }));
    });

    // Listen for invoices & payments
    socket.on('invoice:new', (invoice) => {
      Toast.warning(`Final Invoice #${invoice.invoiceNumber} ready for payment: Rs. ${invoice.totalAmount.toLocaleString()}`, 'Invoice Ready');
      window.dispatchEvent(new CustomEvent('servora:invoice_new', { detail: invoice }));
    });

    socket.on('payment:received', ({ booking, invoice }) => {
      Toast.success(`Payment verified for Invoice #${invoice.invoiceNumber}! Booking completed.`, 'Payment Verified');
      window.dispatchEvent(new CustomEvent('servora:payment_received', { detail: { booking, invoice } }));
    });

    // Listen for chat messages
    socket.on('chat:message_new', (message) => {
      // If not currently on chat page, increment unread message badge
      const onChatPage = (window.location.hash || '').startsWith('#/chat');
      if (!onChatPage) {
        const current = store.state.unreadMessageCount || 0;
        store.setUnreadMessageCount(current + 1);
      }
      window.dispatchEvent(new CustomEvent('servora:chat_message', { detail: message }));
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
    });
  }
};

export const getSocket = () => socket;
export const getSocketClient = () => socket;
export { socket as socketClient };

export const joinChatRoom = (conversationId) => {
  if (socket && socket.connected) {
    socket.emit('chat:join_room', conversationId);
  }
};

export const leaveChatRoom = (conversationId) => {
  if (socket && socket.connected) {
    socket.emit('chat:leave_room', conversationId);
  }
};
