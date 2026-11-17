import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import {
  Users,
  Target,
  UserRoundCheck,
  Layers3,
  UsersRound,
  Inbox,
} from 'lucide-react';
import StatCard from '../common/StatCard';

export default function SuperAdminOverview() {
  const nav = useNavigate();
  const [o, setO] = useState(null);

  useEffect(() => {
    adminService
      .getOverview()
      .then((r) => setO(r.overview))
      .catch((e) =>
        toast.error(
          e.response?.data?.message || 'Failed to load overall analytics'
        )
      );
  }, []);

  if (!o) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Workspace overview</h2>

        <p className="text-sm text-slate-500">
          Operational data across the CRM. Select a card to open its working
          view.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Users"
          value={o.totalUsers}
          icon={Users}
          onClick={() => nav('/admin/users')}
        />

        <StatCard
          title="Leads"
          value={o.totalLeads}
          icon={Target}
          onClick={() => nav('/admin/leads?scope=all')}
        />

        <StatCard
          title="Unassigned"
          value={o.unassignedLeads}
          icon={Inbox}
          onClick={() => nav('/admin/leads?scope=unassigned')}
        />

        <StatCard
          title="Customers"
          value={o.totalCustomers}
          icon={UserRoundCheck}
          onClick={() => nav('/admin/customers')}
        />

        <StatCard
          title="Domains"
          value={o.totalDomains}
          icon={Layers3}
          onClick={() => nav('/admin/domains')}
        />

        <StatCard
          title="Teams"
          value={o.totalTeams}
          icon={UsersRound}
          onClick={() => nav('/admin/teams')}
        />
      </div>

      <div className="data-card p-5">
        <h3 className="font-semibold">Overall pipeline</h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(o.statusBreakdown || {}).map(([k, v]) => (
            <button
              onClick={() =>
                nav(`/admin/leads?scope=all&status=${k}`)
              }
              key={k}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm transition hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800"
            >
              {k.replaceAll('_', ' ')}: <b>{v}</b>
            </button>
          ))}

          <button
            onClick={() => nav('/admin/analytics')}
            className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700"
          >
            Conversion: <b>{o.conversionRate}%</b>
          </button>
        </div>
      </div>
    </div>
  );
}

