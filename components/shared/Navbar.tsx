"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { logout } from "@/app/(authGroup)/_actions/authActions";
import { Bike, LayoutDashboard, LogOut, Menu, User } from "lucide-react";
import { NavbarProps } from "@/lib/type";
import { getDashboardPath, getProfilePath } from "@/lib/dashboardPath";
import { UserAvatar } from "./UserAvatar";
import { siteConfig } from "@/lib/siteConfig";
import { ThemeToggle } from "./ThemeToggle";

// Public navigation links (pages are added phase by phase)
const navItems = [
  {
    label: "Home",
    href: "/",
  },
];

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = Boolean(user?.success && user?.data);
  const dashboardPath = getDashboardPath(user?.data?.role);

  // Active Link Detection
  const isActiveMenu = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await logout();

    toast.success("Logged out successfully");

    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
      <nav aria-label="Main Navigation">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Open navigation menu"
                    >
                      <Menu className="size-6" />
                    </Button>
                  }
                />

                <SheetContent side="left" className="w-[300px] p-0">
                  <SheetHeader className="border-b px-5 py-5 text-left">
                    <SheetTitle>{siteConfig.name}</SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col gap-1 p-3">
                    {navItems.map((item) => (
                      <SheetClose
                        key={item.href}
                        render={
                          <Link
                            href={item.href}
                            className="rounded-xl px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
                          />
                        }
                      >
                        {item.label}
                      </SheetClose>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                <Bike size={22} aria-hidden="true" />
              </div>

              <span className="text-xl font-extrabold tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          {/* Center: Main Nav Links (Desktop) */}
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = isActiveMenu(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right: Theme + User */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Open user menu"
                      className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <UserAvatar
                        name={user.data?.name}
                        imageUrl={user.data?.imageUrl}
                        size={36}
                      />
                    </button>
                  }
                />

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <p className="truncate text-sm font-semibold">
                        {user.data?.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.data?.email || user.data?.phone}
                      </p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {dashboardPath && (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push(dashboardPath)}
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(getProfilePath(user.data?.role))}
                      >
                        <User className="size-4" />
                        My Profile
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
