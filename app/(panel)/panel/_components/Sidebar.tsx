"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiUsers, FiCalendar, FiLogOut, FiInbox, FiBookmark } from "react-icons/fi";

const NAV = [
  { href: "/panel",           label: "Inicio",    icon: FiHome,     exact: true },
  { href: "/panel/reservas",  label: "Reservas",  icon: FiBookmark, exact: false },
  { href: "/panel/clientes",  label: "Clientes",  icon: FiUsers,    exact: false },
  { href: "/panel/agenda",    label: "Agenda",    icon: FiCalendar, exact: false },
  { href: "/panel/leads",     label: "Leads",     icon: FiInbox,    exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function logout() {
    await fetch("/api/panel/auth/logout", { method: "POST" });
    router.push("/panel-login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 z-40 flex w-full shrink-0 flex-col bg-neutral-900 text-white md:min-h-screen md:w-52">
      {/* Marca */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-700 px-4 py-3 md:block md:px-5 md:py-5">
        <p className="font-bold tracking-widest text-sm uppercase">BROWN</p>
        <p className="hidden text-[11px] text-neutral-400 md:mt-0.5 md:block">Piscinas & Jardines</p>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white md:hidden"
        >
          <FiLogOut size={14} />
          Salir
        </button>
      </div>

      {/* Nav */}
      <nav className="flex gap-1 overflow-x-auto px-3 py-2 md:block md:flex-1 md:space-y-1 md:overflow-visible md:py-4">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-white text-black font-semibold"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="hidden border-t border-neutral-700 px-3 py-4 md:block">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg w-full transition-colors"
        >
          <FiLogOut size={15} />
          Salir
        </button>
      </div>
    </aside>
  );
}
