import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
export default function ConfirmDialog({open,onClose,onConfirm,title='Confirm action',description,confirmLabel='Confirm',danger=false,busy=false}){
 return <Modal isOpen={open} onClose={()=>!busy&&onClose()} title={title} size="sm"><div className="space-y-5"><div className={`flex gap-3 rounded-xl p-3.5 ${danger?'bg-red-50 text-red-900 dark:bg-red-950/25 dark:text-red-200':'bg-amber-50 text-amber-900 dark:bg-amber-950/25 dark:text-amber-200'}`}><AlertTriangle size={18} className="mt-0.5 shrink-0"/><p className="text-sm leading-5">{description}</p></div><div className="flex justify-end gap-2"><button disabled={busy} onClick={onClose} className="btn-secondary">Cancel</button><button disabled={busy} onClick={onConfirm} className={danger?'btn-danger':'btn-primary'}>{busy?'Working…':confirmLabel}</button></div></div></Modal>
}
