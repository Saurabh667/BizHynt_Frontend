import { CalendarDays, Mail, ShieldCheck, UserRound, Clock3 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageSkeleton from '../common/PageSkeleton';

const roleLabel=(role)=>role==='super_admin'?'Super Admin':role==='admin'?'Admin':'Lead User';
const fmt=(value)=>value?new Date(value).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'Not available';

export default function Profile(){
 const user=useAuthStore(s=>s.user), initialized=useAuthStore(s=>s.initialized);
 if(!initialized||!user)return <PageSkeleton/>;
 const initials=(user.name||'U').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
 return <div className="page-shell">
  <div className="page-header"><div><div className="eyebrow">Account</div><h1 className="page-title">Profile</h1><p className="page-description">Your identity, role and workspace information.</p></div><span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"/>Active</span></div>
  <section className="data-card overflow-hidden">
   <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-center gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{initials}</div><div className="min-w-0"><h2 className="truncate text-lg font-semibold text-slate-950 dark:text-white">{user.name}</h2><p className="mt-0.5 truncate text-sm text-slate-500">{user.email}</p></div></div>
    <span className="badge badge-neutral"><ShieldCheck size={13} className="mr-1.5"/>{roleLabel(user.role)}</span>
   </div>
  </section>
  <div className="grid gap-4 lg:grid-cols-2">
   <section className="data-card"><SectionHead icon={UserRound} title="Account information" text="Personal details used in the CRM."/><div className="divide-y divide-slate-100 dark:divide-slate-800"><Row icon={UserRound} label="Full name" value={user.name}/><Row icon={Mail} label="Email address" value={user.email}/><Row icon={ShieldCheck} label="Access role" value={roleLabel(user.role)}/></div></section>
   <section className="data-card"><SectionHead icon={Clock3} title="Account timeline" text="Account dates available from your user record."/><div className="divide-y divide-slate-100 dark:divide-slate-800"><Row icon={CalendarDays} label="Joined" value={fmt(user.createdAt)}/><Row icon={Clock3} label="Last profile update" value={fmt(user.updatedAt)}/></div></section>
  </div>
 </div>
}
function SectionHead({icon:Icon,title,text}){return <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800"><span className="icon-tile"><Icon size={16}/></span><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-0.5 text-xs text-slate-500">{text}</p></div></div>}
function Row({icon:Icon,label,value}){return <div className="grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr] sm:items-center"><span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500"><Icon size={14}/>{label}</span><span className="break-words text-sm font-medium text-slate-800 dark:text-slate-200">{value||'—'}</span></div>}
