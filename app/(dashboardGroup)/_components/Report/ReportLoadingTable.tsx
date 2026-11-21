import { CatalogLoadingTable } from "../Catalog/CatalogStates";

const ReportLoadingTable = () => (
  <CatalogLoadingTable title="Reports" columns={["#", "Reported", "Reason", "Reports", "Reporter", "Status", "Sent", "Action"]} rows={8} />
);

export default ReportLoadingTable;
