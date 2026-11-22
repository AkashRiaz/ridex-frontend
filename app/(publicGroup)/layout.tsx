import { CompareTray } from "@/components/listing/CompareTray";
import Footer from "@/components/shared/Footer";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { Navbar } from "@/components/shared/Navbar";
import { RealtimeProvider } from "@/components/shared/RealtimeProvider";
import { getMe } from "@/service/getMe";
import React from "react";

const PublicGroupLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = await getMe();
  return (
    <RealtimeProvider user={user.data}>
      {/* pb-bottom-nav: room for the mobile bottom nav (hidden from lg up) */}
      <div className="flex min-h-screen flex-col pb-bottom-nav lg:pb-0">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Navbar user={user} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      <CompareTray />
      <MobileBottomNav user={user} />
    </RealtimeProvider>
  );
};

export default PublicGroupLayout;
