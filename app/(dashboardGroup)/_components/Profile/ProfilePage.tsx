import { Suspense } from "react";
import { TSearchParams } from "@/types";
import ProfileLoading from "./ProfileLoading";
import ProfileView from "./ProfileView";

/*
 * Shared by every <role>-dashboard/profile/page.tsx.
 */
const ProfilePage = async ({
  searchParams,
}: {
  searchParams?: Promise<TSearchParams>;
}) => {
  return (
    <div className="mx-auto max-w-4xl p-2 md:p-5">
      <Suspense fallback={<ProfileLoading />}>
        <ProfileView searchParams={await searchParams} />
      </Suspense>
    </div>
  );
};

export default ProfilePage;
