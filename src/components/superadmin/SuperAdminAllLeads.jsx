
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Filter, Building2, Users, TrendingUp, CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import adminService from "../../services/adminService";
import StatCard from "../common/StatCard";

const STATUSES = [
  "new", "contacted", "replied", "interested", "meeting_scheduled",
  "proposal_sent", "negotiation", "won", "lost",
];

const SOURCES = ["Website", "LinkedIn", "WhatsApp", "Email", "Referral", "Other"];

const statusStyles = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  contacted: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  replied: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  interested: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  meeting_scheduled: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  proposal_sent: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  negotiation: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  won: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  lost: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function SuperAdminAllLeads() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [companyId, setCompanyId] = useState("all");

  // Companies list, used only to populate the company filter dropdown.
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await adminService.getCompanies();
        setCompanies(response.companies || []);
      } catch {
        // Non-critical — the page still works without the filter options.
      }
    };

    fetchCompanies();
  }, []);

  const fetchLeads = async (params = {}) => {
    try {
      setLoading(true);
      const response = await adminService.getAllLeads(params);
      setLeads(response.leads || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLeads({
        search: search || undefined,
        status: status === "all" ? undefined : status,
        source: source === "all" ? undefined : source,
        companyId: companyId === "all" ? undefined : companyId,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, status, source, companyId]);

  const stats = useMemo(() => {
    const total = leads.length;
    const won = leads.filter((l) => l.status === "won").length;
    const lost = leads.filter((l) => l.status === "lost").length;
    const companiesRepresented = new Set(leads.map((l) => l.companyId)).size;

    return { total, won, lost, companiesRepresented };
  }, [leads]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">All Leads</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Every lead registered across every user on the platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={stats.total} icon={Users} />
        <StatCard title="Won" value={stats.won} icon={CheckCircle2} />
        <StatCard title="Lost" value={stats.lost} icon={TrendingUp} />
        <StatCard title="Users Represented" value={stats.companiesRepresented} icon={Building2} />
      </div>

      {/* Leads list */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by name, email or company..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="relative">
            <Building2 size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-8 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 lg:w-56"
            >
              <option value="all">All Teams</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-8 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 lg:w-48"
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 lg:w-40"
            >
              <option value="all">All sources</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">User Team</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-sm text-slate-500">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-sm text-slate-500">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/super-admin/companies/${lead.companyId}/leads/${lead._id}`)}
                    className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                          {lead.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{lead.name}</p>
                          {lead.company && (
                            <p className="truncate text-xs text-slate-500">{lead.company}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                      {lead.companyName || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                      {lead.email || lead.phone || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{lead.source || "—"}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                          statusStyles[lead.status] || statusStyles.new
                        }`}
                      >
                        {(lead.status || "new").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                      {formatDateTime(lead.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-500 dark:border-slate-800">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{leads.length}</span> leads
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminAllLeads;
