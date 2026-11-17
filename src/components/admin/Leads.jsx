import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Plus, Pencil, Trash2, Filter, UploadCloud,
  Users, Mail, Globe, Star, MapPin, ExternalLink, X, Eye, Columns3, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import leadService from "../../services/leadService";
import Modal from "../common/Modal";
import ConfirmDialog from "../common/ConfirmDialog";
import LeadForm from "./LeadForm";
import StatCard from "../common/StatCard";
import SelectField from "../common/SelectField";
import useAuthStore from "../../store/authStore";
import { getLeadTimeZone } from "../../data/LeadTimeZone";

// Values that should NOT be treated as a real website/email.
const INVALID_VALUES = new Set([
  "", "n/a", "na", "none", "null", "undefined",
  "not found", "not available", "no website", "no", "-", "—",
]);

const hasWebsite = (website) => {
  if (!website) return false;
  const value = String(website).trim().toLowerCase();
  if (INVALID_VALUES.has(value)) return false;
  return (
    value.includes(".") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("www.")
  );
};

const getWebsiteUrl = (website) => {
  if (!hasWebsite(website)) return null;
  let url = String(website).trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const hasEmail = (email) => {
  if (!email) return false;
  const value = String(email).trim().toLowerCase();
  return !INVALID_VALUES.has(value) && value.includes("@");
};

const COLUMN_OPTIONS = [
  { key: "business", label: "Business / Sector" },
  { key: "contact", label: "Contact" },
  { key: "timezone", label: "Time Zone" },
  { key: "rating", label: "Rating / Review" },
  { key: "score", label: "Score" },
  { key: "website", label: "Website" },
  { key: "source", label: "Source" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

const DEFAULT_VISIBLE_COLUMNS = COLUMN_OPTIONS.map(
  (column) => column.key
);

function OwnLeads({ scope = "my", setScope, isAdmin, initialStatus = "all" }) {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [domainFilter, setDomainFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const [columnsOpen, setColumnsOpen] = useState(false);
  const columnsRef = useRef(null);

  // Close the Choose Fields dropdown when clicking anywhere outside it, or pressing Escape.
  useEffect(() => {
    if (!columnsOpen) return;

    const handlePointer = (event) => {
      if (columnsRef.current && !columnsRef.current.contains(event.target)) {
        setColumnsOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setColumnsOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [columnsOpen]);

  const userId = useAuthStore((state) => state.user?.id);

  const columnStorageKey = `lead-table-columns-${userId || "default"}`;

  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(
        `lead-table-columns-${userId || "default"}`
      );

      if (!saved) {
        return DEFAULT_VISIBLE_COLUMNS;
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return DEFAULT_VISIBLE_COLUMNS;
      }

      return COLUMN_OPTIONS
        .map((column) => column.key)
        .filter((key) => parsed.includes(key));
    } catch {
      return DEFAULT_VISIBLE_COLUMNS;
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuthStore();

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const response = await leadService.getLeads({ scope });

      setLeads(response.leads || response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [scope]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        lead.name?.toLowerCase().includes(searchValue) ||
        lead.email?.toLowerCase().includes(searchValue) ||
        lead.company?.toLowerCase().includes(searchValue) ||
        lead.phone?.toLowerCase().includes(searchValue) ||
        lead.address?.toLowerCase().includes(searchValue) ||
        lead.primaryDomain?.toLowerCase().includes(searchValue) ||
        lead.finalDomain?.toLowerCase().includes(searchValue) ||
        lead.city?.toLowerCase().includes(searchValue) ||
        lead.state?.toLowerCase().includes(searchValue);

      const activeStatuses = ["new", "contacted", "replied", "interested", "meeting_scheduled", "proposal_sent", "negotiation"];
      const matchesStatus = status === "all" || (status === "active" ? activeStatuses.includes(lead.status) : lead.status === status);
      const matchesDomain = domainFilter === "all" || String(lead.domainTypeId || lead.domainType?.id || "") === domainFilter;
      const matchesAssignee = assigneeFilter === "all" || (assigneeFilter === "unassigned" ? !lead.assignedToId : String(lead.assignedToId || lead.assignee?.id || "") === assigneeFilter);

      return matchesSearch && matchesStatus && matchesDomain && matchesAssignee;
    });
  }, [leads, search, status, domainFilter, assigneeFilter]);

  const deleteLead = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await leadService.deleteLead(deleteTarget._id);
      toast.success("Lead deleted successfully");
      setDeleteTarget(null);
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete lead");
    } finally { setDeleting(false); }
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns((current) => {
      // Don't allow the user to hide every column.
      if (
        current.includes(columnKey) &&
        current.length === 1
      ) {
        toast.error("At least one field must remain visible.");
        return current;
      }

      const updated = current.includes(columnKey)
        ? current.filter((key) => key !== columnKey)
        : [...current, columnKey];

      try {
        localStorage.setItem(
          columnStorageKey,
          JSON.stringify(updated)
        );
      } catch {
        // Ignore localStorage errors.
      }

      return updated;
    });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLead(null);
    fetchLeads();
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

  // -------- Quick stats --------
  const totalLeads = leads.length;
  const leadsWithEmail = leads.filter((lead) => hasEmail(lead.email)).length;
  const leadsWithWebsite = leads.filter((lead) => hasWebsite(lead.website)).length;

  return (
    <div className="page-shell w-full min-w-0 max-w-full">
      <div className="flex w-full max-w-full flex-wrap gap-1 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 sm:w-fit">
        {[
          ...(!isAdmin
            ? [
              ['my', 'My Leads'],
              ['uploaded', 'Uploaded By Me'],
            ]
            : []),


          ...(isAdmin
            ? [
              ['all', 'All Leads'],
              ['unassigned', 'Unassigned'],
            ]
            : []),
          ['lost', 'Lost Leads'],
        ].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setScope(v)}
            className={`min-w-0 flex-1 rounded-[8px] px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-3 sm:py-1.5 ${scope === v
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            {label}
          </button>
        ))}
      </div>




      {/* Header */}
      <div className="page-header flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="eyebrow">Pipeline</div><h1 className="page-title">Leads</h1>
          <p className="page-description">
            Manage and track all your potential clients.
          </p>
        </div>


        {user?.role === "super_admin" && (
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <Link
              to="/admin/leads/import"
              className="btn-secondary flex w-full min-w-0 items-center justify-center gap-2 sm:w-auto"
            >
              <UploadCloud size={18} />
              Import Leads
            </Link>

            <button
              onClick={() => {
                setEditingLead(null);
                setShowForm(true);
              }}
              className="btn-primary flex w-full min-w-0 items-center justify-center gap-2 sm:w-auto"
            >
              <Plus size={18} />
              Add Lead
            </button>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <StatCard title="Total Leads" value={loading ? "..." : totalLeads} icon={Users} />
        <StatCard title="With Email" value={loading ? "..." : leadsWithEmail} icon={Mail} />
        <StatCard title="With Website" value={loading ? "..." : leadsWithWebsite} icon={Globe} />
      </div>

      {/* Responsive Filters */}
      <div className="toolbar !w-full !min-w-0 !max-w-full box-border">
        <div className="grid w-full min-w-0 grid-cols-2 items-start gap-2 sm:gap-3 md:grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))]">
          {/* Search is intentionally hidden on phones */}
          <div className="relative col-span-2 hidden min-w-0 md:col-span-1 md:block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="field box-border h-10 w-full min-w-0 !pl-9 pr-9 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="w-full min-w-0">
            <SelectField
              value={status}
              onChange={setStatus}
              className="w-full min-w-0 text-xs sm:text-sm"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active Pipeline" },
                { value: "new", label: "New" },
                { value: "contacted", label: "Contacted" },
                { value: "replied", label: "Replied" },
                { value: "interested", label: "Interested" },
                { value: "meeting_scheduled", label: "Meeting Scheduled" },
                { value: "proposal_sent", label: "Proposal Sent" },
                { value: "negotiation", label: "Negotiation" },
                { value: "won", label: "Won" },
                { value: "lost", label: "Lost" },
              ]}
            />
          </div>

          {/* Domain filter */}
          <div className="w-full min-w-0">
            <SelectField
              value={domainFilter}
              onChange={setDomainFilter}
              className="w-full min-w-0 text-xs sm:text-sm"
              options={[
                { value: "all", label: "All Domains" },
                ...[
                  ...new Map(
                    leads
                      .filter((l) => l.domainType)
                      .map((l) => [String(l.domainType.id), l.domainType])
                  ).values(),
                ].map((d) => ({
                  value: String(d.id),
                  label: d.name,
                })),
              ]}
            />
          </div>

          {/* Assignee filter (admins only) */}
          {isAdmin && (
            <div className="w-full min-w-0">
              <SelectField
                value={assigneeFilter}
                onChange={setAssigneeFilter}
                className="w-full min-w-0 text-xs sm:text-sm"
                options={[
                  { value: "all", label: "All Assignees" },
                  { value: "unassigned", label: "Unassigned" },
                  ...[
                    ...new Map(
                      leads
                        .filter((l) => l.assignee)
                        .map((l) => [String(l.assignee.id), l.assignee])
                    ).values(),
                  ].map((u) => ({
                    value: String(u.id),
                    label: u.name,
                  })),
                ]}
              />
            </div>
          )}

          {/* Choose fields */}
          <div ref={columnsRef} className="relative col-span-2 min-w-0 sm:col-span-1 md:col-span-1">
            <button
              type="button"
              onClick={() => setColumnsOpen((value) => !value)}
              aria-expanded={columnsOpen}
              aria-haspopup="true"
              className="inline-flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:gap-2 sm:px-3 sm:text-sm md:w-full"
            >
              <Columns3 size={15} className="shrink-0" />
              <span className="truncate">Choose Fields</span>
              <ChevronDown
                size={14}
                className={`shrink-0 transition-transform ${columnsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {columnsOpen && (
              <div className="absolute right-0 top-11 z-50 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:top-12">
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Choose Fields
                  </p>
                  <p className="text-xs text-slate-500">
                    Select fields to display in the table
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto py-1 sm:max-h-80">
                  {COLUMN_OPTIONS.map((column) => (
                    <label
                      key={column.key}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column.key)}
                        onChange={() => toggleColumn(column.key)}
                        className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="break-words text-sm text-slate-700 dark:text-slate-200">
                        {column.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="data-card w-full min-w-0 max-w-full overflow-hidden">

        <div className="table-scroll w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
          <table className="data-table leads-table w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-800/50">
                {/* <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">Business / Sector</th> */}
                {visibleColumns.includes("business") && (
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">
                    Business / Sector
                  </th>
                )}
                {visibleColumns.includes("contact") && (
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">
                    Contact
                  </th>
                )}
                {visibleColumns.includes("timezone") && (
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">
                    Time Zone
                  </th>
                )}
                {visibleColumns.includes("rating") && (
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">
                    Rating / Review
                  </th>
                )}
                {visibleColumns.includes("score") && (
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">
                    Score
                  </th>
                )}
                {visibleColumns.includes("website") && (
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">
                    Website
                  </th>
                )}
                {visibleColumns.includes("source") && (
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">
                    Source
                  </th>
                )}
                {visibleColumns.includes("assignedTo") && (
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">
                    Assigned To
                  </th>
                )}
                {/* {visibleColumns.includes("status") && (
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">
                    Status
                  </th>
                )} */}
                {visibleColumns.includes("status") && (
                  <th className="hidden px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:table-cell">
                    Status
                  </th>
                )}
                {/* {visibleColumns.includes("actions") && (
                  <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                )} */}
                {visibleColumns.includes("actions") && (
                  <th className="whitespace-nowrap px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-4">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={Math.max(visibleColumns.length, 1)} className="px-6 py-16 text-center text-sm text-slate-500">
                    Loading leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(visibleColumns.length, 1)} className="px-6 py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <Search size={20} className="text-slate-400" />
                      </div>
                      <p className="font-medium">No leads found</p>
                      <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const websiteUrl = getWebsiteUrl(lead.website);
                  const tz = getLeadTimeZone(lead);

                  return (
                    <tr
                      key={lead._id}
                      onClick={() => navigate(`/admin/leads/${lead._id}`)}
                      className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      {/* Business */}
                      {visibleColumns.includes("business") && (
                        <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                              {lead.name?.charAt(0)?.toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-medium" title={lead.name}>{lead.name}</p>
                              {lead.company && (
                                <p className="truncate text-xs text-slate-500" title={lead.company}>{lead.company}</p>
                              )}
                              {(lead.primaryDomain || lead.finalDomain) && (
                                <p className="truncate text-xs font-medium text-indigo-500" title={[lead.primaryDomain, lead.finalDomain].filter(Boolean).join(" / ")}>{[lead.primaryDomain, lead.finalDomain].filter(Boolean).join(" / ")}</p>
                              )}
                              {lead.address && (
                                <p className="mt-0.5 flex min-w-0 items-start gap-1 text-xs text-slate-400">
                                  <MapPin size={11} className="mt-0.5 shrink-0" />
                                  <span className="truncate" title={lead.address}>{lead.address}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Contact */}
                      {visibleColumns.includes("contact") && (
                        <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4">
                          <div className="min-w-0 space-y-1 text-sm">
                            {lead.phone && (
                              <p className="truncate text-slate-600 dark:text-slate-300">{lead.phone}</p>
                            )}
                            {hasEmail(lead.email) ? (
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400" title={lead.email}>{lead.email}</p>
                            ) : (
                              <p className="text-xs text-slate-400">No email</p>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Time Zone (derived from the lead's address) */}
                      {visibleColumns.includes("timezone") && (
                        <td className="whitespace-nowrap px-3 py-3 text-sm sm:px-4 sm:py-4">
                          {tz ? (
                            <div title={tz.title}>
                              <p className="font-semibold text-slate-700 dark:text-slate-200">{tz.offset}</p>
                              <p className="text-xs text-slate-400">{tz.city}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      )}

                      {/* Rating / Review */}
                      {visibleColumns.includes("rating") && (
                        <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4">
                          {lead.googleRating ? (
                            <div>
                              <div className="flex items-center gap-1">
                                <Star size={14} className="fill-current text-amber-500 shrink-0" />
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {lead.googleRating}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">{lead.googleReviewCount || 0} reviews</span>
                              {lead.reviewSentiment && (
                                <span className={`mt-1 block w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${lead.reviewSentiment === "bad" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" : lead.reviewSentiment === "good" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{lead.reviewSentiment}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">No rating</span>
                          )}
                        </td>
                      )}

                      {/* Lead Score */}
                      {visibleColumns.includes("score") && (
                        <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4">
                          {lead.leadScore !== null && lead.leadScore !== undefined ? (
                            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                              {lead.leadScore}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>
                      )}

                      {/* Website */}
                      {visibleColumns.includes("website") && (
                        <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4">
                          {websiteUrl ? (
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                            >
                              <Globe size={13} />
                              Visit
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              <Globe size={13} />
                              None
                            </span>
                          )}
                        </td>
                      )}

                      {/* Source */}
                      {visibleColumns.includes("source") && (
                        <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{lead.source || "—"}</p>
                          <p className="text-xs text-slate-400">{({ manual: "Manual", excel_import: "Excel", api_import: "API", public_form: "Public form" })[lead.creationMethod] || lead.creationMethod || "—"}</p>
                        </td>
                      )}

                      {visibleColumns.includes("assignedTo") && (
                        <td className="whitespace-nowrap px-3 py-3 text-sm sm:px-4 sm:py-4"><div className="font-medium">{lead.assignee?.name || "Unassigned"}</div><div className="text-xs text-slate-400">{lead.domainType?.name || "No domain"}</div></td>
                      )}

                      {/* Status */}
                      {/* {visibleColumns.includes("status") && (
                        <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles[lead.status] || statusStyles.new
                              }`}
                          >
                            {(lead.status || "new").replace(/_/g, " ")}
                          </span>
                        </td>
                      )} */}
                      {visibleColumns.includes("status") && (
                        <td className="hidden px-4 py-4 sm:table-cell">
                          <span
                            className={`inline-block rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles[lead.status] || statusStyles.new
                              }`}
                          >
                            {(lead.status || "new").replace(/_/g, " ")}
                          </span>
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.includes("actions") && (
                        // <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4">
                        <td className="whitespace-nowrap px-3 py-3 sm:px-4 sm:py-4">
                          <div className="flex justify-end gap-1">

                            {/* view button  */}

                            <button
                              onClick={() => navigate(`/admin/leads/${lead._id}`)}
                              title="View"

                              className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700  rounded-md hover:bg-gray-50 transition"
                            >
                              <Eye size={17} />
                              {/* View */}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingLead(lead);
                                setShowForm(true);
                              }}
                              title="Edit"
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                            >
                              <Pencil size={17} />
                            </button>

                            {isAdmin && (<button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(lead);
                              }}
                              title="Delete"
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                            >
                              <Trash2 size={17} />
                            </button>)}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Footer */}
        {!loading && (
          <div className="border-t border-slate-200 px-3 py-3 text-xs text-slate-500 dark:border-slate-800 sm:px-6 sm:py-4 sm:text-sm">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredLeads.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{leads.length}</span>{" "}
            leads
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingLead(null);
        }}
        title={editingLead ? "Edit Lead" : "Add New Lead"}
        size="lg"
      >
        <LeadForm
          lead={editingLead}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingLead(null);
          }}
        />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={deleteLead} busy={deleting} danger title="Delete lead" confirmLabel="Delete lead" description={`Delete ${deleteTarget?.name || 'this lead'}? This action cannot be undone and is available only to Admin/Super Admin.`} />
    </div>
  );
}


function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = ["super_admin", "admin"].includes(user?.role);

  // Super admin has no personal "My Leads" view, so plain /admin/leads
  // IS the all-leads view for them (no ?scope=all needed in the URL).
  const defaultScope = isSuperAdmin ? "all" : "my";
  const scope = searchParams.get("scope") || defaultScope;
  const initialStatus = searchParams.get("status") || "all";

  return (
    <OwnLeads
      scope={scope}
      initialStatus={initialStatus}
      isAdmin={isAdmin}
      setScope={(v) => {
        const next = new URLSearchParams(searchParams);
        // The default tab keeps the URL clean: /admin/leads
        if (v === defaultScope) next.delete("scope");
        else next.set("scope", v);
        setSearchParams(next);
      }}
    />
  );
}

export default Leads;