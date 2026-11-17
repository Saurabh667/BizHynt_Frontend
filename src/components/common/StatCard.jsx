import { ArrowUpRight } from 'lucide-react';
function StatCard({ title, value, icon: Icon, description, onClick, className='' }) {
 const Comp=onClick?'button':'div';
 return <Comp type={onClick?'button':undefined} onClick={onClick} className={`metric-card group ${onClick?'metric-card-clickable':''} ${className}`}>
  <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="metric-label">{title}</p><p className="metric-value">{value}</p>{description&&<p className="metric-description">{description}</p>}</div><div className="metric-icon"><Icon size={18}/></div></div>
  {onClick&&<span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition group-hover:text-indigo-600">View details <ArrowUpRight size={12}/></span>}
 </Comp>
}
export default StatCard;
