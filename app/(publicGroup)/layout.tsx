import Footer from "@/components/shared/Footer";
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
      <div className="flex min-h-screen flex-col">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </RealtimeProvider>
  );
};

export default PublicGroupLayout;
