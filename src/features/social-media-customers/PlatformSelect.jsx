import PlatformIcon from './PlatformIcon';
export default function PlatformSelect({platforms,value,onChange,className='',required=true}){
 const chosen=platforms.find(p=>p.id===Number(value));
 return <div className="sm-platform-select"><PlatformIcon platform={chosen?.name||''} logoData={chosen?.logoData} size={27}/><select aria-label="Social media platform" className={className} required={required} value={value||''} onChange={e=>onChange(Number(e.target.value),platforms.find(p=>p.id===Number(e.target.value)))}><option value="">Select platform</option>{platforms.filter(p=>p.isActive||p.id===Number(value)).map(p=><option key={p.id} value={p.id}>{p.name}{!p.isActive?' (inactive)':''}</option>)}</select></div>;
}
