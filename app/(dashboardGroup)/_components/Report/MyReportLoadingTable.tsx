import { CatalogLoadingTable } from "../Catalog/CatalogStates";

const MyReportLoadingTable = () => (
  <CatalogLoadingTable title="My reports" columns={["Reported", "Reason", "Status", "Sent"]} rows={5} />
);

export default MyReportLoadingTable;
