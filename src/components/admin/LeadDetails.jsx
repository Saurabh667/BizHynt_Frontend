import Checkbox from '../common/Checkbox';

import {
  ArrowLeft, Mail, Phone, Building2, CalendarDays, Clock3, MessageSquare,
  CheckCircle2, Circle, Plus, X, Bell, TrendingUp, FileText,
  Trash2, AlertTriangle,
  Share2,
  Globe, Star, Gauge,
  MessageCircle, Camera, Briefcase, Video, ExternalLink, Inbox, MapPinned,
  Images, Quote,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import leadService from "../../services/leadService";
import { convertLead } from "../../services/crmService";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import ConfirmDialog from "../common/ConfirmDialog";
import SelectField from "../common/SelectField";

const STATUSES = [
  "new", "contacted", "replied", "interested", "meeting_scheduled",
  "proposal_sent", "negotiation", "won", "lost",
];

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

const LOST_REASONS = [
  { value: "price", label: "Price", description: "The lead found the price too high." },
  { value: "competitor", label: "Competitor", description: "The lead chose another competitor." },
  { value: "not_interested", label: "Not Interested", description: "The lead is no longer interested." },
  { value: "no_response", label: "No Response", description: "The lead stopped responding." },
  { value: "other", label: "Other", description: "Another reason not listed above." },
];

const FOLLOW_UP_CHANNELS = [
  {
    value: "email",
    label: "Email",
    tagLabel: "📧 Email",
    icon: Mail,
    activeClassName: "border-blue-500 bg-blue-500 text-white",
    idleClassName: "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10",
    highlightClassName: "bg-blue-200 text-blue-900 dark:bg-blue-500/30 dark:text-blue-200",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    tagLabel: "💬 WhatsApp",
    icon: MessageCircle,
    activeClassName: "border-green-500 bg-green-500 text-white",
    idleClassName: "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-green-500/40 dark:hover:bg-green-500/10",
    highlightClassName: "bg-green-200 text-green-900 dark:bg-green-500/30 dark:text-green-200",
  },
  {
    value: "phone",
    label: "Phone Call",
    tagLabel: "📞 Phone Call",
    icon: Phone,
    activeClassName: "border-amber-500 bg-amber-500 text-white",
    idleClassName: "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10",
    highlightClassName: "bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200",
  },
];

function getChannelMeta(channel) {
  return FOLLOW_UP_CHANNELS.find((item) => item.value === channel) || null;
}

function parseFollowUpNote(note) {
  if (!note) return { channelMeta: null, text: "" };

  for (const channel of FOLLOW_UP_CHANNELS) {
    if (note === channel.tagLabel) {
      return { channelMeta: channel, text: "" };
    }
    const prefix = `${channel.tagLabel} — `;
    if (note.startsWith(prefix)) {
      return { channelMeta: channel, text: note.slice(prefix.length) };
    }
  }

  return { channelMeta: null, text: note };
}

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}


function parseImageList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}


function parseCommentsList(value) {
  if (!value) return [];
  const raw = String(value).trim();
  if (!raw) return [];

  const delimiterPatterns = [/\r?\n+/, /\s*\|\s*/, /\s*;\s*/, /(?:^|\s)\d+[.)]\s+/];
  for (const pattern of delimiterPatterns) {
    const parts = raw.split(pattern).map((part) => part.trim()).filter(Boolean);
    if (parts.length > 1) return parts;
  }

  return [raw];
}

function StatusBadge({ status }) {
  const styles = {
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
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold tracking-wide ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function ContactChip({ icon, tone, label, value }) {
  const tones = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  };
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, tone, label, value, caption }) {
  const tones = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    green: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    red: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <div className="data-card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{caption}</p>
    </div>
  );
}

function LinkTile({ icon, label, href, tone = "slate" }) {
  const tones = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    pink: "bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
    red: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    slate: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };
  const normalizedHref = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return (
    <a
      href={normalizedHref}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        <p className="truncate text-xs text-slate-400 dark:text-slate-500">{href}</p>
      </div>
      <ExternalLink size={14} className="shrink-0 text-slate-400" />
    </a>
  );
}

function Field({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="break-words text-sm text-slate-800 dark:text-slate-200">{String(value)}</p>
    </div>
  );
}

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <section className="data-card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyNotes() {
  return (
    <div className="empty-state border border-dashed border-slate-300 p-8 dark:border-slate-700">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <MessageSquare size={26} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">No activity yet</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Add your first note to start tracking this lead.</p>
    </div>
  );
}

