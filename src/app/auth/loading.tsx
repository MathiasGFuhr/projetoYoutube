import { LoadingSpinner } from "@/shared/components/feedback/loading-spinner";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <LoadingSpinner size="lg" label="Carregando..." />
    </div>
  );
}
