

import { LayoutDashboard, Users, BarChart3, LogOut, X, UploadCloud, Target, Building2, Layers3, UsersRound, BadgeCheck, ScrollText, Share2, FileText } from "lucide-react";

import { NavLink, Link } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import logo from "../../assets/logo_transparent.png";

const baseLinks = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Leads", path: "/admin/leads", icon: Target },
  { name: "Customers", path: "/admin/customers", icon: BadgeCheck },
  { name: "Domain Types", path: "/admin/domains", icon: Layers3 },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Profile", path: "/admin/profile", icon: Users },
];
const adminLinks=[{name:"Social Media",icon:Share2,children:[{name:"Customers",path:"/admin/social-media-customers",icon:BadgeCheck},{name:"Social Media Platforms",path:"/admin/social-media/platforms",icon:Share2},{name:"Business Categories",path:"/admin/social-media/business-categories",icon:Layers3},{name:"Terms & Conditions",path:"/admin/social-media/terms",icon:FileText}]},{name:"Teams",path:"/admin/teams",icon:UsersRound},{name:"Users",path:"/admin/users",icon:Building2},{name:"Activity Logs",path:"/admin/activity",icon:ScrollText}];

function Sidebar({ isOpen = false, onClose = () => { } }) {
  // const { logout, user } = useAuthStore();
  // const isAdmin = user?.role === "admin"; const isSuperAdmin = user?.role === "super_admin"; // Base links are available to all users. 
  // let links = [...baseLinks]; // Admin and Super Admin get additional links, including Files. 
  // if (isAdmin || isSuperAdmin) { links = [...baseLinks, ...adminLinks]; } // Super Admin opens the all-leads view.
  //  links = links.map((link) => link.name === "Leads" && isSuperAdmin ? { ...link, to: "/admin/leads" } : link );

  const { logout, user } = useAuthStore();

  const isAdmin = user?.role === "admin";
  const isSuperAdmin = user?.role === "super_admin";

  const links =
    isAdmin || isSuperAdmin
      ? [...baseLinks, ...adminLinks]
      : [...baseLinks];

  const finalLinks = links.map((link) =>
    link.name === "Leads" && isSuperAdmin
      ? { ...link, to: "/admin/leads" }
      : link
  );
  return (
    <>
      {/* Mobile backdrop — click to close the drawer */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`
          fixed inset-0
          z-40
          bg-slate-900/50
          transition-opacity
          lg:hidden
          ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}
        `}
      />

      <aside className={`
        fixed left-0 top-0
        z-50 flex h-screen
        w-64 flex-col
        border-r
        border-slate-200
        bg-white
        transition-transform duration-300 ease-in-out
        dark:border-slate-800
        dark:bg-slate-900
        lg:z-40 lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >

        <div className="
          flex h-20 shrink-0
          items-center justify-between
          border-b
          border-slate-200
          px-6
          dark:border-slate-800
        ">
          <div className="
            flex items-center gap-3
          ">
            <div className="
              flex h-10 w-10
              shrink-0
              items-center justify-center
              rounded-xl
              font-bold text-white
            ">
              {/* <Handshake size={20} /> */}
              <img src={logo} alt="BizHynt" />
            </div>

            <div>
              <h1 className="
                font-bold
              ">
                <Link to="/admin/dashboard">BizHynt</Link>

              </h1>

              <p className="
                text-xs
                text-slate-500
                dark:text-slate-400
              ">
                Client CRM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              text-slate-500
              hover:bg-slate-100
              dark:text-slate-400
              dark:hover:bg-slate-800
              lg:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* <nav className="flex-1 overflow-y-auto p-4"> */}
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <p className="
          mb-3 px-3
          text-xs font-semibold
          uppercase tracking-wider
          text-slate-400
        ">
            Menu
          </p>

        <div className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            if (link.children) return <details key={link.name} className="group rounded-xl" open={link.children.some(x=>location.pathname.startsWith(x.path))}>
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Icon size={19}/>{link.name}<span className="ml-auto text-xs">▾</span></summary>
              <div className="ml-4 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-700">{link.children.map(child=>{const ChildIcon=child.icon;return <NavLink key={child.path} to={child.path} onClick={onClose} className={({isActive})=>`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${isActive?'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400':'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><ChildIcon size={16}/>{child.name}</NavLink>})}</div>
            </details>;

              return (
                <NavLink
                  key={link.path}
                  to={link.to || link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `
                  flex items-center gap-3
                  rounded-xl px-3 py-3
                  text-sm font-medium
                  transition
                  ${isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }
                  `
                  }
                >
                  <Icon size={19} />

                  {link.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="
        shrink-0
        border-t
        border-slate-200
        p-4
        dark:border-slate-800
      ">
          <button
            onClick={logout}
            className="
            flex w-full
            items-center gap-3
            rounded-xl px-3 py-3
            text-sm font-medium
            text-red-500
            transition
            hover:bg-red-50
            dark:hover:bg-red-500/10
          "
          >
            <LogOut size={19} />

            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;