import { ApiClient } from '../../api.js';
import { store } from '../../state.js';
import { Toast } from '../../components/toast.js';
import { getSocket } from '../../socket.js';

export class ChatPage {
  static _activeConvId = null;
  static _conversations = [];
  static _messages = [];
  static _socketInitialized = false;

  static async render(container, queryParams = {}) {
    ChatPage._activeConvId = queryParams.id || null;

    container.innerHTML = `
      <div class="flex h-[calc(100vh-64px)] overflow-hidden">
        <!-- Sidebar: Conversations List -->
        <div id="chat-sidebar" class="w-full md:w-80 shrink-0 glass-panel border-r border-slate-800 flex flex-col ${ChatPage._activeConvId ? 'hidden md:flex' : 'flex'}">
          <div class="p-5 border-b border-slate-800">
            <h2 class="font-bold text-white text-base flex items-center">
              <i data-lucide="message-square" class="w-4 h-4 mr-2 text-sky-400"></i> Messages
            </h2>
          </div>

          <div id="conversations-list" class="flex-1 overflow-y-auto space-y-1 p-3">
            <div class="text-xs text-slate-400 py-6 text-center">Loading conversations...</div>
          </div>
        </div>

        <!-- Main Chat Area -->
        <div id="chat-main-area" class="flex-1 flex flex-col overflow-hidden ${!ChatPage._activeConvId ? 'hidden md:flex' : 'flex'}">
          <!-- Chat Header -->
          <div id="chat-header" class="p-4 sm:p-5 border-b border-slate-800 flex items-center space-x-3 glass-panel">
            ${ChatPage._activeConvId
              ? '<div class="text-xs text-slate-400">Loading conversation...</div>'
              : `
              <div class="text-center flex-1 py-8">
                <div class="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto mb-2">
                  <i data-lucide="message-square" class="w-6 h-6"></i>
                </div>
                <p class="text-sm text-slate-400">Select a conversation or start a new one</p>
              </div>
            `}
          </div>

          <!-- Messages Area -->
          <div id="chat-messages" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3" style="scrollbar-gutter: stable;">
            ${!ChatPage._activeConvId ? '<div class="flex items-center justify-center h-full text-xs text-slate-500">No conversation selected.</div>' : ''}
          </div>

          <!-- Message Input -->
          <div id="chat-input-area" class="${!ChatPage._activeConvId ? 'hidden' : ''} glass-panel border-t border-slate-800 p-3 sm:p-4">
            <form id="chat-form" onsubmit="window.sendChatMessage(event)" class="flex items-center space-x-2 sm:space-x-3">
              <input
                id="chat-message-input"
                type="text"
                placeholder="Type your message... (Press Enter to send)"
                class="glass-input flex-1 px-4 py-2.5 rounded-xl text-xs"
                autocomplete="off"
              />
              <button type="submit" class="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition shadow-md shadow-sky-500/20">
                <i data-lucide="send" class="w-4 h-4"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Reset unread messages badge when entering chat
    store.setUnreadMessageCount(0);

    this.loadConversations();

    if (ChatPage._activeConvId) {
      this.loadMessages(ChatPage._activeConvId);
    }

    // Real-time message listener with cleanup
    const socket = getSocket();
    if (socket) {
      socket.off('chat:message_new'); // Clean up any prior listener to prevent duplicates
      socket.on('chat:message_new', (msg) => {
        const convId = typeof msg.conversation === 'object' ? msg.conversation?._id : msg.conversation;
        if (convId === ChatPage._activeConvId) {
          ChatPage.appendMessage(msg);
        }
        // Update conversation list
        ChatPage.loadConversations();
      });
    }

    window.sendChatMessage = async (event) => {
      event.preventDefault();
      const input = document.getElementById('chat-message-input');
      const content = input?.value?.trim();
      if (!content || !ChatPage._activeConvId) return;

      input.value = '';

      try {
        const res = await ApiClient.post(`/conversations/${ChatPage._activeConvId}/messages`, {
          text: content,
          content
        });
        const msg = res.data?.message;
        if (msg) {
          ChatPage.appendMessage(msg);
        }
      } catch (err) {
        Toast.error(err.message || 'Failed to send message');
        if (input) input.value = content;
      }
    };

    window.selectConversation = (convId) => {
      window.location.hash = `#/chat?id=${convId}`;
    };

