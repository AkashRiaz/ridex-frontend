import { AuditLogDetailPage } from "@/app/(dashboardGroup)/_components/AuditLog/AuditLogPages";

export const metadata = {
  title: "Audit Entry",
};

const Page = (props: PageProps<"/admin-dashboard/audit-logs/[auditLogId]">) => {
  return <AuditLogDetailPage params={props.params} dashboardPath="/admin-dashboard" />;
};

export default Page;
