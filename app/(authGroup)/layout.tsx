import { ThemeToggle } from "@/components/shared/ThemeToggle";

const AuthGroupLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </main>
  );
};

export default AuthGroupLayout;
