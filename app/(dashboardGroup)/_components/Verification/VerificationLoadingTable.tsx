import { CatalogLoadingTable } from "../Catalog/CatalogStates";

const VerificationLoadingTable = () => (
  <CatalogLoadingTable title="Verifications" columns={["#", "User", "Type", "Documents", "Status", "Submitted", "Action"]} rows={8} />
);

export default VerificationLoadingTable;
