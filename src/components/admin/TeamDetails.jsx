// import Checkbox from '../common/Checkbox';
// import {useEffect,useState}from'react';import{ArrowLeft,UserRound,Target,MapPin,Search,UsersRound,Layers3,Inbox,Mail}from'lucide-react';import{Link,useParams}from'react-router-dom';import toast from'react-hot-toast';import{getTeam,assignTeamLeads}from'../../services/crmService';import Modal from'../common/Modal';
// export default function TeamDetails(){const{id}=useParams(),[data,setData]=useState(null),[target,setTarget]=useState(null),[selected,setSelected]=useState([]),[search,setSearch]=useState(''),[saving,setSaving]=useState(false);const load=async()=>{try{setData(await getTeam(id))}catch(e){toast.error(e.response?.data?.message||'Failed to load team')}};useEffect(()=>{load();},[id]);if(!data)return <div className="page-shell"><div className="data-card empty-state">Loading team…</div></div>;const leads=(data.unassignedLeads||[]).filter(l=>!search||`${l.name} ${l.email||''} ${l.phone||''} ${l.city||''}`.toLowerCase().includes(search.toLowerCase()));const assign=async()=>{if(!selected.length)return toast.error('Select at least one lead');try{setSaving(true);const r=await assignTeamLeads(data.team.id,{userId:target.userId,leadIds:selected});toast.success(`Assigned ${r.assigned}; skipped ${r.skipped}`);setTarget(null);setSelected([]);await load()}catch(e){toast.error(e.response?.data?.message||'Assignment failed')}finally{setSaving(false)}};return <div className="page-shell"><div className="page-header"><div><Link to="/admin/teams" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600"><ArrowLeft size={14}/>Teams</Link><h1 className="page-title">{data.team.name}</h1><p className="page-description">Manage team members and distribute eligible {data.team.domainType?.name} leads.</p></div><div className="flex gap-2"><span className="badge badge-neutral"><Layers3 size={12} className="mr-1"/>{data.team.domainType?.name}</span><span className="badge bg-indigo-50 text-indigo-700"><Inbox size={12} className="mr-1"/>{data.unassignedLeads?.length||0} unassigned</span></div></div>
//  <div className="data-card"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 dark:border-slate-800"><div><h2 className="text-sm font-semibold">Team members</h2><p className="mt-0.5 text-xs text-slate-500">Use Assign Leads on a member row to distribute unassigned Excel/API leads.</p></div><span className="text-xs font-medium text-slate-400">{data.team.members.length} members</span></div><div className="table-scroll"><table className="data-table"><thead><tr><th>User</th><th>Contact</th><th>Role</th><th>Status</th><th className="text-right">Lead assignment</th></tr></thead><tbody>{data.team.members.map(m=><tr key={m.userId}><td><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold dark:bg-slate-800">{m.user?.name?.charAt(0)?.toUpperCase()||<UserRound size={14}/>}</span><b>{m.user?.name}</b></div></td><td className="text-slate-500"><span className="inline-flex items-center gap-1.5"><Mail size={13}/>{m.user?.email||'—'}</span></td><td className="capitalize">{m.user?.role?.replace('_',' ')}</td><td><span className={`badge ${m.user?.isActive?'bg-emerald-50 text-emerald-700':'badge-neutral'}`}>{m.user?.isActive?'Active':'Inactive'}</span></td><td><div className="flex justify-end"><button disabled={!m.user?.isActive} onClick={()=>{setTarget(m);setSearch('');setSelected([])}} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"><Target size={14}/>Assign Leads</button></div></td></tr>)}</tbody></table></div></div>
//  <Modal isOpen={!!target} onClose={()=>!saving&&setTarget(null)} title={`Assign leads to ${target?.user?.name||''}`} description={`${data.team.domainType?.name} · only eligible unassigned Excel/API leads are listed.`} size="xl"><div className="space-y-4"><div className="toolbar"><div className="crm-search relative w-full sm:w-80"><Search size={15} className="field-icon"/><input value={search} onChange={e=>setSearch(e.target.value)} className="field w-full pl-9" placeholder="Search eligible leads"/></div><span className="ml-auto text-xs text-slate-500">{selected.length} selected · {leads.length} available</span></div><div className="data-card max-h-[48vh] overflow-auto"><table className="data-table"><thead className="sticky top-0 z-10"><tr><th className="w-10"><Checkbox ariaLabel="Select all eligible leads" checked={!!leads.length&&selected.length===leads.length} onChange={checked=>setSelected(checked?leads.map(l=>l.id):[])}/></th><th>Lead</th><th>Contact</th><th>Location</th><th>Source</th></tr></thead><tbody>{leads.map(l=><tr key={l.id}><td><Checkbox ariaLabel={`Select ${l.name}`} checked={selected.includes(l.id)} onChange={checked=>setSelected(checked?[...selected,l.id]:selected.filter(x=>x!==l.id))}/></td><td><b>{l.name}</b></td><td className="text-slate-500">{l.email||l.phone||'—'}</td><td className="text-slate-500"><span className="inline-flex items-center gap-1"><MapPin size={13}/>{[l.city,l.state].filter(Boolean).join(', ')||'—'}</span></td><td><span className="badge badge-neutral">{l.source||l.creationMethod||'—'}</span></td></tr>)}</tbody></table>{!leads.length&&<div className="empty-state"><Inbox size={27}/><b>No eligible unassigned leads</b><span>Excel/API leads for this Domain Type will appear here.</span></div>}</div><div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row dark:border-slate-800"><button disabled={saving} onClick={()=>setTarget(null)} className="btn-secondary">Cancel</button><button disabled={saving||!selected.length} onClick={assign} className="btn-primary disabled:opacity-40">{saving?'Assigning…':`Assign ${selected.length||''} selected`}</button></div></div></Modal></div>}




