import { Suspense } from "react";
import { getHomeDataAction } from "./_actions/homeActions";
import BrowseByBrand from "./_components/HomePage/BrowseByBrand";
import BrowseByCategory from "./_components/HomePage/BrowseByCategory";
import FeaturedListings from "./_components/HomePage/FeaturedListings";
import {
  BrandGridLoading,
  CategoryGridLoading,
  FeaturedListingsLoading,
  ListingGridLoading,
  StatsLoading,
} from "./_components/HomePage/HomeLoading";
import { HomeSection } from "./_components/HomePage/HomeSection";
import HowItWorks from "./_components/HomePage/HowItWorks";
import LatestListings from "./_components/HomePage/LatestListings";
import SellCTA from "./_components/HomePage/SellCTA";
import StatsSection from "./_components/HomePage/StatsSection";
import TrustSection from "./_components/HomePage/TrustSection";
import Hero from "./_components/HomePage/hero/Hero";

/*
 * Public homepage.
 * The hero renders at once; every data section streams in behind its own skeleton.
 * One /search/home request feeds stats, featured, categories and brands
 * (the promise is started here and awaited inside each section).
 */
const HomePage = () => {
  const homeData = getHomeDataAction();

  return (
    <div className="space-y-20 pb-20 sm:space-y-24">
      <Hero />

      <div className="mx-auto -mt-12 max-w-7xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
        <Suspense fallback={<StatsLoading />}>
          <StatsSection data={homeData} />
        </Suspense>
      </div>

      <HomeSection
        id="featured"
        title="Featured bikes"
        description="Popular right now, from trusted sellers"
        link={{ href: "/listings", label: "Browse all" }}
      >
        <Suspense fallback={<FeaturedListingsLoading />}>
          <FeaturedListings data={homeData} />
        </Suspense>
      </HomeSection>

      <HomeSection id="categories" title="Browse by category" description="From daily commuters to weekend tourers">
        <Suspense fallback={<CategoryGridLoading />}>
          <BrowseByCategory data={homeData} />
        </Suspense>
      </HomeSection>

      <HomeSection id="brands" title="Popular brands" description="Shop by the names riders trust">
        <Suspense fallback={<BrandGridLoading />}>
          <BrowseByBrand data={homeData} />
        </Suspense>
      </HomeSection>

      <HomeSection id="how-it-works" title="How it works" description="Simple for buyers and sellers">
        <HowItWorks />
      </HomeSection>

      <HomeSection
        id="latest"
        title="Latest listings"
        description="Fresh from owners and dealers"
        link={{ href: "/listings?sortBy=newest", label: "View all" }}
      >
        <Suspense fallback={<ListingGridLoading />}>
          <LatestListings />
        </Suspense>
      </HomeSection>

      <HomeSection id="trust" title="Built for safe deals" description="What keeps buyers and sellers safe">
        <TrustSection />
      </HomeSection>

      <SellCTA />
    </div>
  );
};

export default HomePage;
