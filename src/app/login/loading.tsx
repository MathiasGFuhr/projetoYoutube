import { LoadingSpinner } from "@/shared/components/feedback/loading-spinner";

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <LoadingSpinner size="lg" />
    </div>
  );
}
