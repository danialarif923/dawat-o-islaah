import { lazy, Suspense } from "react";
import ZikrOAzkar from "./ZikrOAzkar";
import Books from "./Books";

// Lazy load all components
const RecentArticles = lazy(() => import("./RecentArticles"));
const Services = lazy(() => import("./Services"));
const SihahSitta = lazy(() => import("./SihahSitta"));
const DailyVerseHadees = lazy(() => import("./DailyVerseHadees"));

// Create a fallback component for loading states
const LoadingFallback = () => <div>Loading...</div>; // Customize this as needed

const Index = () => {
  return (
    <div className="flex flex-col gap-y-16 py-16 md:py-0 md:gap-y-28 mb-20 ">
      <ZikrOAzkar />

      <Books />

      <Suspense fallback={<LoadingFallback />}>
        <SihahSitta />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <DailyVerseHadees />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Services />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <RecentArticles />
      </Suspense>
    </div>
  );
};

export default Index;
