import Image from "next/image";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { IHomeBrand } from "@/types";
import { HomeSectionMessage, THomeDataPromise } from "./HomeSection";

function BrandMark({ brand }: { brand: IHomeBrand }) {
  if (brand.logoUrl) {
    return (
      <Image
        src={brand.logoUrl}
        alt=""
        width={96}
        height={40}
        sizes="96px"
        className="h-10 w-auto max-w-24 object-contain dark:brightness-0 dark:invert"
      />
    );
  }

  // no logo uploaded yet: a monogram in the brand colour slot
  return (
    <span
      aria-hidden="true"
      className="flex size-10 items-center justify-center rounded-full bg-muted font-heading text-sm font-bold tracking-wide text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground"
    >
      {brand.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

const BrowseByBrand = async ({ data }: { data: THomeDataPromise }) => {
  const result = await data;

  if (!result.success || !result.data) {
    return <HomeSectionMessage>Brands are unavailable right now.</HomeSectionMessage>;
  }

  const brands = result.data.brands;

  if (brands.length === 0) {
    return <HomeSectionMessage>Brands will appear once the catalog is set up.</HomeSectionMessage>;
  }

  return (
    <Stagger as="ul" stagger={0.04} className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {brands.map((brand) => (
        <StaggerItem as="li" key={brand.id}>
          <Link
            href={`/listings?brand=${encodeURIComponent(brand.slug)}`}
            className="group flex h-full flex-col items-center justify-center gap-2 rounded-2xl border bg-card px-2 py-4 text-center shadow-card transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-elevated active:scale-[0.98] motion-reduce:hover:translate-y-0"
          >
            <BrandMark brand={brand} />
            <span className="text-sm font-semibold leading-tight">{brand.name}</span>
            <span className="text-xs text-muted-foreground">
              {brand.count > 0 ? `${brand.count.toLocaleString("en-US")} live` : "No listings yet"}
            </span>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
};

export default BrowseByBrand;
