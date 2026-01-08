import { AuthProvider } from "@/context/auth-context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </AuthProvider>
  );
}
