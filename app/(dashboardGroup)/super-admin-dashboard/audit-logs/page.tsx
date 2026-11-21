import { AuditLogsPage } from "@/app/(dashboardGroup)/_components/AuditLog/AuditLogPages";

export const metadata = {
  title: "Audit Log",
};

const Page = (props: PageProps<"/super-admin-dashboard/audit-logs">) => {
  return <AuditLogsPage searchParams={props.searchParams} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
