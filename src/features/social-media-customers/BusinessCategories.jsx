import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,BriefcaseBusiness,Pencil,Plus,Search,X} from 'lucide-react';
import {socialApi} from './api';
import './workspace.css';

function message(error){const value=error?.response?.data?.message;return Array.isArray(value)?value.join(' · '):value||error?.message||'Unable to save category.'}
const fmt=value=>value?new Date(value).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';
export default function BusinessCategories(){
 const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
 const [query,setQuery]=useState(''),[selected,setSelected]=useState(null),[name,setName]=useState(''),[saving,setSaving]=useState(false),[formError,setFormError]=useState('');
 async function load(){setLoading(true);setLoadError('');try{setItems(await socialApi.categories())}catch(e){setLoadError(message(e))}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>items.filter(c=>c.name.toLowerCase().includes(query.trim().toLowerCase())),[items,query]);
 function open(item){setSelected(item||'new');setName(item?.name||'');setFormError('')}
 function close(){if(saving)return;setSelected(null);setName('');setFormError('')}
 async function save(e){e.preventDefault();if(saving)return;const value=name.trim().replace(/\s+/g,' ');if(!value){setFormError('Enter a category name.');return}if(items.some(c=>c.id!==selected?.id&&c.name.toLowerCase()===value.toLowerCase())){setFormError('This category already exists.');return}
  setSaving(true);setFormError('');try{if(selected==='new')await socialApi.createCategory(value);else await socialApi.updateCategory(selected.id,value);await load();setSelected(null);setName('')}catch(error){setFormError(message(error))}finally{setSaving(false)}
 }
 return <main className="smw space-y-5 sm-category-master-page">
  <div className="smw-crumb"><Link to="/admin/dashboard">Dashboard</Link><ArrowRight size={13}/><Link to="/admin/social-media-customers">Social Media</Link><ArrowRight size={13}/>Business Categories</div>
  <header className="smw-heading"><div className="smw-heading-left"><span className="smw-hero-icon"><BriefcaseBusiness size={27}/></span><div><h1>Business Categories</h1><p>Manage customer categories from one reliable master list.</p></div></div><button type="button" className="smw-primary" onClick={()=>open(null)}><Plus size={18}/> Add Category</button></header>
  <section className="smw-panel smw-filters" aria-label="Category filters"><label className="smw-search"><Search size={19}/><input aria-label="Search business categories" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search categories by name…"/></label><button className="smw-button" onClick={()=>setQuery('')} disabled={!query}>Reset</button></section>
  <section className="smw-panel smw-directory"><div className="smw-section-head"><div className="smw-section-title"><span className="smw-mini-icon"><BriefcaseBusiness size={21}/></span><div><h2>Category Master <span>({filtered.length})</span></h2><p>These categories appear in the Add and Edit Customer forms.</p></div></div></div>
  {loadError&&<div className="smw-error" role="alert">{loadError} <button onClick={load}>Retry</button></div>}
  <div className="smw-table-wrap"><table className="smw-table sm-category-table"><thead><tr><th>Category Name</th><th>Created</th><th className="smw-right">Action</th></tr></thead><tbody>{filtered.map(category=><tr key={category.id}><td><div className="smw-name-cell"><span className="sm-category-avatar"><BriefcaseBusiness size={21}/></span><div><strong className="smw-customer-name">{category.name}</strong><small>Business category</small></div></div></td><td className="smw-muted">{fmt(category.createdAt)}</td><td className="smw-right"><div className="smw-row-actions"><button type="button" className="smw-outline-action" onClick={()=>open(category)}><Pencil size={16}/> Edit</button></div></td></tr>)}</tbody></table></div>
  {loading&&<p className="smw-empty">Loading categories…</p>}{!loading&&!filtered.length&&<p className="smw-empty">{query?'No matching categories.':'No business categories yet. Click Add Category to create the first one.'}</p>}
  <footer className="smw-pagination"><span>{filtered.length} of {items.length} categories</span></footer>
  </section>
  {selected&&<div className="sm-master-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><section role="dialog" aria-modal="true" aria-labelledby="sm-category-title" className="sm-master-dialog"><header><div><h2 id="sm-category-title">{selected==='new'?'Add Business Category':'Edit Business Category'}</h2><p>{selected==='new'?'This category will appear in customer forms.':'Renaming updates linked customer categories without deleting their records.'}</p></div><button type="button" onClick={close} disabled={saving} aria-label="Close dialog"><X size={20}/></button></header><form onSubmit={save}><label htmlFor="sm-category-name">Category Name <span aria-hidden="true">*</span></label><input id="sm-category-name" autoFocus required maxLength={150} value={name} onChange={e=>{setName(e.target.value);setFormError('')}} placeholder="e.g. Technology"/>{formError&&<p role="alert" className="sm-master-error">{formError}</p>}<footer><button type="button" disabled={saving} onClick={close}>Cancel</button><button type="submit" disabled={saving}>{saving?'Saving…':selected==='new'?'Save Category':'Save Changes'}</button></footer></form></section></div>}
 </main>
}
