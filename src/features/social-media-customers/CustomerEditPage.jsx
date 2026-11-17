import {useEffect,useState} from 'react';
import {useNavigate,useParams} from 'react-router-dom';
import CustomerForm from './CustomerForm';
import {socialApi} from './api';
export default function CustomerEditPage(){
 const {id}=useParams();const nav=useNavigate();
 const [customer,setCustomer]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;socialApi.get(id).then(data=>{if(active)setCustomer(data)}).catch(e=>{if(active)setError(e?.response?.data?.message||'Unable to load customer')});return()=>{active=false}},[id]);
 if(error)return <div role="alert" className="sm-exact-error">{String(error)} <button type="button" onClick={()=>nav(`/admin/social-media-customers/${id}`)}>Back to customer</button></div>;
 if(!customer)return <p className="p-5">Loading customer…</p>;
 return <CustomerForm customerId={Number(id)} initial={customer} onCancel={()=>nav(`/admin/social-media-customers/${id}`)} onSaved={()=>nav(`/admin/social-media-customers/${id}`,{replace:true})}/>;
}
