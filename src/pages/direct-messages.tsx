import { useParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, SmilePlus, Paperclip } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { Message, useWebSocketStore } from '@/lib/websocket';

type Conversation = {
  id: string;
  participants: {
    id: string;
    username: string;
    avatar?: string;
  }[];
  messages: Message[];
};

export function DirectMessagesPage() {
  const { channelId } = useParams();
  const { user } = useAuth();
  const { register, handleSubmit } = useForm<{ message: string }>();
  const {
    messages,
    sendMessage,
  } = useWebSocketStore();

  const onSubmit = (data: { message: string }) => {
    if (!channelId)
      return;

    sendMessage({
      channelId,
      content: data.message,
      username: user?.username || 'currentuser',
      displayName: user?.displayName || 'Current User',
    });
  };

  const conversations: Conversation[] = [{
    id: '1',
    participants: [
      {
        id: '2',
        username: 'Friend 1',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=friend1',
      },
      {
        id: user?.id || 'current-user',
        username: user?.displayName || 'You',
        avatar: user?.avatar,
      },
    ],
    messages: messages[channelId!] || [],
  }];

  const currentConversation = channelId ? conversations.find(c => c.id === channelId) : null;
  const otherParticipant = currentConversation?.participants.find(p => p.id !== user?.id);

  if (!currentConversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-8">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold">No conversation selected</h2>
          <p className="text-muted-foreground">
            Select a conversation from the sidebar or start a new one to begin messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center">
          <div className="relative mr-3 h-8 w-8 rounded-full overflow-hidden">
            {otherParticipant?.avatar ? (
              <img
                src={otherParticipant.avatar}
                alt={otherParticipant.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                {otherParticipant?.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">
              {otherParticipant?.username || 'Unknown User'}
            </h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {currentConversation.messages.map(message => {
            const isCurrentUser = message.userId === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isCurrentUser && (
                  <div className="mr-3 mt-1 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                    {message.user.avatar ? (
                      <img
                        src={message.user.avatar}
                        alt={message.user.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-xs font-medium">
                        {message.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted rounded-tl-none'
                  }`}
                >
                  {!isCurrentUser && (
                    <div className="text-xs font-semibold text-foreground">
                      {message.user.username}
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
          })}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit(onSubmit)} className="border-t p-4">
        <div className="relative flex items-center rounded-lg border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            {...register('message')}
            className="flex-1 border-0 bg-transparent px-2 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder={`Message ${otherParticipant?.username || 'user'}`}
          />

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <SmilePlus className="h-4 w-4" />
            </Button>

            <Button size="icon" className="h-8 w-8 rounded-full" type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
