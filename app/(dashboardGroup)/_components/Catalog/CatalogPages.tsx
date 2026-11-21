import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import TableBackButton from "@/components/ui/TableBackButton";
import { TSearchParams } from "@/types";
import { getAllBrandsAction, getBrandByIdAction } from "../../_actions/brandActions";
import { getVehicleModelByIdAction } from "../../_actions/vehicleModelActions";
import {
  getAllVehicleTypesAction,
  getVehicleTypeByIdAction,
} from "../../_actions/vehicleTypeActions";
import BrandCreate from "../Brand/BrandCreate";
import BrandDelete from "../Brand/BrandDelete";
import BrandLoadingTable from "../Brand/BrandLoadingTable";
import BrandTable from "../Brand/BrandTable";
import BrandUpdate from "../Brand/BrandUpdate";
import AttributeSchemaBuilder from "../VehicleType/AttributeSchemaBuilder";
import VehicleTypeCreate from "../VehicleType/VehicleTypeCreate";
import VehicleTypeDelete from "../VehicleType/VehicleTypeDelete";
import VehicleTypeLoadingTable from "../VehicleType/VehicleTypeLoadingTable";
import VehicleTypeTable from "../VehicleType/VehicleTypeTable";
import VehicleTypeUpdate from "../VehicleType/VehicleTypeUpdate";
import VehicleModelCreate from "../VehicleModel/VehicleModelCreate";
import VehicleModelDelete from "../VehicleModel/VehicleModelDelete";
import VehicleModelLoadingTable from "../VehicleModel/VehicleModelLoadingTable";
import VehicleModelTable from "../VehicleModel/VehicleModelTable";
import VehicleModelUpdate from "../VehicleModel/VehicleModelUpdate";
import { CatalogError } from "./CatalogStates";

/*
 * Shared page bodies for the catalog pages of the super-admin and admin dashboards.
 * Route files stay thin: <XListPage dashboardPath="/admin-dashboard" ... />
 */

type ListPageProps = {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
};

const FormSkeleton = () => (
  <div className="space-y-4" aria-busy="true">
    <Skeleton className="h-24 w-full rounded-xl" />
    <Skeleton className="h-96 w-full rounded-xl" />
  </div>
);

// ============================================
// Vehicle types
// ============================================

export const VehicleTypesListPage = async ({ searchParams, dashboardPath }: ListPageProps) => (
  <div className="flex flex-col gap-4 p-2 md:p-5">
    <Suspense
      fallback={<VehicleTypeLoadingTable />}
    >
      <VehicleTypeTable searchParams={await searchParams} dashboardPath={dashboardPath} />
    </Suspense>
  </div>
);

export const CreateVehicleTypePage = ({ dashboardPath }: { dashboardPath: string }) => (
  <div className="mx-auto max-w-3xl p-2 md:p-5">
    <VehicleTypeCreate dashboardPath={dashboardPath} />
  </div>
);

const VehicleTypeEditor = async ({
  vehicleTypeId,
  dashboardPath,
}: {
  vehicleTypeId: string;
  dashboardPath: string;
}) => {
  const result = await getVehicleTypeByIdAction(vehicleTypeId);

  if (!result.success || !result.data) {
    return <CatalogError title="Failed to load vehicle type" message={result.message} />;
  }

  const vehicleType = result.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          <TableBackButton />
          {vehicleType.name}
        </h2>
        <VehicleTypeDelete
          id={vehicleType.id}
          name={vehicleType.name}
          showLabel
          redirectTo={`${dashboardPath}/vehicle-types`}
        />
      </div>

      <VehicleTypeUpdate
        key={`details-${vehicleType.updatedAt}`}
        vehicleType={vehicleType}
        dashboardPath={dashboardPath}
      />

      <section className="rounded-xl border bg-card p-5 shadow-card sm:p-6">
        {/* remount after save so drafts reflect the stored schema */}
        <AttributeSchemaBuilder
          key={`schema-${vehicleType.updatedAt}`}
          vehicleTypeId={vehicleType.id}
          vehicleTypeName={vehicleType.name}
          attributes={vehicleType.attributes}
          modelCount={vehicleType._count?.models ?? 0}
        />
      </section>
    </div>
  );
};

