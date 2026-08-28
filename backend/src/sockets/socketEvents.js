export const SOCKET_EVENTS = Object.freeze({
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_UNREAD_COUNT: 'notification:unread_count',

  // Booking updates
  BOOKING_STATUS_UPDATED: 'booking:status_updated',
  BOOKING_NEW_REQUEST: 'booking:new_request',

  // Invoices & Payments
  INVOICE_NEW: 'invoice:new',
  PAYMENT_RECEIVED: 'payment:received',

  // Chat
  CHAT_JOIN_ROOM: 'chat:join_room',
  CHAT_LEAVE_ROOM: 'chat:leave_room',
  CHAT_MESSAGE_SEND: 'chat:message_send',
  CHAT_MESSAGE_NEW: 'chat:message_new',
  CHAT_TYPING_START: 'chat:typing_start',
  CHAT_TYPING_STOP: 'chat:typing_stop',
  CHAT_MESSAGES_READ: 'chat:messages_read'
});
