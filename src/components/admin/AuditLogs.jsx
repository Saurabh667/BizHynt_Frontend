
import { useEffect, useMemo, useState } from 'react';

import {
  Search,
  ScrollText,
  UserRound,
  Clock3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import adminService from '../../services/adminService';

import toast from 'react-hot-toast';

import SelectField from '../common/SelectField';

const human = (v = '') =>
  String(v)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const primitive = (v) =>
  v == null
    ? '—'
    : typeof v === 'boolean'
      ? v
        ? 'Yes'
        : 'No'
      : typeof v === 'object'
        ? 'Updated'
        : String(v);

function ChangeSummary({ metadata }) {
  const [open, setOpen] = useState(false);

  const entries = useMemo(
    () =>
      metadata && typeof metadata === 'object'
        ? Object.entries(metadata)
        : [],
    [metadata]
  );

  if (!entries.length) {
    return <span className="text-slate-400">No additional details</span>;
  }

  const shown = open ? entries : entries.slice(0, 2);

  return (
    <div className="max-w-xl">
      <div className="flex flex-wrap gap-1.5">
        {shown.map(([k, v]) => (
          <span
            key={k}
            className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <b className="font-semibold">{human(k)}:</b>

            <span className="max-w-[220px] truncate">
              {primitive(v)}
            </span>
          </span>
        ))}
      </div>

      {entries.length > 2 && (
        <button
          type="button"
          onClick={() => setOpen((x) => !x)}
          className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}

          {open ? 'Show less' : `Show ${entries.length - 2} more`}
        </button>
      )}
    </div>
  );
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setLoading(true);

        const r = await adminService.getAuditLogs({
          entityType: entityType || undefined,
          action: action || undefined,
        });

        setLogs(r.logs || []);
      } catch (e) {
        toast.error(
          e.response?.data?.message || 'Failed to load activity logs'
        );
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [entityType, action]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">Administration</div>

          <h1 className="page-title">Activity logs</h1>

          <p className="page-description">
            A readable audit trail of important CRM changes.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="crm-search relative w-full sm:max-w-sm">
          <Search className="field-icon" size={16} />

          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Search actions…"
            className="field w-full !pl-9"
          />
        </div>

        <SelectField
          value={entityType}
          onChange={setEntityType}
          className="w-full sm:w-52"
          options={[
            { value: '', label: 'All entity types' },
            ...['user', 'domain_type', 'team', 'lead', 'customer'].map(
              (x) => ({
                value: x,
                label: human(x),
              })
            ),
          ]}
        />
      </div>

      <div className="data-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Entity</th>
                <th>Action</th>
                <th>What changed</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                logs.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div className="inline-flex items-center gap-2 whitespace-nowrap">
                        <Clock3
                          size={14}
                          className="text-slate-400"
                        />

                        {new Date(l.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </div>
                    </td>

                    <td>
                      <div className="inline-flex items-center gap-2">
                        <UserRound
                          size={14}
                          className="text-slate-400"
                        />

                        <span className="font-medium">
                          {l.actor?.name || 'System'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {human(l.entityType)}
                      </span>
                    </td>

                    <td>
                      <span className="font-medium">
                        {human(l.action)}
                      </span>
                    </td>

                    <td>
                      <ChangeSummary metadata={l.metadata} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="empty-state">
            <ScrollText size={28} />
            <b>Loading activity…</b>
          </div>
        )}

        {!loading && !logs.length && (
          <div className="empty-state">
            <ScrollText size={28} />
            <b>No activity found</b>
            <span>Try changing the current filters.</span>
          </div>
        )}
      </div>
    </div>
  );
}

