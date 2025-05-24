import { useParams } from 'react-router-dom';
import { Hash } from 'lucide-react';

type Server = {
  id: string;
  name: string;
  description?: string;
};

export function ServerPage() {
  const { serverId } = useParams();

  const server: Server = {
    id: serverId || '1',
    name: 'Server Name',
    description: 'This is a server description. Welcome to our community!',
  };

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
}
