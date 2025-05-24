import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { AuthPage } from "./pages/auth";
import { ServerPage } from "./pages/server";
import { ChannelPage } from "./pages/channel";
import { DirectMessagesPage } from "./pages/direct-messages";
import { MainLayout } from "./layouts/main-layout";
import { WebSocketProvider } from "./components/providers/websocket-provider";
import { useAuthRequired } from "./hooks/use-auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthRequired();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthRequired();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/channels/me" replace />;
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
          <Routes>
            {/* Public routes */}
            <Route
              path="/auth"
              element={
                <PublicOnlyRoute>
                  <AuthPage />
                </PublicOnlyRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/channels/me" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/channels/me"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DirectMessagesPage />} />
            </Route>

            <Route
              path="/channels/me/:channelId"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DirectMessagesPage />} />
            </Route>

            <Route
              path="/channels/:serverId"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ServerPage />} />
              <Route path=":channelId" element={<ChannelPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster 
            position="top-center" 
            richColors 
            theme="dark"
            toastOptions={{
              style: {
                background: '#2b2d31',
                border: '1px solid #404249',
                color: '#dbdee1',
              },
            }}
          />
        </div>
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