export const VehicleTypeDetailPage = async ({
  params,
  dashboardPath,
}: {
  params: Promise<{ vehicleTypeId: string }>;
  dashboardPath: string;
}) => {
  const { vehicleTypeId } = await params;

  return (
    <div className="mx-auto max-w-6xl p-2 md:p-5">
      <Suspense fallback={<FormSkeleton />}>
        <VehicleTypeEditor vehicleTypeId={vehicleTypeId} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

// ============================================
// Brands
// ============================================

export const BrandsListPage = async ({ searchParams, dashboardPath }: ListPageProps) => (
  <div className="flex flex-col gap-4 p-2 md:p-5">
    <Suspense fallback={<BrandLoadingTable />}>
      <BrandTable searchParams={await searchParams} dashboardPath={dashboardPath} />
    </Suspense>
  </div>
);

const BrandEditor = async ({
  brandId,
  dashboardPath,
}: {
  brandId?: string;
  dashboardPath: string;
}) => {
  const [brandResult, vehicleTypesResult] = await Promise.all([
    brandId ? getBrandByIdAction(brandId) : Promise.resolve(null),
    getAllVehicleTypesAction({ admin: true }),
  ]);

  if (brandResult && (!brandResult.success || !brandResult.data)) {
    return <CatalogError title="Failed to load brand" message={brandResult.message} />;
  }

  if (!vehicleTypesResult.success) {
    return <CatalogError title="Failed to load vehicle types" message={vehicleTypesResult.message} />;
  }

  const brand = brandResult?.data ?? undefined;

  return (
    <div className="space-y-6">
      {brand && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            <TableBackButton />
            {brand.name}
          </h2>
          <BrandDelete id={brand.id} name={brand.name} showLabel redirectTo={`${dashboardPath}/brands`} />
        </div>
      )}
      {brand ? (
        <BrandUpdate
          key={brand.updatedAt}
          brand={brand}
          vehicleTypes={vehicleTypesResult.data ?? []}
          dashboardPath={dashboardPath}
        />
      ) : (
        <BrandCreate vehicleTypes={vehicleTypesResult.data ?? []} dashboardPath={dashboardPath} />
      )}
    </div>
  );
};

export const CreateBrandPage = ({ dashboardPath }: { dashboardPath: string }) => (
  <div className="mx-auto max-w-3xl p-2 md:p-5">
    <Suspense fallback={<FormSkeleton />}>
      <BrandEditor dashboardPath={dashboardPath} />
    </Suspense>
  </div>
);

export const BrandDetailPage = async ({
  params,
  dashboardPath,
}: {
  params: Promise<{ brandId: string }>;
  dashboardPath: string;
}) => {
  const { brandId } = await params;

  return (
    <div className="mx-auto max-w-3xl p-2 md:p-5">
      <Suspense fallback={<FormSkeleton />}>
        <BrandEditor brandId={brandId} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

// ============================================
// Vehicle models
// ============================================

export const VehicleModelsListPage = async ({ searchParams, dashboardPath }: ListPageProps) => (
  <div className="flex flex-col gap-4 p-2 md:p-5">
    <Suspense fallback={<VehicleModelLoadingTable />}>
      <VehicleModelTable searchParams={await searchParams} dashboardPath={dashboardPath} />
    </Suspense>
  </div>
);

const VehicleModelEditor = async ({
  vehicleModelId,
  dashboardPath,
}: {
  vehicleModelId?: string;
  dashboardPath: string;
}) => {
  const [modelResult, vehicleTypesResult, brandsResult] = await Promise.all([
    vehicleModelId ? getVehicleModelByIdAction(vehicleModelId) : Promise.resolve(null),
    getAllVehicleTypesAction({ admin: true }),
    getAllBrandsAction({ admin: true, query: { limit: "100" } }),
  ]);

  if (modelResult && (!modelResult.success || !modelResult.data)) {
    return <CatalogError title="Failed to load model" message={modelResult.message} />;
  }

  if (!vehicleTypesResult.success || !brandsResult.success) {
    return (
      <CatalogError
        title="Failed to load the catalog"
        message={vehicleTypesResult.message || brandsResult.message}
      />
    );
  }

  const vehicleModel = modelResult?.data ?? undefined;

  return (
    <div className="space-y-6">
      {vehicleModel && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            <TableBackButton />
            {vehicleModel.brand.name} {vehicleModel.name}
          </h2>
          <VehicleModelDelete
            id={vehicleModel.id}
            name={`${vehicleModel.brand.name} ${vehicleModel.name}`}
            showLabel
            redirectTo={`${dashboardPath}/vehicle-models`}
          />
        </div>
      )}
      {vehicleModel ? (
        <VehicleModelUpdate
          key={vehicleModel.updatedAt}
          vehicleModel={vehicleModel}
          vehicleTypes={vehicleTypesResult.data ?? []}
          brands={brandsResult.data ?? []}
          dashboardPath={dashboardPath}
        />
      ) : (
        <VehicleModelCreate
          vehicleTypes={vehicleTypesResult.data ?? []}
          brands={brandsResult.data ?? []}
          dashboardPath={dashboardPath}
        />
      )}
    </div>
  );
};

export const CreateVehicleModelPage = ({ dashboardPath }: { dashboardPath: string }) => (
  <div className="mx-auto max-w-4xl p-2 md:p-5">
    <Suspense fallback={<FormSkeleton />}>
      <VehicleModelEditor dashboardPath={dashboardPath} />
    </Suspense>
  </div>
);

export const VehicleModelDetailPage = async ({
  params,
  dashboardPath,
}: {
  params: Promise<{ vehicleModelId: string }>;
  dashboardPath: string;
}) => {
  const { vehicleModelId } = await params;

  return (
    <div className="mx-auto max-w-4xl p-2 md:p-5">
      <Suspense fallback={<FormSkeleton />}>
        <VehicleModelEditor vehicleModelId={vehicleModelId} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};
