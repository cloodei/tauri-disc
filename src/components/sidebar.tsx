import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { User } from "@/lib/types";
import { Home, Plus, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

type SidebarProps = {
  user: User;
  onLogout: () => void;
};

export function Sidebar({ user, onLogout }: SidebarProps) {
  return (
    <div className="flex h-full w-16 flex-col items-center bg-sidebar py-4 text-sidebar-foreground">
      <NavLink
        to="/channels/me"
        className={({ isActive }) =>
          `mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
            isActive ? 'bg-primary/20 text-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-muted/50'
          }`
        }
      >
        <Home className="h-6 w-6" />
      </NavLink>

      <Separator className="mx-auto mb-4 w-8 bg-sidebar-muted/50" />

      <ScrollArea className="flex-1 w-full">
        <div className="space-y-2 px-2">
          <NavLink
            to="/channels/1"
            className={({ isActive }) =>
              `flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'bg-sidebar-muted text-sidebar-foreground hover:bg-sidebar-muted/70'
              }`
            }
          >
            S
          </NavLink>
        </div>
      </ScrollArea>

      <div className="mt-4 space-y-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-sidebar-foreground/70 hover:bg-sidebar-muted/50 hover:text-sidebar-foreground"
          onClick={() => {
            // Handle add server
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-sidebar-foreground/70 hover:bg-sidebar-muted/50 hover:text-sidebar-foreground"
          onClick={() => {
            // Handle settings
          }}
        >
          <Settings className="h-6 w-6" />
        </Button>

        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full p-0 overflow-hidden"
            onClick={onLogout}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-lg font-semibold">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Button>

          <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Sign Out
          </div>
        </div>
      </div>
    </div>
  );
}
