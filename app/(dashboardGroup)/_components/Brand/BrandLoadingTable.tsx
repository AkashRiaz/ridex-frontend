import { CatalogLoadingTable } from "../Catalog/CatalogStates";
import { BRAND_COLUMNS } from "./BrandTable";

const BrandLoadingTable = () => (
  <CatalogLoadingTable title="Brands" columns={BRAND_COLUMNS} />
);

export default BrandLoadingTable;
