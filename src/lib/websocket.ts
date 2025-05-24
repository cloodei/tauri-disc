import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

export interface Message {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  user: User;
  timestamp: string;
  isOptimistic?: boolean;
}

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, Set<string>>;
  connect: (url: string) => void;
  disconnect: () => void;

  sendMessage: ({
    channelId,
    content,
    username,
    displayName,
  }: {
    channelId: string;
    content: string;
    username: string;
    displayName: string;
  }) => void;

  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
}

type WebSocketMessage =
  | { type: 'MESSAGE_CREATE'; data: Message }
  | { type: 'TYPING_START'; data: { channelId: string; userId: string } }
  | { type: 'TYPING_END'; data: { channelId: string; userId: string } };

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  messages: {},
  typingUsers: {},

  connect: (url: string) => {
    const { socket: existingSocket } = get();
    if (existingSocket) {
      existingSocket.close();
    }

    try {
      const socket = new WebSocket(url);

      socket.addEventListener('open', () => {
        console.log('WebSocket connected');
        set({ socket, isConnected: true });
      });

      socket.addEventListener('message', (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'MESSAGE_CREATE':
              set((state) => {
                const { channelId } = message.data;
                const currentMessages = state.messages[channelId] || [];

                if (currentMessages.some(m => m.id === message.data.id))
                  return state;

                return {
                  messages: {
                    ...state.messages,
                    [channelId]: [...currentMessages, message.data],
                  },
                };
              });
              break;

            case 'TYPING_START':
              set((state) => {
                const { channelId, userId } = message.data;
                const typingUsers = { ...state.typingUsers };

                if (!typingUsers[channelId])
                  typingUsers[channelId] = new Set();

                typingUsers[channelId].add(userId);
                return { typingUsers };
              });
              break;

            case 'TYPING_END':
              set((state) => {
                const { channelId, userId } = message.data;
                const typingUsers = { ...state.typingUsers };

                if (typingUsers[channelId])
                  typingUsers[channelId].delete(userId);

                return { typingUsers };
              });
              break;

            default:
              console.warn('Unhandled message type:', (message as any).type);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      socket.addEventListener('error', (error: Event) => {
        console.error('WebSocket error:', error);
      });

      socket.addEventListener('close', () => {
        set({ socket: null, isConnected: false });
        setTimeout(() => get().connect(url), 3000);
      });

      set({ socket, isConnected: true });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },

  sendMessage: ({
    channelId,
    content,
    username,
    displayName,
  }: {
    channelId: string;
    content: string;
    username: string;
    displayName: string;
  }) => {
    const { socket, isConnected } = get();
    if (!isConnected || !socket) {
      console.log('WebSocket is not connected:', isConnected, socket);
      return;
    }

    const message = {
      id: Math.random().toString(36).substring(2, 9),
      content,
      channelId,
      userId: 'current-user',
      user: {
        id: 'current-user',
        username,
        displayName,
      },
      timestamp: new Date().toISOString(),
      isOptimistic: true,
    };

    try {
      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: [
            ...(state.messages[channelId] || []),
            message,
          ],
        },
      }));

      socket.send(JSON.stringify({
        type: 'MESSAGE_CREATE',
        data: message,
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  startTyping: (channelId: string) => {
    const { socket, isConnected } = get();
    if (!isConnected || !socket)
      return;

    try {
      socket.send(JSON.stringify({
        type: 'TYPING_START',
        data: {
          channelId,
          userId: 'current-user',
        },
      }));
    } catch (error) {
      console.error('Failed to send typing start:', error);
    }
  },

  stopTyping: (channelId: string) => {
    const { socket, isConnected } = get();
    if (!isConnected || !socket)
      return;

    try {
      socket.send(JSON.stringify({
        type: 'TYPING_END',
        data: {
          channelId,
          userId: 'current-user',
        },
      }));
    } catch (error) {
      console.error('Failed to send typing end:', error);
    }
  },
}));
