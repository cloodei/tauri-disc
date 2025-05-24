import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "react-router-dom";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

const channelIconMap = {
  TEXT: <Hash className="mr-2 h-4 w-4" />,
  VOICE: <Mic className="mr-2 h-4 w-4" />,
  VIDEO: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500" />,
  MODERATOR: <ShieldCheck className="h-4 w-4 text-indigo-500" />,
  GUEST: null,
};

type Channel = {
  id: string;
  name: string;
  type: 'TEXT' | 'VOICE' | 'VIDEO';
};

type Member = {
  id: string;
  username: string;
  role: 'ADMIN' | 'MODERATOR' | 'GUEST';
  avatarUrl?: string;
};

type ServerSidebarProps = {
  serverId?: string;
};

export function ServerSidebar({ serverId }: ServerSidebarProps) {
  const params = useParams();
  const currentServerId = serverId || params.serverId;

  const server = {
    id: currentServerId,
    name: 'Server Name',
    channels: [
      { id: '1', name: 'general', type: 'TEXT' },
      { id: '2', name: 'welcome', type: 'TEXT' },
      { id: '3', name: 'voice-chat', type: 'VOICE' },
    ] as Channel[],
    members: [
      { id: '1', username: 'User 1', role: 'ADMIN', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
      { id: '2', username: 'User 2', role: 'MODERATOR', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
      { id: '3', username: 'User 3', role: 'GUEST', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
    ] as Member[],
  };

  if (!currentServerId) {
    return null;
  }

  return (
    <div className="flex h-full w-60 flex-col bg-channel">
      <div className="flex h-14 items-center border-b border-channel-muted px-4 font-semibold text-channel-foreground shadow-sm">
        {server.name}
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-2">
            <div>
              <div className="mb-2 px-2 text-xs font-semibold uppercase text-channel-muted-foreground">
                Text Channels
              </div>

              <div className="space-y-1">
                {server.channels
                  .filter((channel) => channel.type === 'TEXT')
                  .map((channel) => (
                    <a
                      key={channel.id}
                      href={`/channels/${server.id}/${channel.id}`}
                      className="group flex items-center rounded px-2 py-1 text-sm font-medium text-channel-foreground/70 hover:bg-channel-muted hover:text-channel-foreground"
                    >
                      {channelIconMap[channel.type]}
                      <span>{channel.name}</span>
                    </a>
                  ))}
              </div>
            </div>

            <div>
              <div className="mb-2 px-2 text-xs font-semibold uppercase text-channel-muted-foreground">
                Voice Channels
              </div>

              <div className="space-y-1">
                {server.channels
                  .filter((channel) => channel.type !== 'TEXT')
                  .map((channel) => (
                    <button
                      key={channel.id}
                      className="group flex w-full items-center rounded px-2 py-1 text-left text-sm font-medium text-channel-foreground/70 hover:bg-channel-muted hover:text-channel-foreground"
                    >
                      {channelIconMap[channel.type]}
                      <span>{channel.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-channel-muted bg-channel">
        <div className="p-2">
          <div className="mb-2 px-2 text-xs font-semibold uppercase text-channel-muted-foreground">
            Online — {server.members.length}
          </div>

          <div className="space-y-1">
            {server.members.map((member) => (
              <div
                key={member.id}
                className="group flex items-center rounded p-1 hover:bg-channel-muted"
              >
                <div className="relative mr-2 h-6 w-6 flex-shrink-0 overflow-hidden rounded-full">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-foreground">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center text-sm font-medium text-channel-foreground">
                    <span className="truncate">{member.username}</span>
                    {roleIconMap[member.role]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
