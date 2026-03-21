import { Loading } from "@/components/ui/Loading";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading label="読み込み中..." />
    </div>
  );
}
