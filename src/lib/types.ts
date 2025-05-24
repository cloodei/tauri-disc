export type User = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Server = {
  id: string;
  name: string;
  iconUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type Channel = {
  id: string;
  serverId: string;
  name: string;
  type: 'TEXT' | 'VOICE' | 'VIDEO';
  createdAt: string;
  updatedAt: string;
};


export type Message = {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
};

export type Member = {
  id: string;
  serverId: string;
  userId: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
};

export type UserWithRole = User & {
  role: Member['role'];
};

export type ServerWithMembers = Server & {
  members: UserWithRole[];
  channels: Channel[];
};

export type ServerSidebarProps = {
  serverId?: string;
};
