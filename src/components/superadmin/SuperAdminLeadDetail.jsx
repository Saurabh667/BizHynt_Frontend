import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Mail, Phone, Building2, Globe, Star, MapPin,
  Clock3, CheckCircle2, Circle, FileText, ExternalLink, Images,
} from "lucide-react";
import toast from "react-hot-toast";

import adminService from "../../services/adminService";

const STATUS_LABELS = {
  new: "NEW",
  contacted: "CONTACTED",
  replied: "REPLIED",
  interested: "INTERESTED",
  meeting_scheduled: "MEETING SCHEDULED",
  proposal_sent: "PROPOSAL SENT",
  negotiation: "NEGOTIATION",
  won: "WON",
  lost: "LOST",
};

const statusStyles = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  contacted: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  replied: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  interested: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  meeting_scheduled: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  proposal_sent: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  negotiation: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  won: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  lost: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

// Spreadsheet "image" columns often hold several URLs in one cell,
// comma-separated. Split and clean them into a plain array.
function parseImageList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function SuperAdminLeadDetail() {
  const { companyId, leadId } = useParams();
  const navigate = useNavigate();

  const [company, setUser] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await adminService.getUserLeadDetail(companyId, leadId);
        setUser(response.company);
        setLead(response.lead);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load lead");
        navigate(`/admin/users/${companyId}`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [companyId, leadId, navigate]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading lead...</p>;
  }

  if (!lead) return null;

  const imageList = [...new Set([...(Array.isArray(lead.imageUrls) ? lead.imageUrls : []), ...parseImageList(lead.imageUrl)])];

  // A single timeline merging notes and follow-ups, oldest first, so
  // the admin can see this lead's entire history in one place.
  const timeline = [
    ...(lead.notes || []).map((n) => ({ type: "note", at: n.createdAt, data: n })),
    ...(lead.followUps || []).map((f) => ({ type: "followUp", at: f.createdAt, data: f })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at));

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(`/admin/users/${companyId}`)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} />
        Back to {company?.companyName || "users"}
      </button>

      {/* Header */}
      <div className="data-card p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {lead.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{lead.name}</h1>
              {lead.company && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lead.company}</p>
              )}
            </div>
          </div>

          <span
            className={`inline-flex items-center self-start rounded-full px-3 py-1.5 text-xs font-bold tracking-wide ${
              statusStyles[lead.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {STATUS_LABELS[lead.status] || lead.status}
          </span>
        </div>
      </div>

      {imageList.length > 0 && (
        <div className="data-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Images size={17} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold">Photos</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({imageList.length})
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {imageList.map((url, index) => (
              <a
                key={`${url}-${index}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
              >
                <img
                  src={url}
                  alt={`${lead.name} ${index + 1}`}
                  onError={(e) => {
                    e.currentTarget.parentElement.style.display = "none";
                  }}
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={`rounded-2xl border p-6 ${lead.reviewSentiment === "bad" ? "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}>
          <h2 className="font-bold">Review Intelligence</h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{lead.reviewSentiment || "Unclassified"}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{lead.currentReview || lead.topComments || "No review text stored."}</p>
        </div>
        <div className="data-card p-5 sm:p-6">
          <h2 className="font-bold">Lead Intelligence</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <InfoRow icon={<Star size={15} />} label="Lead Score" value={lead.leadScore} />
            <InfoRow icon={<Star size={15} />} label="Google Reviews" value={lead.googleReviewCount} />
            <InfoRow icon={<Globe size={15} />} label="Website Status" value={lead.websiteStatus} />
            <InfoRow icon={<Globe size={15} />} label="Page Speed" value={lead.pageSpeed} />
          </div>
        </div>
      </div>

      <div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lead info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="data-card p-5 sm:p-6">
            <h2 className="font-bold">Contact</h2>
            <div className="mt-5 space-y-4">
              <InfoRow icon={<Mail size={15} />} label="Email" value={lead.email} />
              <InfoRow icon={<Phone size={15} />} label="Phone" value={lead.phone} />
              <InfoRow icon={<Building2 size={15} />} label="User" value={lead.company} />
              <InfoRow icon={<MapPin size={15} />} label="Address" value={lead.address} />
              <InfoRow icon={<Building2 size={15} />} label="Primary Domain / Sector" value={lead.primaryDomain} />
              <InfoRow icon={<Building2 size={15} />} label="Final Domain / Sub-sector" value={lead.finalDomain} />
              <InfoRow icon={<MapPin size={15} />} label="Location" value={[lead.city, lead.state, lead.country, lead.pincode].filter(Boolean).join(", ")} />
              <InfoRow
                icon={<Globe size={15} />}
                label="Website"
                value={
                  lead.website ? (
                    <a
                      href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {lead.website}
                      <ExternalLink size={12} />
                    </a>
                  ) : null
                }
              />
              {lead.googleRating != null && (
                <InfoRow
                  icon={<Star size={15} />}
                  label="Google Rating"
                  value={`${lead.googleRating} (${lead.googleReviewCount || 0} reviews)`}
                />
              )}
            </div>
          </div>

          <div className="data-card p-5 sm:p-6">
            <h2 className="font-bold">Lifecycle</h2>
            <div className="mt-5 space-y-4">
              <InfoRow icon={<Clock3 size={15} />} label="Source" value={lead.source} />
              <InfoRow icon={<Clock3 size={15} />} label="Creation Method" value={lead.creationMethod} />
              <InfoRow icon={<Clock3 size={15} />} label="Imported From" value={lead.importedFrom} />
              <InfoRow icon={<Clock3 size={15} />} label="Created" value={formatDateTime(lead.createdAt)} />
              <InfoRow icon={<Clock3 size={15} />} label="Last Updated" value={formatDateTime(lead.updatedAt)} />
              <InfoRow icon={<Clock3 size={15} />} label="Last Contacted" value={formatDateTime(lead.lastContactedAt)} />
              {lead.status === "won" && (
                <InfoRow icon={<Clock3 size={15} />} label="Won At" value={formatDateTime(lead.wonAt)} />
              )}
              {lead.status === "lost" && (
                <>
                  <InfoRow icon={<Clock3 size={15} />} label="Lost At" value={formatDateTime(lead.lostAt)} />
                  <InfoRow icon={<Clock3 size={15} />} label="Lost Reason" value={lead.lostReason} />
                </>
              )}
            </div>
          </div>

          {lead.message && (
            <div className="data-card p-5 sm:p-6">
              <h2 className="font-bold">Original Message</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                {lead.message}
              </p>
            </div>
          )}
        </div>

        {/* Full activity history */}
        <div className="data-card p-5 sm:p-6 lg:col-span-2">
          <h2 className="font-bold">Full Activity History</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Every note and follow-up ever logged on this lead, oldest first.
          </p>

          <div className="mt-6">
            {timeline.length ? (
              <div className="relative space-y-5">
                {timeline.map((item, index) => (
                  <div key={`${item.type}-${item.data.id}`} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          item.type === "note"
                            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                            : item.data.status === "done"
                            ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}
                      >
                        {item.type === "note" ? (
                          <FileText size={16} />
                        ) : item.data.status === "done" ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Circle size={16} />
                        )}
                      </div>
                      {index !== timeline.length - 1 && (
                        <div className="mt-2 w-px flex-1 bg-slate-200 dark:bg-slate-800" />
                      )}
                    </div>

                    <div className="mb-1 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            item.type === "note"
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {item.type === "note" ? "Note" : `Follow-up · ${item.data.status}`}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                          <Clock3 size={13} />
                          {formatDateTime(item.at)}
                        </span>
                      </div>

                      {item.type === "note" ? (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {item.data.text}
                        </p>
                      ) : (
                        <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                          <p>Due {formatDateTime(item.data.dueDate)}</p>
                          {item.data.note && (
                            <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                              {item.data.note}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state border border-dashed border-slate-200 p-10 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No activity yet</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  No notes or follow-ups have been logged on this lead.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminLeadDetail;