import Checkbox from "../common/Checkbox";

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  UserRound,
  Target,
  MapPin,
  Search,
  Layers3,
  Inbox,
  Mail,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import toast from "react-hot-toast";

import {
  getTeam,
  assignTeamLeads,
} from "../../services/crmService";

import Modal from "../common/Modal";

export default function TeamDetails() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [target, setTarget] = useState(null);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setData(await getTeam(id));
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Failed to load team"
      );
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!data) {
    return (
      <div className="page-shell">
        <div className="data-card empty-state">
          Loading team…
        </div>
      </div>
    );
  }

  const leads = (data.unassignedLeads || []).filter(
    (l) =>
      !search ||
      `${l.name} ${l.email || ""} ${l.phone || ""} ${
        l.city || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const assign = async () => {
    if (!selected.length) {
      return toast.error("Select at least one lead");
    }

    try {
      setSaving(true);

      const r = await assignTeamLeads(
        data.team.id,
        {
          userId: target.userId,
          leadIds: selected,
        }
      );

      toast.success(
        `Assigned ${r.assigned}; skipped ${r.skipped}`
      );

      setTarget(null);
      setSelected([]);

      await load();
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Assignment failed"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <Link
            to="/admin/teams"
            className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600"
          >
            <ArrowLeft size={14} />
            Teams
          </Link>

          <h1 className="page-title">
            {data.team.name}
          </h1>

          <p className="page-description">
            Manage team members and distribute eligible{" "}
            {data.team.domainType?.name} leads.
          </p>
        </div>

        <div className="flex gap-2">
          <span className="badge badge-neutral">
            <Layers3
              size={12}
              className="mr-1"
            />
            {data.team.domainType?.name}
          </span>

          <span className="badge bg-indigo-50 text-indigo-700">
            <Inbox
              size={12}
              className="mr-1"
            />
            {data.unassignedLeads?.length || 0} unassigned
          </span>
        </div>
      </div>

      <div className="data-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold">
              Team members
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Use Assign Leads on a member row to distribute
              unassigned Excel/API leads.
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {data.team.members.length} members
          </span>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-right">
                  Lead assignment
                </th>
              </tr>
            </thead>

            <tbody>
              {data.team.members.map((m) => (
                <tr key={m.userId}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold dark:bg-slate-800">
                        {m.user?.name?.charAt(0)?.toUpperCase() || (
                          <UserRound size={14} />
                        )}
                      </span>

                      <b>{m.user?.name}</b>
                    </div>
                  </td>

                  <td className="text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={13} />
                      {m.user?.email || "—"}
                    </span>
                  </td>

                  <td className="capitalize">
                    {m.user?.role?.replace("_", " ")}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        m.user?.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "badge-neutral"
                      }`}
                    >
                      {m.user?.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-end">
                      <button
                        disabled={!m.user?.isActive}
                        onClick={() => {
                          setTarget(m);
                          setSearch("");
                          setSelected([]);
                        }}
                        className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Target size={14} />
                        Assign Leads
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!target}
        onClose={() => !saving && setTarget(null)}
        title={`Assign leads to ${
          target?.user?.name || ""
        }`}
        description={`${data.team.domainType?.name} · only eligible unassigned Excel/API leads are listed.`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="toolbar">
            <div className="crm-search relative w-full sm:w-80">
              <Search
                size={15}
                className="field-icon"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="field field-search !pl-9 w-full"
                placeholder="Search eligible leads"
              />
            </div>

            <span className="ml-auto text-xs text-slate-500">
              {selected.length} selected ·{" "}
              {leads.length} available
            </span>
          </div>

          <div className="data-card max-h-[48vh] !overflow-x-auto !overflow-y-auto ">
            <table className="data-table min-w-max">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="w-10">
                    <Checkbox
                      ariaLabel="Select all eligible leads"
                      checked={
                        !!leads.length &&
                        selected.length === leads.length
                      }
                      onChange={(checked) =>
                        setSelected(
                          checked
                            ? leads.map((l) => l.id)
                            : []
                        )
                      }
                    />
                  </th>

                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Source</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Checkbox
                        ariaLabel={`Select ${l.name}`}
                        checked={selected.includes(l.id)}
                        onChange={(checked) =>
                          setSelected(
                            checked
                              ? [...selected, l.id]
                              : selected.filter(
                                  (x) => x !== l.id
                                )
                          )
                        }
                      />
                    </td>

                    <td>
                      <b>{l.name}</b>
                    </td>

                    <td className="text-slate-500">
                      {l.email || l.phone || "—"}
                    </td>

                    <td className="text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} />

                        {[
                          l.city,
                          l.state,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {l.source ||
                          l.creationMethod ||
                          "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!leads.length && (
              <div className="empty-state">
                <Inbox size={27} />

                <b>
                  No eligible unassigned leads
                </b>

                <span>
                  Excel/API leads for this Domain Type
                  will appear here.
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row">
            <button
              disabled={saving}
              onClick={() => setTarget(null)}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              disabled={saving || !selected.length}
              onClick={assign}
              className="btn-primary disabled:opacity-40"
            >
              {saving
                ? "Assigning…"
                : `Assign ${selected.length || ""} selected`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