    window.backToConversationsList = () => {
      window.location.hash = '#/chat';
    };
  }

  static async loadConversations() {
    const listContainer = document.getElementById('conversations-list');
    if (!listContainer) return;

    try {
      const res = await ApiClient.get('/conversations');
      const convs = res.data?.conversations || [];
      ChatPage._conversations = convs;

      if (convs.length === 0) {
        listContainer.innerHTML = `<div class="text-xs text-slate-400 py-6 text-center">No conversations yet.</div>`;
        return;
      }

      listContainer.innerHTML = convs.map((conv) => {
        const currentUserId = store.user?._id?.toString();
        const other = conv.participants?.find((p) => p._id?.toString() !== currentUserId) || conv.participants?.[0];
        const isActive = conv._id === ChatPage._activeConvId;
        const lastMsg = conv.lastMessage;

        return `
          <button
            onclick="window.selectConversation('${conv._id}')"
            class="w-full p-3 rounded-xl text-left transition flex items-start space-x-3 ${isActive ? 'bg-sky-500/10 border border-sky-500/20' : 'hover:bg-slate-900/60 border border-transparent'}"
          >
            <img src="${other?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'}" class="w-9 h-9 rounded-xl object-cover shrink-0" />
            <div class="flex-grow min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white truncate">${other?.name || 'User'}</span>
                ${conv.unreadCount > 0 ? `<span class="w-4 h-4 rounded-full bg-sky-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">${conv.unreadCount}</span>` : ''}
              </div>
              <p class="text-[11px] text-slate-400 truncate">${lastMsg?.text || lastMsg?.content || 'No messages yet'}</p>
            </div>
          </button>
        `;
      }).join('');

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Conversations load error:', err);
    }
  }

  static async loadMessages(convId) {
    const messagesArea = document.getElementById('chat-messages');
    const inputArea = document.getElementById('chat-input-area');
    const chatHeader = document.getElementById('chat-header');

    if (!messagesArea) return;

    try {
      // Load conversation details
      const [msgsRes, convRes] = await Promise.all([
        ApiClient.get(`/conversations/${convId}/messages`),
        ApiClient.get(`/conversations/${convId}`)
      ]);

      const messages = msgsRes.data?.messages || [];
      const conv = convRes.data?.conversation;
      const currentUserId = store.user?._id?.toString();
      const other = conv?.participants?.find((p) => p._id?.toString() !== currentUserId) || conv?.participants?.[0];

      ChatPage._messages = messages;

      // Update header
      if (chatHeader && other) {
        chatHeader.innerHTML = `
          <button onclick="window.backToConversationsList()" class="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white mr-1" title="Back to list">
            <i data-lucide="arrow-left" class="w-5 h-5"></i>
          </button>
          <img src="${other.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'}" class="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-500/20" />
          <div>
            <div class="font-bold text-white text-sm">${other.name}</div>
            <div class="text-[11px] text-emerald-400 flex items-center"><span class="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span> Direct Chat</div>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
      }

      // Render messages
      messagesArea.innerHTML = messages.length === 0
        ? '<div class="flex items-center justify-center h-full text-xs text-slate-500">Send a message to start the conversation.</div>'
        : messages.map((msg) => ChatPage.renderMessageBubble(msg)).join('');

      // Show input and scroll to bottom
      if (inputArea) inputArea.classList.remove('hidden');
      messagesArea.scrollTop = messagesArea.scrollHeight;

      // Join socket room
      const socket = getSocket();
      if (socket) {
        socket.emit('chat:join_room', convId);
      }

      // Mark as read
      ApiClient.patch(`/conversations/${convId}/read`).catch(() => {});

    } catch (err) {
      console.error('Messages load error:', err);
    }
  }

  static renderMessageBubble(msg) {
    const currentUserId = store.user?._id?.toString();
    const senderId = (msg.sender?._id || msg.sender)?.toString();
    const isOwn = senderId === currentUserId;
    const avatar = isOwn
      ? (store.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop')
      : (msg.sender?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop');

    const textContent = msg.text || msg.content || '';
    const msgId = (msg._id || '').toString();

    return `
      <div data-msg-id="${msgId}" class="flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}">
        <img src="${avatar}" class="w-7 h-7 rounded-lg object-cover shrink-0 mb-0.5" />
        <div class="max-w-xs lg:max-w-md">
          <div class="px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${isOwn ? 'bg-sky-500 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'}">
            ${textContent}
          </div>
          <div class="text-[10px] text-slate-500 mt-1 ${isOwn ? 'text-right' : ''}">
            ${new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    `;
  }

  static appendMessage(msg) {
    if (!msg) return;
    const msgId = (msg._id || '').toString();
    const messagesArea = document.getElementById('chat-messages');
    if (!messagesArea) return;

    if (msgId) {
      const existing = messagesArea.querySelector(`[data-msg-id="${msgId}"]`);
      if (existing) return; // Deduplicated!
    }

    if (messagesArea.innerHTML.includes('Send a message') || messagesArea.innerHTML.includes('No conversation selected')) {
      messagesArea.innerHTML = '';
    }

    const temp = document.createElement('div');
    temp.innerHTML = ChatPage.renderMessageBubble(msg);
    while (temp.firstChild) {
      messagesArea.appendChild(temp.firstChild);
    }
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}
