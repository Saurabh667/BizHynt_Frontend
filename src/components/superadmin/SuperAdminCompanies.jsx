import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Building2, ArrowRight, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import adminService from "../../services/adminService";
import {setUserActive,getUserDeactivationImpact} from "../../services/crmService";
import Modal from "../common/Modal";
import useAuthStore from "../../store/authStore";
import SelectField from "../common/SelectField";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function SuperAdminCompanies() {
  const navigate = useNavigate();
  const me=useAuthStore(s=>s.user);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deactivate,setDeactivate]=useState(null);
  const [impact,setImpact]=useState(null);
  const [strategy,setStrategy]=useState("unassign");
  const [replacement,setReplacement]=useState("");

  const fetchCompanies = async (searchValue) => {
    try {
      setLoading(true);
      const response = await adminService.getCompanies({ search: searchValue || undefined });
      setCompanies(response.companies || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCompanies(search);
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">Access management</div><h1 className="page-title">Users</h1>
          <p className="page-description">Every registered user on the platform.</p>
        </div>
        <Link to="/admin/users/register" className="btn-primary">
          <UserPlus size={17} /> Register User
        </Link>
      </div>

      <div className="toolbar">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, contact name or email..."
            className="field w-full !pl-9"
          />
        </div>
      </div>

      <div className="data-card">
        <div className="table-scroll"><table className="data-table">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role / Status</th>
              <th className="px-4 py-3">Total Leads</th>
              <th className="px-4 py-3">Won / Lost</th>
              <th className="px-4 py-3">Last Activity</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center text-sm text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="mx-auto max-w-sm">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <Building2 size={20} className="text-slate-400" />
                    </div>
                    <p className="font-medium">No user found</p>
                    <p className="mt-1 text-sm text-slate-500">Try a different search.</p>
                  </div>
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr
                  key={company.id}
                  onClick={() => navigate(`/admin/users/${company.id}`)}
                  className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        {company.companyName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{company.companyName}</p>
                        <p className="truncate text-xs text-slate-500">{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300"><div className="capitalize">{company.role?.replace("_"," ")}</div><div className={company.isActive?"text-xs text-green-600":"text-xs text-red-600"}>{company.isActive?"Active":"Inactive"}</div></td>
                  <td className="px-4 py-4 font-semibold">{company.totalLeads}</td>
                  <td className="px-4 py-4">
                    <span className="text-green-600 dark:text-green-400">{company.wonLeads}</span>
                    {" / "}
                    <span className="text-red-600 dark:text-red-400">{company.lostLeads}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                    {formatDate(company.lastActivityAt)}
                  </td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                    {formatDate(company.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right" onClick={e=>e.stopPropagation()}>
                    {(company.role==='lead_user'||me?.role==='super_admin')&&<button onClick={async()=>{try{if(!company.isActive){await setUserActive(company.id,true);toast.success('User activated');fetchCompanies(search);return;}const x=await getUserDeactivationImpact(company.id);setImpact(x);setDeactivate(company);setStrategy(x.activeLeadCount?'unassign':'keep');setReplacement('')}catch(e){toast.error(e.response?.data?.message||'Unable to inspect user')}}} className="btn-secondary mr-2">{company.isActive?'Deactivate':'Activate'}</button>}
                    <Link
                      to={`/admin/users/${company.id}`}
                      className="btn-secondary"
                    >
                      View
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>

        {!loading && (
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{companies.length}</span> users
          </div>
        )}
      </div>
      <Modal isOpen={!!deactivate} onClose={()=>{setDeactivate(null);setImpact(null)}} title={`Deactivate ${deactivate?.companyName||"user"}`}>
        <div className="space-y-4 text-sm">
          <p>This user has <b>{impact?.activeLeadCount||0}</b> active assigned lead(s). Won/Lost historical leads are not changed.</p>
          {(impact?.activeLeadCount||0)>0&&<><div><SelectField label="Lead handling" value={strategy} onChange={setStrategy} options={[{value:'unassign',label:'Move active leads to Unassigned Pool'},{value:'reassign',label:'Reassign all active leads to eligible user'}]}/></div>{strategy==='reassign'&&<SelectField value={replacement} onChange={setReplacement} placeholder="Select replacement" options={(impact?.eligibleReplacements||[]).map(u=>({value:String(u.id),label:`${u.name} (${u.role.replace('_',' ')})`}))}/>}</>}
          <p className="rounded-xl bg-amber-50 p-3 text-amber-800">Deactivation blocks login/API access. Assignment changes are written to assignment history and audit logs.</p>
          <div className="flex justify-end gap-2"><button onClick={()=>setDeactivate(null)} className="btn-secondary">Cancel</button><button onClick={async()=>{try{if(strategy==='reassign'&&!replacement)return toast.error('Select a replacement user');const r=await setUserActive(deactivate.id,false,{strategy:(impact?.activeLeadCount||0)?strategy:'keep',reassignToId:replacement||undefined});toast.success(r.message||'User deactivated');setDeactivate(null);setImpact(null);fetchCompanies(search)}catch(e){toast.error(e.response?.data?.message||'Unable to deactivate user')}}} className="btn-danger">Confirm Deactivation</button></div>
        </div>
      </Modal>
    </div>
  );
}

export default SuperAdminCompanies;
