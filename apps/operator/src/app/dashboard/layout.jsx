"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bus, MapPin, CalendarDays, Ticket,
  Users, BarChart2, Settings, LogOut, Menu, X, Bell, ChevronRight,
} from "lucide-react";
import { useOperatorAuth } from "@/context/OperatorAuthContext";

const NAV = [
  { label: "Dashboard", href: "/dashboard",           icon: LayoutDashboard },
  { label: "Buses",     href: "/dashboard/buses",     icon: Bus },
  { label: "Routes",    href: "/dashboard/routes",    icon: MapPin },
  { label: "Trips",     href: "/dashboard/trips",     icon: CalendarDays },
  { label: "Bookings",  href: "/dashboard/bookings",  icon: Ticket },
  { label: "Reports",   href: "/dashboard/reports",   icon: BarChart2 },
  { label: "Settings",  href: "/dashboard/settings",  icon: Settings },
];

function NavItem({ item, collapsed, onClick }) {
  const pathname = usePathname();
  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
        active
          ? "bg-brand/10 text-white border-l-2 border-brand"
          : "text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
      }`}
    >
      <Icon size={18} className={active ? "text-brand flex-shrink-0" : "flex-shrink-0"} />
      {!collapsed && <span>{item.label}</span>}
      {!collapsed && active && <ChevronRight size={14} className="ml-auto text-brand" />}
    </Link>
  );
}

function Sidebar({ collapsed, onClose }) {
  const { operator, logout } = useOperatorAuth();
  const initials = (operator?.companyName || operator?.name || "OP").slice(0, 2).toUpperCase();

  return (
    <div className={`flex flex-col h-full bg-slate-800 transition-all ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-700 flex-shrink-0">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
          <Bus size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-bold text-white text-sm block truncate">NexaBus</span>
            <span className="text-[10px] text-brand font-semibold uppercase tracking-wider">Operator</span>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Operator info */}
      {!collapsed && operator && (
        <div className="px-4 py-3 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{operator.companyName || operator.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{operator.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed} onClick={onClose} />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-slate-700 flex-shrink-0">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { operator } = useOperatorAuth();
  const pathname = usePathname();

  const pageTitle = NAV.find((n) =>
    n.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(n.href)
  )?.label || "Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0">
        <Sidebar collapsed={collapsed} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-60">
            <Sidebar collapsed={false} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 flex-shrink-0 h-14 flex items-center px-4 gap-3">
          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
            <Menu size={22} />
          </button>
          {/* Desktop collapse */}
          <button onClick={() => setCollapsed((c) => !c)} className="hidden lg:block text-slate-400 hover:text-slate-600">
            <Menu size={20} />
          </button>
          <h1 className="font-semibold text-slate-800 text-base flex-1">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
            </button>
            {operator && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
                  {(operator.companyName || operator.name || "OP").slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {operator.companyName || operator.name}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
