import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Search, Filter, Mail, User, CalendarDays, Clock3,
  FileText, Bell, TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

import adminService from "../../services/adminService";
import StatCard from "../common/StatCard";
import SelectField from "../common/SelectField";

const STATUSES = [
  "new", "contacted", "replied", "interested", "meeting_scheduled",
  "proposal_sent", "negotiation", "won", "lost",
];

const statusBarColors = {
  new: "bg-blue-500",
  contacted: "bg-indigo-500",
  replied: "bg-cyan-500",
  interested: "bg-purple-500",
  meeting_scheduled: "bg-orange-500",
  proposal_sent: "bg-yellow-500",
  negotiation: "bg-pink-500",
  won: "bg-green-500",
  lost: "bg-red-500",
};

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

function SuperAdminUserDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await adminService.getUserProfile(companyId);
      setUser(response.company);
      setStats(response.stats);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load user");
      navigate("/admin/users");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchLeads = async (params = {}) => {
    try {
      setLoadingLeads(true);
      const response = await adminService.getUserLeads(companyId, params);
      setLeads(response.leads || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load leads");
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLeads({
        search: search || undefined,
        status: status === "all" ? undefined : status,
      });
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, search, status]);

  const filteredCount = leads.length;

  const statusBreakdown = stats?.statusBreakdown || {};
  const totalStatusCount = useMemo(
    () => Object.values(statusBreakdown).reduce((sum, n) => sum + n, 0) || 1,
    [statusBreakdown]
  );

  if (loadingProfile) {
    return <div className="page-shell"><div className="data-card empty-state">Loading user details…</div></div>;
  }

  if (!company) return null;

  return (
    <div className="page-shell">
      <button
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} />
        Back to Users
      </button>

      {/* User header */}
      <div className="data-card p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {company.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{company.name}</h1>
              {company.companyDescription && (
                <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                  {company.companyDescription}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <User size={14} />
              {company.name}
            </span>
            <span className="flex items-center gap-2">
              <Mail size={14} />
              {company.email}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays size={14} />
              Joined {formatDateTime(company.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={stats?.total ?? 0} icon={User} />
        <StatCard title="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} icon={TrendingUp} />
        <StatCard title="Notes Logged" value={stats?.notesCount ?? 0} icon={FileText} />
        <StatCard title="Follow-ups Logged" value={stats?.followUpsCount ?? 0} icon={Bell} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status breakdown */}
        <div className="data-card p-5">
          <h2 className="font-bold">Status Breakdown</h2>
          <div className="mt-5 space-y-3">
            {STATUSES.map((key) => {
              const count = statusBreakdown[key] || 0;
              const pct = Math.round((count / totalStatusCount) * 100);
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-slate-500 dark:text-slate-400">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${statusBarColors[key] || "bg-slate-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sources */}
        <div className="data-card p-5 lg:col-span-2">
          <h2 className="font-bold">Lead Sources</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats?.sources?.length ? (
              stats.sources.map((s) => (
                <div
                  key={s.source}
                  className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.source || "Unknown"}</p>
                  <p className="mt-1 text-lg font-semibold">{s.count}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No source data yet.</p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-6 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Clock3 size={14} />
              First lead: {formatDateTime(stats?.firstLeadAt)}
            </span>
            <span className="flex items-center gap-2">
              <Clock3 size={14} />
              Last activity: {formatDateTime(stats?.lastActivityAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Leads list */}
      <div className="data-card">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search this user's leads..."
              className="field w-full !pl-10"
            />
          </div>

          <div className="relative">
            <Filter size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <SelectField value={status} onChange={setStatus} className="w-52" options={[{value:'all',label:'All statuses'},...STATUSES.map(x=>({value:x,label:x.replace(/_/g,' ')}))]}/>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>

          <tbody>
            {loadingLeads ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-sm text-slate-500">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-sm text-slate-500">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead._id}
                  onClick={() => navigate(`/admin/users/${companyId}/leads/${lead._id}`)}
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

        {!loadingLeads && (
          <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-500 dark:border-slate-800">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredCount}</span> leads
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminUserDetail;
