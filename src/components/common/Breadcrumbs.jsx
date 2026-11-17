import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getTeam } from '../../services/crmService';
import leadService from '../../services/leadService';
import adminService from '../../services/adminService';

const labels={dashboard:'Dashboard',leads:'Leads',import:'Import Leads',customers:'Customers',domains:'Domain Types',analytics:'Analytics',profile:'Profile',teams:'Teams',users:'Users',activity:'Activity Logs'};
export default function Breadcrumbs(){
 const {pathname}=useLocation();
 const parts=useMemo(()=>pathname.split('/').filter(Boolean).slice(1),[pathname]);
 const numericIndex=parts.findIndex(x=>/^\d+$/.test(x));
 const numeric=numericIndex>=0?parts[numericIndex]:null, section=parts[0];
 const[entity,setEntity]=useState('');
 useEffect(()=>{let live=true;setEntity('');if(!numeric)return()=>{};let request;if(section==='teams')request=getTeam(numeric).then(r=>r.team?.name);else if(section==='leads')request=leadService.getLead(numeric).then(r=>r.lead?.name||r.name);else if(section==='users')request=adminService.getUserProfile(numeric).then(r=>r.company?.name);else request=Promise.resolve('Details');request.then(n=>live&&setEntity(n||'Details')).catch(()=>live&&setEntity('Details'));return()=>{live=false}},[numeric,section]);
 if(!parts.length||parts[0]==='dashboard')return null;
 const visible=numericIndex>=0?parts.slice(0,numericIndex):parts;
 let path='/admin';
 return <nav aria-label="Breadcrumb" className="mb-4 flex min-h-5 flex-wrap items-center gap-1 text-xs text-slate-500"><Link to="/admin/dashboard" className="inline-flex items-center gap-1 hover:text-indigo-600"><Home size={13}/>Dashboard</Link>{visible.map((p,i)=>{path+=`/${p}`;const last=i===visible.length-1&&!numeric,label=labels[p]||p.replaceAll('-',' ');return <span key={path} className="inline-flex items-center gap-1"><ChevronRight size={13}/>{last?<span className="font-medium capitalize text-slate-700 dark:text-slate-200">{label}</span>:<Link className="capitalize hover:text-indigo-600" to={path}>{label}</Link>}</span>})}{numeric&&<span className="inline-flex min-w-0 items-center gap-1"><ChevronRight size={13}/><span className="max-w-[240px] truncate font-medium text-slate-700 dark:text-slate-200">{entity||'Loading…'}</span></span>}</nav>
}
