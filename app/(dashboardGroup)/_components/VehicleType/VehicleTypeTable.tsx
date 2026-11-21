import Link from "next/link";
import { Layers, Pencil } from "lucide-react";
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
import { getAllVehicleTypesAction } from "../../_actions/vehicleTypeActions";
import VehicleTypeDelete from "./VehicleTypeDelete";
import { CatalogError } from "../Catalog/CatalogStates";

export const VEHICLE_TYPE_COLUMNS = ["#", "Vehicle type", "Attributes", "Brands", "Models", "Status", "Action"];

const VehicleTypeTable = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
}) => {
  const result = await getAllVehicleTypesAction({ query: searchParams, admin: true });
  const vehicleTypes = result.data || [];
  const currentPage = Math.max(1, Number(result.meta?.page ?? 1));
  const limit = Math.max(1, Number(result.meta?.limit ?? 50));
  const totalPages = Math.max(1, Number(result.meta?.totalPages ?? 1));

  if (!result.success) {
    return <CatalogError title="Failed to load vehicle types" message={result.message} />;
  }

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="mx-1 flex flex-col gap-3 border-b py-4 sm:mx-2 md:mx-0 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            <TableBackButton />
            Vehicle Types
          </h2>
          <p className="text-sm text-muted-foreground">
            Each type defines the spec fields its listings use
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
          <SearchBar compact />
          <UrlFilterSelect
            param="isActive"
            label="Filter by status"
            allLabel="All statuses"
            options={ACTIVE_FILTER_OPTIONS}
            className="w-36"
          />
          <Link
            href={`${dashboardPath}/create-vehicle-type`}
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground transition hover:bg-primary/90"
          >
            Add Vehicle Type
          </Link>
        </div>
      </div>

      <div className="mx-1 overflow-x-auto pt-3 sm:mx-2 md:mx-0">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {VEHICLE_TYPE_COLUMNS.map((column) => (
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
            {vehicleTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No vehicle types found.
                </TableCell>
              </TableRow>
            ) : (
              vehicleTypes.map((vehicleType, index) => (
                <TableRow key={vehicleType.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Layers className="size-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-medium">{vehicleType.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{vehicleType.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{vehicleType.attributes.length}</TableCell>
                  <TableCell>{vehicleType._count?.brands ?? 0}</TableCell>
                  <TableCell>{vehicleType._count?.models ?? 0}</TableCell>
                  <TableCell>
                    <ActiveBadge isActive={vehicleType.isActive} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`${dashboardPath}/vehicle-types/${vehicleType.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <VehicleTypeDelete id={vehicleType.id} name={vehicleType.name} />
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

export default VehicleTypeTable;
