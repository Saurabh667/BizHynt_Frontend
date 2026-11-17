import { Check } from 'lucide-react';

export default function Checkbox({checked=false,onChange,disabled=false,label,ariaLabel,className=''}){
 return <label className={`inline-flex items-center gap-2 ${disabled?'cursor-not-allowed opacity-55':'cursor-pointer'} ${className}`}>
  <input type="checkbox" checked={checked} disabled={disabled} onChange={e=>onChange?.(e.target.checked)} aria-label={ariaLabel||label} className="peer sr-only"/>
  <span aria-hidden="true" className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-slate-300 bg-white text-transparent transition peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/30 peer-disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:peer-disabled:bg-slate-800"><Check size={12} strokeWidth={3}/></span>
  {label&&<span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>}
 </label>
}
