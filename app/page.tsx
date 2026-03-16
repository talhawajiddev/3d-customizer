import dynamic from "next/dynamic";

const TableConfiguratorApp = dynamic(
  () => import("@/components/TableConfiguratorApp").then((mod) => mod.TableConfiguratorApp),
  {
    ssr: false,
    loading: () => (
      <main className="flex h-screen items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-400">Loading…</p>
      </main>
    )
  }
);

export default function HomePage() {
  return <TableConfiguratorApp />;
}
