import { PageLoader } from "@/shared/components/feedback/loading-spinner";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <PageLoader />
    </div>
  );
}
