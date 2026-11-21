import { CatalogLoadingTable } from "../Catalog/CatalogStates";

const ListingLoadingTable = () => (
  <CatalogLoadingTable title="Listings" columns={["#", "Listing", "Seller", "Price", "Status", "Waiting since", "Action"]} />
);

export default ListingLoadingTable;
