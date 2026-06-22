import { redirect } from "next/navigation";
import { getSession } from "../../lib/panel/auth";
import { Sidebar } from "./panel/_components/Sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/panel-login");

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 font-sans md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
