import { AuthProvider } from "@/hooks/use-auth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
