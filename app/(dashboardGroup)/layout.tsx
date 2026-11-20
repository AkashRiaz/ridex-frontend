import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMainContent from "@/components/dashboard/DashboardMainContent";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { getMe } from "@/service/getMe";

export const dynamic = "force-dynamic";

const DashboardGroupLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = await getMe();

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <TooltipProvider>
        <SidebarProvider className="min-h-0 flex-1">
          <DashboardSidebar user={user} />

          <SidebarInset className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 md:hidden" />

                <p className="text-sm font-semibold">Dashboard</p>
              </div>

              <ThemeToggle />
            </div>

            <DashboardMainContent>{children}</DashboardMainContent>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
};

export default DashboardGroupLayout;
