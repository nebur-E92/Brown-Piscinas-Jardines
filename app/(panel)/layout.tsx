import { redirect } from "next/navigation";
import { getSession } from "../../lib/panel/auth";
import { Sidebar } from "./panel/_components/Sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/panel-login");

  return (
    <div className="flex min-h-screen bg-neutral-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
