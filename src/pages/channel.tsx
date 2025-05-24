import { useParams } from 'react-router-dom';
import { Hash, Send, SmilePlus, Paperclip } from 'lucide-react';
import { useWebSocketStore } from '@/lib/websocket';
import { useAuth } from '@/hooks/use-auth';
import { useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type Server = {
  id: string;
  name: string;
  description?: string;
};

export function ChannelPage() {
  const { serverId, channelId = "1" } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);

  const {
    messages,
    typingUsers,
    sendMessage: sendWsMessage,
    startTyping,
    stopTyping,
  } = useWebSocketStore();

  const server: Server = {
    id: serverId || '1',
    name: 'Server Name',
    description: 'This is a server description. Welcome to our community!',
  };

  const channelMessages = channelId ? messages[channelId] || [] : [];
  const currentTypingUsers = channelId ? Array.from(typingUsers[channelId] || []) : [];
  
  const currentUser = {
    id: user?.id || 'current-user',
    username: user?.username || 'currentuser',
    displayName: user?.displayName || 'Current User',
    avatar: user?.avatar,
  };

  const currentChannel = {
    id: channelId || '1',
    name: 'general',
    type: 'TEXT',
    messages: channelMessages,
  };

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [channelMessages]);

  useEffect(() => {
    inputRef.current?.focus();

    return () => {
      if (channelId)
        stopTyping(channelId);
    };
  }, [channelId, stopTyping]);

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !channelId)
      return;

    sendWsMessage({ channelId, content: message, username: currentUser.username, displayName: currentUser.displayName });
    setMessage('');

    if (isTyping) {
      stopTyping(channelId);
      setIsTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Handle typing indicator
    if (!isTyping && channelId) {
      startTyping(channelId);
      setIsTyping(true);
    }

    // Reset the typing timeout
    if (typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current);

    // Set a timeout to stop the typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (channelId) {
        stopTyping(channelId);
        setIsTyping(false);
      }
    }, 3000);
  };

  const renderMessages = () => {
    if (!channelId)
      return null;

    const messages = channelMessages;

    return messages.map(message => {
      const isCurrentUser = message.userId === currentUser.id;
      const isSystem = message.userId === 'system';

      if (isSystem)
        return (
          <div key={message.id} className="flex justify-center py-2">
            <div className="rounded-full bg-muted px-4 py-1 text-sm text-muted-foreground">
              {message.content}
            </div>
          </div>
        )

      return (
        <div
          key={message.id}
          className={`flex items-start gap-3 p-2 hover:bg-muted/50 ${isCurrentUser ? 'justify-end' : ''}`}
        >
          {!isCurrentUser && (
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
              {message.user.avatar ? (
                <img
                  src={message.user.avatar}
                  alt={message.user.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                  {message.user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
          <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            {!isCurrentUser && (
              <div className="text-sm font-semibold">
                {message.user.displayName}
              </div>
            )}
            <div className="text-sm">{message.content}</div>
            <div className={`mt-1 text-xs ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      );
    });
  };

  if (!channelId)
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Hash className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to {server.name}!</h1>
          {server.description && (
            <p className="text-muted-foreground">{server.description}</p>
          )}
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Select a channel from the sidebar to start chatting.
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center">
          <Hash className="mr-2 h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">{currentChannel.name}</h2>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {renderMessages()}
      </ScrollArea>

      {isTyping && (
        <div className="px-4 py-1 text-xs text-muted-foreground">
          {currentTypingUsers.length === 1
            ? `${currentTypingUsers[0]} is typing...`
            : currentTypingUsers.length === 2
            ? `${currentTypingUsers[0]} and ${currentTypingUsers[1]} are typing...`
            : `${currentTypingUsers[0]} and ${currentTypingUsers.length - 1} others are typing...`}
        </div>
      )}

      <div className="border-t border-border p-4">
        <form onSubmit={handleMessageSubmit} className="relative">
          <div className="relative flex items-center rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/50">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Input
              value={message}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleMessageSubmit(e);
                }
              }}
              placeholder={`Message #${currentChannel.name}`}
              className="min-h-10 flex-1 border-0 bg-transparent px-2 py-1.5 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <SmilePlus className="h-4 w-4" />
              </Button>

              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
