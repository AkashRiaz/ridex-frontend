import { AuditLogsPage } from "@/app/(dashboardGroup)/_components/AuditLog/AuditLogPages";

export const metadata = {
  title: "Audit Log",
};

const Page = (props: PageProps<"/admin-dashboard/audit-logs">) => {
  return <AuditLogsPage searchParams={props.searchParams} dashboardPath="/admin-dashboard" />;
};

export default Page;
