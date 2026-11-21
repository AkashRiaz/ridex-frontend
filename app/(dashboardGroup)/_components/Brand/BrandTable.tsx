import Link from "next/link";
import { Pencil, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SearchBar } from "@/components/ui/SearchBar";
import TableBackButton from "@/components/ui/TableBackButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActiveBadge } from "@/components/shared/UserBadges";
import { ACTIVE_FILTER_OPTIONS, UrlFilterSelect } from "@/components/shared/UrlFilterSelect";
import { TSearchParams } from "@/types";
import { getAllBrandsAction } from "../../_actions/brandActions";
import { getAllVehicleTypesAction } from "../../_actions/vehicleTypeActions";
import BrandDelete from "./BrandDelete";
import { CatalogError } from "../Catalog/CatalogStates";
import { CatalogThumb } from "../Catalog/CatalogThumb";

export const BRAND_COLUMNS = ["#", "Brand", "Country", "Vehicle types", "Models", "Status", "Action"];

const BrandTable = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
}) => {
  const [result, vehicleTypesResult] = await Promise.all([
    getAllBrandsAction({ query: searchParams, admin: true }),
    getAllVehicleTypesAction({ admin: true }),
  ]);
  const brands = result.data || [];
  const currentPage = Math.max(1, Number(result.meta?.page ?? 1));
  const limit = Math.max(1, Number(result.meta?.limit ?? 20));
  const totalPages = Math.max(1, Number(result.meta?.totalPages ?? 1));

  if (!result.success) {
    return <CatalogError title="Failed to load brands" message={result.message} />;
  }

  const vehicleTypeOptions = (vehicleTypesResult.data ?? []).map((vehicleType) => ({
    value: vehicleType.slug,
    label: vehicleType.name,
  }));

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="mx-1 flex flex-col gap-3 border-b py-4 sm:mx-2 md:mx-0 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            <TableBackButton />
            Brands
          </h2>
          <p className="text-sm text-muted-foreground">{result.meta?.total ?? brands.length} brands</p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
          <SearchBar compact />
          <Link
            href={`${dashboardPath}/create-brand`}
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground transition hover:bg-primary/90"
          >
            Add Brand
          </Link>
        </div>
      </div>

      <div className="mx-1 flex flex-wrap gap-2 py-3 sm:mx-2 md:mx-0">
        <UrlFilterSelect
          param="vehicleType"
          label="Filter by vehicle type"
          allLabel="All vehicle types"
          options={vehicleTypeOptions}
        />
        <UrlFilterSelect
          param="isPopular"
          label="Filter popular brands"
          allLabel="Popular & others"
          options={[
            { value: "true", label: "Popular only" },
            { value: "false", label: "Not popular" },
          ]}
        />
        <UrlFilterSelect
          param="isActive"
          label="Filter by status"
          allLabel="All statuses"
          options={ACTIVE_FILTER_OPTIONS}
          className="w-36"
        />
      </div>

      <div className="mx-1 overflow-x-auto sm:mx-2 md:mx-0">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {BRAND_COLUMNS.map((column) => (
                <TableHead
                  key={column}
                  className={column === "Action" ? "text-right font-semibold" : "font-semibold"}
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No brands found.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand, index) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CatalogThumb name={brand.name} imageUrl={brand.logoUrl} />
                      <div>
                        <p className="flex items-center gap-1.5 font-medium">
                          {brand.name}
                          {brand.isPopular && (
                            <Star
                              className="size-3.5 fill-warning text-warning"
                              aria-label="Popular brand"
                            />
                          )}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">{brand.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{brand.country || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {brand.vehicleTypes.map((vehicleType) => (
                        <Badge key={vehicleType.id} variant="outline">
                          {vehicleType.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`${dashboardPath}/vehicle-models?brand=${brand.slug}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {brand._count?.models ?? 0}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ActiveBadge isActive={brand.isActive} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`${dashboardPath}/brands/${brand.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <BrandDelete id={brand.id} name={brand.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
};

export default BrandTable;
