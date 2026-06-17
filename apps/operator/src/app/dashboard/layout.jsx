"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bus, MapPin, CalendarDays, Ticket,
  BarChart2, Settings, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { useOperatorAuth } from "@/context/OperatorAuthContext";

const NAV = [
  { label: "Dashboard", href: "/dashboard",          icon: LayoutDashboard },
  { label: "Buses",     href: "/dashboard/buses",    icon: Bus },
  { label: "Routes",    href: "/dashboard/routes",   icon: MapPin },
  { label: "Trips",     href: "/dashboard/trips",    icon: CalendarDays },
  { label: "Bookings",  href: "/dashboard/bookings", icon: Ticket },
  { label: "Reports",   href: "/dashboard/reports",  icon: BarChart2 },
  { label: "Settings",  href: "/dashboard/settings", icon: Settings },
];

function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { operator, logout } = useOperatorAuth();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bus size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">NexaBus Operator</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={17} className={active ? "text-blue-600" : "text-gray-400"} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto text-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Operator info + logout */}
      <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0">
        {operator && (
          <div className="mb-3 px-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{operator.companyName || operator.name}</p>
            <p className="text-[11px] text-gray-400 truncate">{operator.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-60 flex flex-col">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bus size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">NexaBus Operator</span>
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
