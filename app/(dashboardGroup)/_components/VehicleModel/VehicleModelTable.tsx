import Link from "next/link";
import { Pencil } from "lucide-react";
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
import { formatSpecValue } from "@/components/dynamicForm/SpecValue";
import { ActiveBadge } from "@/components/shared/UserBadges";
import { ACTIVE_FILTER_OPTIONS, UrlFilterSelect } from "@/components/shared/UrlFilterSelect";
import { IVehicleAttribute, TSearchParams } from "@/types";
import { getAllBrandsAction } from "../../_actions/brandActions";
import { getAllVehicleModelsAction } from "../../_actions/vehicleModelActions";
import { getAllVehicleTypesAction } from "../../_actions/vehicleTypeActions";
import CatalogDelete from "../Catalog/CatalogDelete";
import { CatalogError } from "../Catalog/CatalogStates";
import { CatalogThumb } from "../Catalog/CatalogThumb";

export const VEHICLE_MODEL_COLUMNS = ["#", "Model", "Brand", "Type", "Years", "Key specs", "Status", "Action"];

const VehicleModelTable = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
}) => {
  const [result, vehicleTypesResult, brandsResult] = await Promise.all([
    getAllVehicleModelsAction({ query: searchParams, admin: true }),
    getAllVehicleTypesAction({ admin: true }),
    getAllBrandsAction({ admin: true, query: { limit: "100" } }),
  ]);
  const vehicleModels = result.data || [];
  const currentPage = Math.max(1, Number(result.meta?.page ?? 1));
  const limit = Math.max(1, Number(result.meta?.limit ?? 20));
  const totalPages = Math.max(1, Number(result.meta?.totalPages ?? 1));

  if (!result.success) {
    return <CatalogError title="Failed to load models" message={result.message} />;
  }

  const vehicleTypes = vehicleTypesResult.data ?? [];

  // "show on card" attributes per vehicle type = key specs column
  const cardAttributesByType = new Map<string, IVehicleAttribute[]>(
    vehicleTypes.map((vehicleType) => [
      vehicleType.id,
      vehicleType.attributes.filter((attribute) => attribute.showInCard),
    ]),
  );

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="mx-1 flex flex-col gap-3 border-b py-4 sm:mx-2 md:mx-0 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            <TableBackButton />
            Models
          </h2>
          <p className="text-sm text-muted-foreground">
            {result.meta?.total ?? vehicleModels.length} models
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
          <SearchBar compact />
          <Link
            href={`${dashboardPath}/create-vehicle-model`}
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground transition hover:bg-primary/90"
          >
            Add Model
          </Link>
        </div>
      </div>

      <div className="mx-1 flex flex-wrap gap-2 py-3 sm:mx-2 md:mx-0">
        <UrlFilterSelect
          param="vehicleType"
          label="Filter by vehicle type"
          allLabel="All vehicle types"
          options={vehicleTypes.map((vehicleType) => ({
            value: vehicleType.slug,
            label: vehicleType.name,
          }))}
        />
        <UrlFilterSelect
          param="brand"
          label="Filter by brand"
          allLabel="All brands"
          options={(brandsResult.data ?? []).map((brand) => ({
            value: brand.slug,
            label: brand.name,
          }))}
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
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {VEHICLE_MODEL_COLUMNS.map((column) => (
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
            {vehicleModels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No models found.
                </TableCell>
              </TableRow>
            ) : (
              vehicleModels.map((vehicleModel, index) => {
                const keySpecs = (cardAttributesByType.get(vehicleModel.vehicleTypeId) ?? [])
                  .map((attribute) => formatSpecValue(attribute, vehicleModel.defaultSpecs[attribute.key]))
                  .filter(Boolean);

                return (
                  <TableRow key={vehicleModel.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {(currentPage - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <CatalogThumb name={vehicleModel.name} imageUrl={vehicleModel.imageUrl} />
                        <div>
                          <p className="font-medium">{vehicleModel.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{vehicleModel.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{vehicleModel.brand.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicleModel.vehicleType.name}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {vehicleModel.yearFrom ?? "—"}
                      {" – "}
                      {vehicleModel.yearTo ?? (vehicleModel.yearFrom ? "now" : "—")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {keySpecs.length > 0 ? keySpecs.join(" · ") : "—"}
                    </TableCell>
                    <TableCell>
                      <ActiveBadge isActive={vehicleModel.isActive} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`${dashboardPath}/vehicle-models/${vehicleModel.id}`}
                          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                          Edit
                        </Link>
                        <CatalogDelete
                          entity="vehicleModel"
                          id={vehicleModel.id}
                          name={`${vehicleModel.brand.name} ${vehicleModel.name}`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
};

export default VehicleModelTable;
