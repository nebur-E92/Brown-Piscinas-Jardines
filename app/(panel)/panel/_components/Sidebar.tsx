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
    <aside className="w-52 shrink-0 bg-neutral-900 text-white flex flex-col min-h-screen">
      {/* Marca */}
      <div className="px-5 py-5 border-b border-neutral-700">
        <p className="font-bold tracking-widest text-sm uppercase">BROWN</p>
        <p className="text-[11px] text-neutral-400 mt-0.5">Piscinas & Jardines</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
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
      <div className="px-3 py-4 border-t border-neutral-700">
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
