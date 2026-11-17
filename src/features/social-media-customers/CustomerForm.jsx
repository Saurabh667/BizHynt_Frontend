import CustomerAccountsEditor from './CustomerAccountsEditor';
import PlatformSelect from './PlatformSelect';
import GoogleManagers from './GoogleManagers';
import RichTextEditor from './RichTextEditor';
import {CUSTOMER_STATUSES,customerStatusLabel} from './customer-status';
import PlatformIcon from './PlatformIcon';
import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowLeft,Building2,CheckCircle2,Plus,ShieldCheck,Trash2,Users,MapPin,FileText,Eye,EyeOff,Mail,Phone,UserRound,BriefcaseBusiness} from 'lucide-react';
import {socialApi} from './api';
import './workspace.css';

const field='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const defaultAccount=()=>({platform:'',platformId:'' ,managers:[],label:'',handle:'',profileUrl:'',loginEmail:'',loginPhone:'',accountUserId:'',password:'',accessType:'password',accessStatus:'available',notes:''});
const clean=x=>Object.fromEntries(Object.entries(x).filter(([,v])=>v!==''&&v!==undefined&&v!==null));
const readable=e=>{const m=e?.response?.data?.message;return Array.isArray(m)?m.join(' · '):typeof m==='string'?m:e?.message||'Unable to save customer';};
function Field({label,required=false,children}){return <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"><span>{label}{required&&<span className="text-rose-500"> *</span>}</span>{children}</label>}
export default function CustomerForm({initial,customerId,onSaved,onCancel,asDrawer=false}){
 const nav=useNavigate(),editing=!!customerId;
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [platforms,setPlatforms]=useState([]);
 useEffect(()=>{socialApi.platforms().then(setPlatforms).catch(()=>setError('Unable to load social platforms'))},[]);
 const [categories,setCategories]=useState([]),[categoryError,setCategoryError]=useState('');
 useEffect(()=>{let live=true;socialApi.categories().then(items=>{if(live)setCategories(items)}).catch(()=>{if(live)setCategoryError('Categories unavailable. Retry by reloading the page.')});return()=>{live=false}},[]);
 const [showPassword,setShowPassword]=useState({});
 const [dirty,setDirty]=useState(false);
 useEffect(()=>{if(!dirty)return;const beforeUnload=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',beforeUnload);return()=>window.removeEventListener('beforeunload',beforeUnload)},[dirty]);
 const [data,setData]=useState(()=>({name:initial?.name||'',businessCategory:initial?.businessCategory||'',handledBy:initial?.handledBy||'',status:initial?.status||'active',planDetails:initial?.planDetails||'',notes:initial?.notes||'',contacts:initial?.contacts?.map(({name,designation,kind,value,isPrimary})=>({name,designation,kind,value,isPrimary}))||[],addresses:initial?.addresses?.map(({label,address})=>({label,address}))||[],accounts:[]}));
 const change=(key,value)=>{setDirty(true);setError('');setData(d=>({...d,[key]:value}))};
 const rowChange=(key,index,part,value)=>{setDirty(true);setError('');setData(d=>({...d,[key]:d[key].map((x,i)=>i===index?{...x,[part]:value}:x)}))};
 const remove=(key,index)=>{setDirty(true);setData(d=>({...d,[key]:d[key].filter((_,i)=>i!==index)}))};
 async function submit(e){e.preventDefault();if(busy)return;
 if(!data.name.trim()){setError('Business name is required.');return;}
 if(data.contacts.some(c=>!c.value.trim())||data.addresses.some(a=>!a.address.trim())){setError('Complete the added contact and address rows, or remove the empty rows.');return;}
 if(!editing&&data.accounts.some(a=>!Number(a.platformId))){setError('Select a platform for each added account.');return;}
 if(data.contacts.some(c=>c.kind==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value))){setError('Enter a valid contact email.');return;}
 if(!editing&&data.accounts.some(a=>a.accessType==='password'&&a.accessStatus==='available'&&!a.password)){setError('Password required for available password-login accounts.');return;}
 if(!editing&&data.accounts.some(a=>a.loginEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.loginEmail))){setError('Enter a valid account login email.');return;}
 if(!editing&&data.accounts.some(a=>a.profileUrl&&!/^https?:\/\//i.test(a.profileUrl))){setError('Profile URL must begin with http:// or https://.');return;}
 setBusy(true);setError('');try{const {accounts,...base}=data;const payload={...base,name:data.name.trim(),contacts:data.contacts.map(clean),addresses:data.addresses.map(clean)};
 if(editing){await socialApi.update(customerId,payload);setDirty(false);onSaved?.();}else{payload.accounts=accounts.map(clean);const result=await socialApi.create(payload);setDirty(false);if(onSaved)onSaved(result);else nav(`/admin/social-media-customers/${result.id}`,{replace:true});}}
 catch(e){setError(readable(e))}finally{setBusy(false)}
 }
 const addContact=()=>change('contacts',[...data.contacts,{name:'',designation:'',kind:'phone',value:'',isPrimary:false}]);
 const addAddress=()=>change('addresses',[...data.addresses,{label:'',address:''}]);
 const addAccount=()=>change('accounts',[...data.accounts,defaultAccount()]);
 const cancel=()=>{if(dirty&&!window.confirm('Discard your unsaved customer changes?'))return;if(onCancel)onCancel();else nav('/admin/social-media-customers');};
 const main=<form id="sm-exact-customer-form" noValidate onSubmit={submit} className="sm-exact-main">
  <section className="sm-exact-section">
   <header className="sm-exact-section-heading"><span className="sm-exact-section-number">1</span><div><h2>Business Details, Contacts &amp; Addresses</h2><p>Basic information about the business and its primary contacts.</p></div><span className="sm-exact-required">* Required fields</span></header>
   <div className="sm-exact-fields">
    <Field label="Customer / Business name" required><input className={field} required maxLength={200} autoFocus={!editing} placeholder="Enter business or customer name" value={data.name} onChange={e=>change('name',e.target.value)}/></Field>
    <Field label="Business category"><select className={field} value={data.businessCategory} onChange={e=>change('businessCategory',e.target.value)}><option value="">Select category (optional)</option>{data.businessCategory&&!categories.some(c=>c.name===data.businessCategory)&&<option value={data.businessCategory}>{data.businessCategory} (existing)</option>}{categories.map(c=><option value={c.name} key={c.id}>{c.name}</option>)}</select>{categoryError&&<small role="alert" className="text-rose-600">{categoryError}</small>}</Field>
    <Field label="Account manager / Handled by"><input className={field} maxLength={200} placeholder="Enter assigned team member" value={data.handledBy} onChange={e=>change('handledBy',e.target.value)}/></Field>
    <Field label="Customer status"><select className={field} value={data.status} onChange={e=>change('status',e.target.value)}>{CUSTOMER_STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></Field>
   </div>
   <div className="sm-exact-subpanel">
    <div className="sm-exact-subhead"><span><Users size={17}/> Contacts &amp; Emails</span><button type="button" onClick={addContact}><Plus size={15}/> Add Contact</button></div>
    <div className="sm-exact-table-scroll"><table className="sm-exact-edit-table"><thead><tr><th>Name</th><th>Designation</th><th>Type</th><th>Phone / Email</th><th>Primary</th><th>Actions</th></tr></thead><tbody>{data.contacts.length?data.contacts.map((c,i)=><tr key={i}>
     <td><input aria-label={`Contact ${i+1} name`} maxLength={160} value={c.name||''} placeholder="Full name" onChange={e=>rowChange('contacts',i,'name',e.target.value)}/></td><td><input aria-label={`Contact ${i+1} designation`} maxLength={120} value={c.designation||''} placeholder="Role" onChange={e=>rowChange('contacts',i,'designation',e.target.value)}/></td><td><select aria-label={`Contact ${i+1} type`} value={c.kind} onChange={e=>rowChange('contacts',i,'kind',e.target.value)}><option value="phone">Phone</option><option value="email">Email</option></select></td><td><input required aria-label={`Contact ${i+1} value`} type={c.kind==='email'?'email':'tel'} maxLength={255} value={c.value} placeholder="Phone number or email" onChange={e=>rowChange('contacts',i,'value',e.target.value)}/></td><td><input type="checkbox" aria-label={`Primary contact ${i+1}`} checked={!!c.isPrimary} onChange={e=>setData(d=>({...d,contacts:d.contacts.map((x,j)=>({...x,isPrimary:j===i?e.target.checked:x.kind===c.kind?false:x.isPrimary}))}))}/></td><td><button className="sm-exact-danger" type="button" aria-label={`Remove contact ${i+1}`} onClick={()=>remove('contacts',i)}><Trash2 size={16}/></button></td>
    </tr>):<tr><td colSpan="6" className="sm-exact-empty"><Users size={17}/> No contacts added yet.</td></tr>}</tbody></table></div>
   </div>
   <div className="sm-exact-subpanel"><div className="sm-exact-subhead is-green"><span><MapPin size={17}/> Addresses</span><button type="button" onClick={addAddress}><Plus size={15}/> Add Address</button></div>
    <div className="sm-exact-table-scroll"><table className="sm-exact-edit-table"><thead><tr><th style={{width:'26%'}}>Address label</th><th>Full address</th><th style={{width:72}}>Actions</th></tr></thead><tbody>{data.addresses.length?data.addresses.map((a,i)=><tr key={i}><td><input aria-label={`Address ${i+1} label`} maxLength={100} placeholder="Office / Billing" value={a.label||''} onChange={e=>rowChange('addresses',i,'label',e.target.value)}/></td><td><input required aria-label={`Address ${i+1}`} maxLength={3000} placeholder="Street, city, state and postal code" value={a.address} onChange={e=>rowChange('addresses',i,'address',e.target.value)}/></td><td><button type="button" className="sm-exact-danger" aria-label={`Remove address ${i+1}`} onClick={()=>remove('addresses',i)}><Trash2 size={16}/></button></td></tr>):<tr><td colSpan="3" className="sm-exact-empty"><MapPin size={16}/> No addresses added yet.</td></tr>}</tbody></table></div>
   </div>
   <div className="sm-exact-rich-stack"><RichTextEditor label="Service plan details" placeholder="Describe services, deliverables, timelines and inclusions…" value={data.planDetails} onChange={value=>change('planDetails',value)}/><RichTextEditor label="Internal notes" placeholder="Internal instructions and follow-up notes…" value={data.notes} onChange={value=>change('notes',value)}/></div>
  </section>
  {!editing&&<section className="sm-exact-section"><header className="sm-exact-section-heading"><span className="sm-exact-section-number">2</span><div><h2>Social Media Accounts <small>(Optional)</small></h2><p>Add multiple accounts now, or add them later.</p></div><button type="button" className="sm-exact-primary sm-exact-add" onClick={addAccount}><Plus size={17}/> Add Account</button></header>
   {!data.accounts.length&&<div className="sm-exact-account-empty"><ShieldCheck size={24}/><p>No social accounts added yet.</p><button type="button" onClick={addAccount}>+ Add your first account</button></div>}
   {data.accounts.map((a,i)=><div key={i} className="sm-exact-account"><header><div><PlatformIcon platform={a.platform} logoData={platforms.find(x=>x.id===Number(a.platformId))?.logoData} size={29}/><strong>{a.platform||'Social Platform'} {i+1}</strong></div><button className="sm-exact-danger" type="button" onClick={()=>remove('accounts',i)}><Trash2 size={15}/> Remove</button></header>
    <div className="sm-exact-account-fields"><Field label="Platform" required><PlatformSelect className={field} platforms={platforms} value={a.platformId} onChange={(platformId,selected)=>{setDirty(true);setData(d=>({...d,accounts:d.accounts.map((v,j)=>j===i?{...v,platformId,platform:selected?.name||'',managers:selected?.code==='google-business-profile'?v.managers:[]}:v)}))}}/></Field>
    {[['label','Account label'],['handle','Handle / Username'],['profileUrl','Profile URL'],['loginEmail','Login email'],['loginPhone','Login phone'],['accountUserId','Platform account ID']].map(([k,l])=><Field key={k} label={l}><input className={field} type={k==='loginEmail'?'email':k==='profileUrl'?'url':k==='loginPhone'?'tel':'text'} maxLength={k==='profileUrl'?1000:255} value={a[k]} placeholder={k==='profileUrl'?'https://…':''} onChange={e=>rowChange('accounts',i,k,e.target.value)}/></Field>)}
    <Field label="Access type"><select className={field} value={a.accessType} onChange={e=>rowChange('accounts',i,'accessType',e.target.value)}><option value="password">Password login</option><option value="delegated">Delegated access</option><option value="oauth">OAuth / Connected</option><option value="other">Other</option></select></Field>
    <Field label="Access status"><select className={field} value={a.accessStatus} onChange={e=>rowChange('accounts',i,'accessStatus',e.target.value)}><option value="available">Available</option><option value="pending">Pending</option><option value="revoked">Revoked</option><option value="needs_review">Needs review</option></select></Field>
    {a.accessType==='password'&&<Field label={a.accessStatus==='available'?'Account login password *':'Account login password (optional)'}><div className="sm-exact-password"><input className={field} type={showPassword[i]?'text':'password'} autoComplete="new-password" maxLength={2000} value={a.password} onChange={e=>rowChange('accounts',i,'password',e.target.value)}/><button type="button" aria-label={showPassword[i]?'Hide password':'Show password'} onClick={()=>setShowPassword(v=>({...v,[i]:!v[i]}))}>{showPassword[i]?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></Field>}
    {platforms.find(x=>x.id===Number(a.platformId))?.code==='google-business-profile'&&<GoogleManagers value={a.managers||[]} onChange={value=>rowChange('accounts',i,'managers',value)}/>}
    <Field label="Access notes"><input className={field} maxLength={5000} value={a.notes} placeholder="Account-specific notes" onChange={e=>rowChange('accounts',i,'notes',e.target.value)}/></Field></div>
   </div>)}

   <div className="sm-exact-security"><ShieldCheck size={18}/> Passwords are encrypted and excluded from customer documents.</div>
  </section>}
  {error&&<p role="alert" className="sm-exact-error">{error}</p>}
 </form>;
 return <main className={`sm-exact-page ${editing?'sm-exact-editing':''} ${asDrawer?'sm-exact-in-drawer':''}`}>
  {!asDrawer&&<div className="sm-exact-breadcrumb"><button onClick={cancel}>Social Media Customers</button><span>›</span><strong>{editing?'Edit Customer':'Add Customer'}</strong></div>}
  <header className="sm-exact-page-head"><div><h1>{editing?'Edit Customer':'Add Social Media Customer'}</h1><p>Business details and social accounts saved securely together.</p></div><div className="sm-exact-head-actions"><button type="button" className="sm-exact-secondary" onClick={cancel}>Cancel</button><button type="submit" form="sm-exact-customer-form" disabled={busy} className="sm-exact-primary"><CheckCircle2 size={17}/>{busy?'Saving…':editing?'Save Changes':'Create Customer'}</button></div></header>
  <div className="sm-exact-layout"><div className="sm-exact-form-column">{main}{editing&&<CustomerAccountsEditor customerId={customerId} initialAccounts={initial?.accounts||[]} platforms={platforms}/>}</div>{!asDrawer&&!editing&&<aside className="sm-exact-preview" aria-label="Customer Preview"><header><Eye size={21}/><div><h2>Customer Preview</h2><p>Live summary of entered information</p></div></header><div className="sm-exact-preview-profile"><span>{data.name.trim().charAt(0).toUpperCase()||'C'}</span><div><strong>{data.name.trim()||'Customer Name'}</strong><p>{data.businessCategory||'Category not specified'}</p><small>Managed by: {data.handledBy||'Unassigned'}</small></div><b className={`is-${data.status}`}>{customerStatusLabel(data.status)}</b></div><dl>{[[Users,'Contacts',data.contacts.length],[MapPin,'Addresses',data.addresses.length],[BriefcaseBusiness,'Social Accounts',editing?initial?.accounts?.length||0:data.accounts.length],[FileText,'Service Plan',data.planDetails?'Added':'Not added']].map(([Icon,label,value])=><div key={label}><dt><Icon size={17}/>{label}</dt><dd>{value}</dd></div>)}</dl><div className="sm-exact-preview-foot"><ShieldCheck size={18}/> Only authorized CRM users can access stored credentials.</div></aside>}</div>
  {error&&<p role="alert" aria-live="assertive" className="sm-exact-error sm-exact-footer-error">{error}</p>}<footer className="sm-exact-bottom-actions"><button type="button" className="sm-exact-secondary" onClick={cancel}>Cancel</button><button type="submit" form="sm-exact-customer-form" disabled={busy} className="sm-exact-primary"><CheckCircle2 size={17}/>{busy?'Saving…':editing?'Save Changes':'Create Customer'}</button></footer>
 </main>;
}