function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore(s => s.user);

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [newFollowUpDate, setNewFollowUpDate] = useState("");
  const [newFollowUpNote, setNewFollowUpNote] = useState("");
  const [newFollowUpChannel, setNewFollowUpChannel] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpActionId, setFollowUpActionId] = useState(null);

  const [showLostReasonModal, setShowLostReasonModal] = useState(false);
  const [selectedLostReason, setSelectedLostReason] = useState("");
  const [savingLostReason, setSavingLostReason] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [customerConfirmed, setCustomerConfirmed] = useState(false);
  const [customerForm, setCustomerForm] = useState({ requirement: '', service: '', notes: '', contactPerson: '', alternatePhone: '' });

  const [deletingNote, setDeletingNote] = useState(null);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [transferTo, setTransferTo] = useState("");
  const [assignmentBusy, setAssignmentBusy] = useState(false);
  const [confirmUnassign, setConfirmUnassign] = useState(false);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await leadService.getLeadById(id);
      setLead(response.lead);
    } catch (error) {
      console.error("Failed to fetch lead:", error);
      toast.error(error.response?.data?.message || "Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const loadEligible = async () => { try { const r = await leadService.getEligibleAssignees(id); setEligibleUsers(r.users || []) } catch { setEligibleUsers([]) } };
  useEffect(() => { if (lead?.id) loadEligible() }, [lead?.id, lead?.domainTypeId, lead?.assignedToId]);
  const handleAssign = async () => { if (!transferTo) return toast.error("Select a user"); try { setAssignmentBusy(true); await leadService.assignLead(id, Number(transferTo)); toast.success("Lead assigned"); setTransferTo(""); await fetchLead() } catch (e) { toast.error(e.response?.data?.message || "Assignment failed") } finally { setAssignmentBusy(false) } };
  const handleTransfer = async () => { if (!transferTo) return toast.error("Select a user"); try { setAssignmentBusy(true); await leadService.transferLead(id, Number(transferTo)); toast.success("Lead transferred"); setTransferTo(""); await fetchLead() } catch (e) { toast.error(e.response?.data?.message || "Transfer failed") } finally { setAssignmentBusy(false) } };
  const handleUnassign = async () => { try { setAssignmentBusy(true); await leadService.unassignLead(id); toast.success("Lead unassigned"); setConfirmUnassign(false); await fetchLead() } catch (e) { toast.error(e.response?.data?.message || "Unassign failed") } finally { setAssignmentBusy(false) } };

  const getFollowUpStatus = () => {
    if (!lead) return null;

    if (!lead.followUpDate) {
      return { key: "none", label: "No follow-up scheduled", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" };
    }

    const today = new Date();
    const followUp = new Date(lead.followUpDate);
    today.setHours(0, 0, 0, 0);
    followUp.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((followUp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { key: "overdue", label: "Overdue", className: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" };
    if (diffDays === 0) return { key: "today", label: "Today", className: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" };
    if (diffDays === 1) return { key: "tomorrow", label: "Tomorrow", className: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" };

    return { key: "upcoming", label: `In ${diffDays} days`, className: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" };
  };

  const followUpStatus = getFollowUpStatus();

  const handleAddFollowUp = async () => {
    if (!newFollowUpDate) {
      toast.error("Please select a date and time");
      return;
    }
    try {
      setSavingFollowUp(true);

      const channelMeta = getChannelMeta(newFollowUpChannel);
      const typedNote = newFollowUpNote.trim();
      // The channel pill writes itself into the note text — the user
      // never hand-types "Email"/"WhatsApp"/"Phone Call" themselves.
      // This is plain text in the existing `note` field, so nothing
      // on the backend needs to change to support it.
      const finalNote = channelMeta
        ? typedNote
          ? `${channelMeta.tagLabel} — ${typedNote}`
          : channelMeta.tagLabel
        : typedNote;

      const response = await leadService.addFollowUp(id, {
        dueDate: newFollowUpDate,
        note: finalNote,
      });
      setLead(response.lead);
      setNewFollowUpDate("");
      setNewFollowUpNote("");
      setNewFollowUpChannel("");
      toast.success("Follow-up scheduled successfully");
    } catch (error) {
      console.error("Failed to add follow-up:", error);
      toast.error(error.response?.data?.message || "Failed to schedule follow-up");
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleToggleFollowUp = async (followUp) => {
    const nextStatus = followUp.status === "done" ? "pending" : "done";
    try {
      setFollowUpActionId(followUp._id);
      const response = await leadService.updateFollowUpStatus(id, followUp._id, nextStatus);
      setLead(response.lead);
    } catch (error) {
      console.error("Failed to update follow-up:", error);
      toast.error(error.response?.data?.message || "Failed to update follow-up");
    } finally {
      setFollowUpActionId(null);
    }
  };

  const handleDeleteFollowUpEntry = (followUpId) => {
    toast(
      (t) => (
        <div className="w-[280px]">
          <p className="font-semibold text-slate-900">Delete this follow-up?</p>
          <p className="mt-1 text-sm text-slate-500">This action cannot be undone.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setFollowUpActionId(followUpId);
                  const response = await leadService.deleteFollowUpEntry(id, followUpId);
                  setLead(response.lead);
                  toast.success("Follow-up deleted successfully");
                } catch (error) {
                  console.error("Failed to delete follow-up:", error);
                  toast.error(error.response?.data?.message || "Failed to delete follow-up");
                } finally {
                  setFollowUpActionId(null);
                }
              }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  // Status/style for one follow-up entry in the list (separate from
  // getFollowUpStatus above, which only describes the lead's single
  // nearest-pending date used by the stat card).
  const getEntryStatus = (entry) => {
    if (entry.status === "done") {
      return {
        key: "done",
        label: "Completed",
        wrapClass: "border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-500/10",
        iconClass: "text-green-500",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(entry.dueDate);
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { key: "overdue", label: "Overdue", wrapClass: "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10", iconClass: "text-red-500" };
    }
    if (diffDays === 0) {
      return { key: "today", label: "Today", wrapClass: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10", iconClass: "text-amber-500" };
    }
    if (diffDays === 1) {
      return { key: "tomorrow", label: "Tomorrow", wrapClass: "border-indigo-200 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10", iconClass: "text-indigo-500" };
    }
    return { key: "upcoming", label: `In ${diffDays} days`, wrapClass: "border-indigo-200 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10", iconClass: "text-indigo-500" };
  };

  const sortedFollowUps = [...(lead?.followUps || [])].sort((a, b) => {
    if (a.status !== b.status) return a.status === "done" ? 1 : -1;
    const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return a.status === "done" ? -diff : diff;
  });

  const handleStatusChange = async (status) => {
    // A won lead is final: nothing in the pipeline can be clicked again.
    if (lead?.status === "won") return;
    if (status === "won") {
      setCustomerForm({ requirement: lead.message || '', service: '', notes: '', contactPerson: lead.name || '', alternatePhone: '' });
      setCustomerConfirmed(false);
      setShowCustomerModal(true);
      return;
    }
    if (status === "lost") {
      setSelectedLostReason(lead?.lostReason || "");
      setShowLostReasonModal(true);
      return;
    }
    try {
      setUpdatingStatus(true);
      const response = await leadService.updateLeadStatus(id, status);
      setLead(response.lead);
      toast.success(`Lead status changed to ${STATUS_LABELS[status]}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(error.response?.data?.message || "Failed to update lead status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCustomerConversion = async () => { try { setCustomerSaving(true); await convertLead(id, customerForm); toast.success("Lead marked Won and customer created"); setShowCustomerModal(false); await fetchLead() } catch (error) { toast.error(error.response?.data?.message || "Customer conversion failed") } finally { setCustomerSaving(false) } };

  const handleLostLead = async () => {
    if (!selectedLostReason) {
      toast.error("Please select a reason");
      return;
    }
    try {
      setSavingLostReason(true);
      const response = await leadService.updateLeadStatus(id, "lost", selectedLostReason);
      setLead(response.lead);
      setShowLostReasonModal(false);
      setSelectedLostReason("");
      toast.success("Lead marked as lost");
    } catch (error) {
      console.error("Failed to mark lead as lost:", error);
      toast.error(error.response?.data?.message || "Failed to update lead status");
    } finally {
      setSavingLostReason(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      setSavingNote(true);
      const response = await leadService.addNote(id, note);
      setLead(response.lead);
      setNote("");
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error(error.response?.data?.message || "Failed to add note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    toast(
      (t) => (
        <div className="w-[280px]">
          <p className="font-semibold text-slate-900">Delete this note?</p>
          <p className="mt-1 text-sm text-slate-500">This action cannot be undone.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);
                const loadingToast = toast.loading("Deleting note...");
                try {
                  setDeletingNote(noteId);
                  const response = await leadService.deleteNote(lead._id, noteId);
                  setLead(response.lead);
                  toast.success("Note deleted successfully", { id: loadingToast });
                } catch (error) {
                  toast.error(error.response?.data?.message || "Failed to delete note", { id: loadingToast });
                } finally {
                  setDeletingNote(null);
                }
              }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lead not found</h2>
        <button type="button" onClick={() => navigate("/admin/leads")} className="mt-4 text-blue-600 hover:underline">
          Back to Leads
        </button>
      </div>
    );
  }

  const currentStageIndex = STATUSES.indexOf(lead.status);
  const daysSinceCreated = lead.createdAt
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const notesCount = lead.notes?.length || 0;
  const imageList = [...new Set([...(Array.isArray(lead.imageUrls) ? lead.imageUrls : []), ...parseImageList(lead.imageUrl)])];
  const commentsList = parseCommentsList(lead.topComments);
  const hasWebsiteAudit = Boolean(
    lead.website ||
    lead.address ||
    lead.websiteStatus ||
    lead.https ||
    lead.mobileResponsive ||
    lead.pageSpeed ||
    lead.outdatedIndicators ||
    lead.leadScore ||
    lead.googleRating ||
    lead.googleReviewCount ||
    lead.googleReviewsUrl ||
    lead.googleMapsUrl ||
    lead.facebook ||
    lead.instagram ||
    lead.linkedin ||
    lead.youtube ||
    lead.allEmails ||
    lead.emailType ||
    lead.emailSource ||
    lead.emailCount
  );

  return (
    <>
      <div className="space-y-6">
        <Link to="/admin/leads?scope=all" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft size={17} />
          Back to Leads
        </Link>

        <section className="relative overflow-hidden data-card p-5 sm:p-6">
          <svg
            aria-hidden="true"
            viewBox="0 0 240 160"
            className="pointer-events-none absolute -right-6 -top-6 hidden h-44 w-44 text-blue-600 opacity-[0.06] lg:block dark:text-blue-400 dark:opacity-[0.08]"
          >
            <ellipse cx="120" cy="95" rx="85" ry="30" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="60" cy="60" r="16" fill="currentColor" />
            <circle cx="120" cy="42" r="16" fill="currentColor" />
            <circle cx="180" cy="60" r="16" fill="currentColor" />
            <path d="M60 78 L60 95 M120 60 L120 95 M180 78 L180 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              {imageList[0] ? (
                <img
                  src={imageList[0]}
                  alt={lead.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling.style.display = "flex";
                  }}
                  className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm"
                />
              ) : null}
              <div
                style={imageList[0] ? { display: "none" } : undefined}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-base font-bold text-white shadow-sm"
              >
                {getInitials(lead.name)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lead.name}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    Created {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "Unknown"}
                  </span>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={14} />
                    {daysSinceCreated === 0 ? "Added today" : `${daysSinceCreated} day${daysSinceCreated === 1 ? "" : "s"} in pipeline`}
                  </span>
                  {lead.creationMethod && (
                    <>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <span>{({ manual: "Added manually", excel_import: "Imported from Excel", api_import: "Imported via API", public_form: "Added from public form" })[lead.creationMethod] || lead.creationMethod}</span>
                    </>
                  )}
                  {lead.creator?.name && (
                    <>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <span>By {lead.creator.name}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <StatusBadge status={lead.status} />
          </div>

          <div className="relative mt-6 grid gap-3 border-t border-gray-100 pt-6 dark:border-gray-800 sm:grid-cols-4">
            <ContactChip icon={<Mail size={17} />} tone="blue" label="Email" value={lead.email || "Not provided"} />
            <ContactChip icon={<Phone size={17} />} tone="green" label="Phone" value={lead.phone || "Not provided"} />
            <ContactChip icon={<Building2 size={17} />} tone="purple" label="Company" value={lead.company || "Not provided"} />
            <ContactChip icon={<Share2 size={17} />} tone="purple" label="Source" value={lead.source || "Not provided"} />
          </div>
        </section>

        {currentUser?.role === "super_admin" && (
          <section className="data-card relative z-20 !overflow-visible p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Assignment
                </p>

                <p className="mt-1 font-semibold">
                  {lead.assignee?.name || "Unassigned"}
                </p>

                <p className="text-xs text-slate-500">
                  Domain: {lead.domainType?.name || "Not classified"}
                </p>
              </div>

              {lead.assignedToId && (
                <div className="relative z-40 flex flex-col gap-2 sm:flex-row">
                  <SelectField
                    value={transferTo}
                    onChange={setTransferTo}
                    className="relative z-50 min-w-56"
                    placeholder="Transfer to..."
                    options={eligibleUsers
                      .filter((u) => u.id !== lead.assignedToId)
                      .map((u) => ({
                        value: String(u.id),
                        label: `${u.name} (${u.role.replace("_", " ")})`,
                      }))}
                  />

                  <button
                    disabled={assignmentBusy || !transferTo}
                    onClick={handleTransfer}
                    className="btn-primary"
                  >
                    Transfer
                  </button>

                  <button
                    disabled={assignmentBusy}
                    onClick={() => setConfirmUnassign(true)}
                    className="btn-secondary !border-red-200 !text-red-600 dark:!border-red-900/70 dark:!text-red-400"
                  >
                    Unassign
                  </button>
                </div>
              )}

              {!lead.assignedToId && (
                <div className="relative z-40 flex flex-col gap-2 sm:flex-row">
                  <SelectField
                    value={transferTo}
                    onChange={setTransferTo}
                    className="relative z-50 min-w-56"
                    placeholder="Assign to..."
                    options={eligibleUsers.map((u) => ({
                      value: String(u.id),
                      label: `${u.name} (${u.role.replace("_", " ")})`,
                    }))}
                  />

                  <button
                    disabled={assignmentBusy || !transferTo}
                    onClick={handleAssign}
                    className="btn-primary"
                  >
                    Assign Lead
                  </button>
                </div>
              )}
            </div>

            {lead.assignmentHistory?.length > 0 && (
              <div className="mt-4 border-t pt-4 dark:border-slate-800">
                <p className="mb-2 text-sm font-semibold">
                  Assignment History
                </p>

                <div className="space-y-2">
                  {lead.assignmentHistory.slice(0, 10).map((h) => (
                    <div
                      key={h.id}
                      className="text-xs text-slate-500"
                    >
                      <b className="text-slate-700 dark:text-slate-300">
                        {h.performedBy?.name || "System"}
                      </b>{" "}
                      {h.action}{" "}
                      {h.fromUser?.name
                        ? `from ${h.fromUser.name} `
                        : ""}
                      {h.toUser?.name
                        ? `to ${h.toUser.name}`
                        : ""}{" "}
                      · {new Date(h.createdAt).toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}


        {true && (
          <>
            {/* Business Information */}
            {(lead.company || lead.address || lead.website || lead.websiteStatus || lead.primaryDomain || lead.finalDomain || lead.country || lead.state || lead.city || lead.pincode) && (
              <SectionCard icon={<Building2 size={17} />} title="Business Information">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Business Name" value={lead.name} />
                  <Field label="Phone" value={lead.phone} />
                  <Field label="Email" value={lead.email} />
                  <Field label="Address" value={lead.address} />
                  <Field label="Primary Domain / Sector" value={lead.primaryDomain} />
                  <Field label="Final Domain / Sub-sector" value={lead.finalDomain} />
                  <Field label="Country" value={lead.country} />
                  <Field label="State" value={lead.state} />
                  <Field label="City" value={lead.city} />
                  <Field label="Pincode" value={lead.pincode} />
                  <Field label="Website" value={lead.website} />
                  <Field label="Website Status" value={lead.websiteStatus} />
                </div>
                {lead.website && (
                  <div className="mt-5">
                    <LinkTile icon={<Globe size={17} />} tone="blue" label="Visit Website" href={lead.website} />
                  </div>
                )}
              </SectionCard>
            )}

            {/* Website Analysis */}
            {(lead.https || lead.mobileResponsive || lead.pageSpeed || lead.outdatedIndicators || lead.leadScore) && (
              <SectionCard icon={<Gauge size={17} />} title="Website Analysis" subtitle="Audit data pulled in from the leads spreadsheet.">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="HTTPS" value={lead.https} />
                  <Field label="Mobile Responsive" value={lead.mobileResponsive} />
                  <Field label="Page Speed" value={lead.pageSpeed} />
                  <Field label="Outdated Indicators" value={lead.outdatedIndicators} />
                  <Field label="Lead Score" value={lead.leadScore} />
                </div>
              </SectionCard>
            )}

            {/* Google Information */}
            {(lead.googleRating || lead.googleReviewCount || lead.googleReviewsUrl || lead.googleMapsUrl) && (
              <SectionCard icon={<Star size={17} />} title="Google Information">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Google Rating" value={lead.googleRating} />
                  <Field label="Review Count" value={lead.googleReviewCount} />
                </div>
                {(lead.googleReviewsUrl || lead.googleMapsUrl) && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {lead.googleReviewsUrl && (
                      <LinkTile icon={<Star size={17} />} tone="indigo" label="Google Reviews" href={lead.googleReviewsUrl} />
                    )}
                    {lead.googleMapsUrl && (
                      <LinkTile icon={<MapPinned size={17} />} tone="indigo" label="Google Maps" href={lead.googleMapsUrl} />
                    )}
                  </div>
                )}
              </SectionCard>
            )}

            {/* Social Media */}
            {(lead.facebook || lead.instagram || lead.linkedin || lead.youtube || lead.socialMediaFound || lead.socialMediaLinks) && (
              <SectionCard icon={<Share2 size={17} />} title="Social Media">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {lead.facebook && <LinkTile icon={<MessageCircle size={17} />} tone="blue" label="Facebook" href={lead.facebook} />}
                  {lead.instagram && <LinkTile icon={<Camera size={17} />} tone="pink" label="Instagram" href={lead.instagram} />}
                  {lead.linkedin && <LinkTile icon={<Briefcase size={17} />} tone="blue" label="LinkedIn" href={lead.linkedin} />}
                  {lead.youtube && <LinkTile icon={<Video size={17} />} tone="red" label="YouTube" href={lead.youtube} />}
                </div>
                {(lead.socialMediaFound || lead.socialMediaLinks) && (
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <Field label="Social Media Found" value={lead.socialMediaFound} />
                    <Field label="Social Media Links" value={lead.socialMediaLinks} />
                  </div>
                )}
              </SectionCard>
            )}

            {/* Email Information */}
            {(lead.allEmails || lead.emailType || lead.emailSource || lead.emailCount || lead.emailCount === 0) && (
              <SectionCard icon={<Inbox size={17} />} title="Email Information">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Email" value={lead.email} />
                  <Field label="Email Count" value={lead.emailCount} />
                  <Field label="Email Source" value={lead.emailSource} />
                  <Field label="Email Type" value={lead.emailType} />
                  <Field label="All Emails" value={lead.allEmails} />
                </div>
              </SectionCard>
            )}
          </>
        )}

        {(lead.currentReview || lead.reviewSentiment) && (
          <SectionCard
            icon={<Quote size={17} />}
            title="Current Review Intelligence"
            subtitle={lead.reviewSentiment === "bad" ? "Negative feedback — prioritize this lead insight." : "Latest/important customer feedback."}
          >
            <div className={`rounded-xl border p-4 ${lead.reviewSentiment === "bad" ? "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10" : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"}`}>
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${lead.reviewSentiment === "bad" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" : lead.reviewSentiment === "good" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                  {lead.reviewSentiment || "Unclassified"}
                </span>
              </div>
              <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">{lead.currentReview || "No review text provided."}</p>
            </div>
          </SectionCard>
        )}

        {commentsList.length > 0 && (

          <SectionCard
            icon={<Quote size={17} />}
            title="Top Comments"
            subtitle="Customer feedback pulled in from the leads spreadsheet."
          >
            <div className="space-y-3">
              {commentsList
                .flatMap((comment) => comment.split(",,,"))
                .map((comment, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <Quote
                      size={16}
                      className="mt-0.5 shrink-0 text-indigo-400 dark:text-indigo-500"
                    />

                    <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                      {comment.trim()}
                    </p>
                  </div>
                ))}
            </div>
          </SectionCard>
        )}

        <SectionCard icon={<FileText size={17} />} title="Complete Lead Record" subtitle="Stored CRM metadata and lifecycle context for this lead.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Message / Requirement" value={lead.message} />
            <Field label="Imported From" value={lead.importedFrom} />
            <Field label="Creation Method" value={lead.creationMethod} />
            <Field label="Created By" value={lead.creator?.name || lead.createdBy} />
            <Field label="Created At" value={lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN") : null} />
            <Field label="Updated At" value={lead.updatedAt ? new Date(lead.updatedAt).toLocaleString("en-IN") : null} />
            <Field label="Last Contacted" value={lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleString("en-IN") : null} />
            <Field label="Follow-up Date" value={lead.followUpDate ? new Date(lead.followUpDate).toLocaleString("en-IN") : null} />
            <Field label="Lost Reason" value={lead.lostReason} />
          </div>
        </SectionCard>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<TrendingUp size={18} />}
            tone="blue"
            label="Pipeline Stage"
            value={`${Math.max(currentStageIndex + 1, 1)} / ${STATUSES.length}`}
            caption={STATUS_LABELS[lead.status]}
          />
          <StatCard
            icon={<Clock3 size={18} />}
            tone="indigo"
            label="Days Open"
            value={daysSinceCreated}
            caption={daysSinceCreated === 1 ? "day since created" : "days since created"}
          />
          <StatCard
            icon={<FileText size={18} />}
            tone="purple"
            label="Activity Logged"
            value={notesCount}
            caption={notesCount === 1 ? "note recorded" : "notes recorded"}
          />
          <StatCard
            icon={<Bell size={18} />}
            tone={followUpStatus?.key === "overdue" ? "red" : followUpStatus?.key === "today" ? "orange" : followUpStatus?.key === "none" ? "slate" : "green"}
            label="Next Follow-up"
            value={lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
            caption={followUpStatus?.label}
          />
        </section>

        <section className="data-card p-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lead Pipeline</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track the progress of this lead.</p>
          </div>

          <div className="pb-2">
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
              {STATUSES.map((status, index) => {
                const currentIndex = STATUSES.indexOf(lead.status);
                const isCurrent = lead.status === status;
                const isCompleted = index < currentIndex && lead.status !== "lost";

                return (
                  <div key={status} className="relative flex min-w-0 items-start justify-center">
                    <button
                      type="button"
                      disabled={updatingStatus || savingLostReason || lead.status === "won"}
                      onClick={() => handleStatusChange(status)}
                      className="group flex flex-col items-center disabled:cursor-not-allowed"
                      title={lead.status === "won" ? "This lead is already won" : undefined}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${isCurrent
                          ? "border-blue-600 bg-blue-600 text-white"
                          : isCompleted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900"
                          }`}
                      >
                        {isCurrent || isCompleted ? <CheckCircle2 size={18} /> : <Circle size={17} />}
                      </div>
                      <span className={`mt-3 max-w-24 text-center text-xs font-semibold ${isCurrent ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"}`}>
                        {STATUS_LABELS[status]}
                      </span>
                    </button>

                    {index < STATUSES.length - 1 && (
                      <div aria-hidden="true" className={`absolute left-[calc(50%+1.25rem)] right-[-0.75rem] top-5 hidden h-0.5 xl:block ${index < currentIndex ? "bg-green-500" : "bg-gray-200 dark:bg-gray-800"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {lead.status === "lost" && lead.lostReason && (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-500/10">
              <AlertTriangle size={19} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Lost Reason</p>
                <p className="mt-1 text-sm font-semibold text-red-700 dark:text-red-400">
                  {LOST_REASONS.find((item) => item.value === lead.lostReason)?.label || lead.lostReason}
                </p>
              </div>
            </div>
          )}
        </section>

        {imageList.length > 0 && (
          <SectionCard icon={<Images size={17} />} title="Photos" subtitle={`${imageList.length} image${imageList.length === 1 ? "" : "s"} from the leads spreadsheet.`}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {imageList.map((url, index) => (
                <a
                  key={`${url}-${index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"
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
          </SectionCard>
        )}


        <section className="data-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <CalendarDays size={19} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Follow-ups</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Schedule as many follow-ups as you need, with a note and preferred channel on each.</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr]">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Date &amp; time</label>
                <input
                  type="datetime-local"
                  value={newFollowUpDate}
                  onChange={(e) => setNewFollowUpDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Note (optional)</label>
                <input
                  type="text"
                  value={newFollowUpNote}
                  onChange={(e) => setNewFollowUpNote(e.target.value)}
                  placeholder="What's this follow-up about?"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                How does this lead want to be reached? (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {FOLLOW_UP_CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  const isActive = newFollowUpChannel === channel.value;
                  return (
                    <button
                      key={channel.value}
                      type="button"
                      onClick={() => setNewFollowUpChannel(isActive ? "" : channel.value)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${isActive ? channel.activeClassName : channel.idleClassName
                        }`}
                    >
                      <Icon size={13} />
                      {channel.label}
                    </button>
                  );
                })}
              </div>
              {newFollowUpChannel && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Will be added to the note automatically:{" "}
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-semibold ${getChannelMeta(newFollowUpChannel).highlightClassName}`}>
                    {getChannelMeta(newFollowUpChannel).tagLabel}
                  </span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddFollowUp}
              disabled={savingFollowUp || !newFollowUpDate}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              {savingFollowUp ? "Scheduling..." : "Add Follow-up"}
            </button>
          </div>

          <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {sortedFollowUps.length ? (
              sortedFollowUps.map((entry) => {
                const entryStatus = getEntryStatus(entry);
                const isBusy = followUpActionId === entry._id;
                const { channelMeta, text: entryNoteText } = parseFollowUpNote(entry.note);
                return (
                  <div key={entry._id} className={`rounded-xl border p-4 ${entryStatus.wrapClass}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <Bell size={17} className={`mt-0.5 shrink-0 ${entryStatus.iconClass}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{entryStatus.label}</p>
                          <p className={`mt-1 font-semibold text-slate-900 dark:text-white ${entry.status === "done" ? "line-through opacity-70" : ""}`}>
                            {new Date(entry.dueDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          {channelMeta && (
                            <span className={`mt-1.5 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${channelMeta.highlightClassName}`}>
                              {channelMeta.tagLabel}
                            </span>
                          )}
                          {entryNoteText && (
                            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-400">{entryNoteText}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleFollowUp(entry)}
                          disabled={isBusy}
                          title={entry.status === "done" ? "Mark as pending" : "Mark as done"}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-500/10 dark:hover:text-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {entry.status === "done" ? <Circle size={16} /> : <CheckCircle2 size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFollowUpEntry(entry._id)}
                          disabled={isBusy}
                          title="Delete follow-up"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  <CalendarDays size={22} />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No follow-ups scheduled</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Add one above to plan your next action.</p>
              </div>
            )}
          </div>
        </section>

        <section className="data-card p-5 sm:p-6">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Notes & Follow-ups</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Keep track of conversations and actions.</p>
          </div>

          <div className="mt-5">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this lead..."
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddNote}
              disabled={savingNote || !note.trim()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={17} />
              {savingNote ? "Adding..." : "Add Note"}
            </button>
          </div>

          <div className="mt-8">
            {lead.notes?.length ? (
              <div className="relative space-y-5">
                {[...lead.notes].reverse().map((item, index) => (
                  <div key={item._id} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <Clock3 size={16} />
                      </div>
                      {index !== lead.notes.length - 1 && <div className="mt-2 w-px flex-1 bg-slate-200 dark:bg-slate-800" />}
                    </div>

                    <div className="mb-1 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Activity</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                            <Clock3 size={13} />
                            {item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(item._id)}
                            disabled={deletingNote === item._id}
                            title="Delete note"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingNote === item._id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyNotes />
            )}
          </div>
        </section>
      </div>


      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-7">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800/80">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Convert Lead to Customer
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{lead.name}</span> will be marked as <strong className="text-emerald-600 dark:text-emerald-400">Won</strong> once this customer record is created.
                </p>
              </div>

              <button
                type="button"
                disabled={customerSaving}
                onClick={() => setShowCustomerModal(false)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contact Person
                </label>
                <input
                  value={customerForm.contactPerson}
                  onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="field w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Alternate Phone
                </label>
                <input
                  value={customerForm.alternatePhone}
                  onChange={(e) => setCustomerForm({ ...customerForm, alternatePhone: e.target.value })}
                  placeholder="e.g. +1 555-0199"
                  className="field w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Service / Project
                </label>
                <input
                  value={customerForm.service}
                  onChange={(e) => setCustomerForm({ ...customerForm, service: e.target.value })}
                  placeholder="e.g. Web Platform Redesign"
                  className="field w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Customer Requirement
                </label>
                <textarea
                  value={customerForm.requirement}
                  onChange={(e) => setCustomerForm({ ...customerForm, requirement: e.target.value })}
                  placeholder="Detail any specific goals, deliverables, or deadlines..."
                  rows={3}
                  className="field w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Customer Notes
                </label>
                <textarea
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  placeholder="Internal remarks or handover instructions..."
                  rows={2}
                  className="field w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Confirmation Box */}
            <div className="mt-5 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20">
              <Checkbox
                checked={customerConfirmed}
                onChange={setCustomerConfirmed}
                label={
                  <span className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    I confirm that this customer record is ready to be created. The lead will be marked <b className="font-semibold text-slate-900 dark:text-white">Won</b> only after customer creation succeeds.
                  </span>
                }
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
              <button
                type="button"
                disabled={customerSaving}
                onClick={() => setShowCustomerModal(false)}
                className="btn-secondary rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={customerSaving || !customerConfirmed}
                onClick={handleCustomerConversion}
                className="btn-primary inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {customerSaving ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Customer & Mark Won'
                )}
              </button>
            </div>

          </div>
        </div>
      )}
      <ConfirmDialog open={confirmUnassign} onClose={() => setConfirmUnassign(false)} onConfirm={handleUnassign} busy={assignmentBusy} danger title="Unassign lead" confirmLabel="Move to unassigned" description="This lead will no longer belong to the current assignee. Admin/Super Admin can assign it again to an eligible user." />

     
{showLostReasonModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
    <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

      {/* Top accent */}
      <div className="h-1.5 shrink-0 bg-red-500" />

      {/* Header */}
      <div className="shrink-0 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertTriangle size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Mark Lead as Lost
              </h2>

              <p className="mt-1 max-w-sm text-sm leading-5 text-slate-500 dark:text-slate-400">
                Select the main reason this lead was not converted.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={savingLostReason}
            onClick={() => {
              setShowLostReasonModal(false);
              setSelectedLostReason("");
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lead information */}
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            {getInitials(lead.name)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {lead.name}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {lead.email || lead.phone || "No contact information"}
            </p>
          </div>

          <div className="ml-auto shrink-0">
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-red-600 dark:bg-red-500/10 dark:text-red-400">
              Lost
            </span>
          </div>
        </div>
      </div>

      {/* Reasons (scrolls when the screen is short) */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Loss Reason
          </p>

          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Required
          </span>
        </div>

        <div className="space-y-2.5">
          {LOST_REASONS.map((reason) => {
            const isSelected = selectedLostReason === reason.value;

            const reasonIcons = {
              price: <span className="text-base">₹</span>,
              competitor: <Briefcase size={16} />,
              not_interested: <X size={17} />,
              no_response: <MessageCircle size={16} />,
              other: <FileText size={16} />,
            };

            return (
              <button
                key={reason.value}
                type="button"
                disabled={savingLostReason}
                onClick={() => setSelectedLostReason(reason.value)}
                className={`group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? "border-red-300 bg-red-50 shadow-sm dark:border-red-500/40 dark:bg-red-500/10"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/70"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    isSelected
                      ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {reasonIcons[reason.value]}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      isSelected
                        ? "text-red-700 dark:text-red-400"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {reason.label}
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {reason.description}
                  </p>
                </div>

                {/* Radio */}
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    isSelected
                      ? "border-red-500"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {isSelected && (
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected reason preview */}
        <div
          className={`mt-4 overflow-hidden transition-all ${
            selectedLostReason
              ? "max-h-24 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          {selectedLostReason && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-500/20 dark:bg-red-500/10">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                  Selected reason
                </p>

                <p className="mt-0.5 text-sm font-medium text-red-800 dark:text-red-300">
                  {
                    LOST_REASONS.find(
                      (item) => item.value === selectedLostReason
                    )?.label
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={savingLostReason}
            onClick={() => {
              setShowLostReasonModal(false);
              setSelectedLostReason("");
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={savingLostReason || !selectedLostReason}
            onClick={handleLostLead}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {savingLostReason ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <AlertTriangle size={16} />
                Mark as Lost
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </>
  );
}

export default LeadDetails;