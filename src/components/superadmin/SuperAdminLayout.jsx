import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, LogOut, X, Menu, ShieldCheck,User2, Target,} from "lucide-react";

import ThemeToggle from "../common/ThemeToggle";
import useAuthStore from "../../store/authStore";

const links = [
  { name: "Overview", path: "/super-admin", icon: LayoutDashboard, end: true },
  { name: "Users", path: "/super-admin/companies", icon: Building2 },
  {name:"Leads",path:"/super-admin/leads",icon:Target},
  {name:"Register User",path:"/super-admin/register",icon:User2},
];

function SuperAdminSidebar({ isOpen, onClose }) {
  const { logout } = useAuthStore();

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-900/50 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-300 ease-in-out lg:z-40 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h1 className="font-bold">BizHynt</h1>
              <p className="text-xs text-slate-400">Platform Admin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </p>

          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-slate-300 hover:bg-slate-800"
                    }`
                  }
                >
                  <Icon size={19} />
                  {link.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-800 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function SuperAdminNavbar({ onMenuClick }) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">Platform Admin</h2>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            Every registered users, in one place
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-700 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SuperAdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        <SuperAdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
