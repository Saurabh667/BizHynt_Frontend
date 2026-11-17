import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Breadcrumbs from "../common/Breadcrumbs";
function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div
      className="
        flex h-screen overflow-hidden
        bg-slate-100
        text-slate-900
        dark:bg-slate-950
        dark:text-slate-100
      "
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className="
          flex min-w-0 flex-1 flex-col
          lg:ml-64
        "
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main
          className="
            min-h-0
            min-w-0
            flex-1
            overflow-y-auto
            overscroll-contain
            p-4 sm:p-6 lg:p-8
          "
        >
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;