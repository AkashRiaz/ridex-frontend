import { CatalogLoadingTable } from "../Catalog/CatalogStates";

const AuditLogLoadingTable = () => (
  <CatalogLoadingTable title="Audit log" columns={["#", "When", "Who", "Action", "Entity", "IP address", "Details"]} />
);

export default AuditLogLoadingTable;
