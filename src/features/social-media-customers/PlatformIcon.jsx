import {Globe2} from 'lucide-react';
import './platform-icons.css';

/** Local, dependency-free platform marks. Names are normalized for legacy/custom CRM entries. */
export function platformKey(value='') {
 const s=String(value).trim().toLowerCase();
 if(s.includes('instagram'))return 'instagram';
 if(s.includes('facebook')||s==='fb')return 'facebook';
 if(s.includes('whatsapp'))return 'whatsapp';
 if(s.includes('youtube'))return 'youtube';
 if(s.includes('linkedin'))return 'linkedin';
 if(s==='x'||s==='twitter'||s.startsWith('twitter /'))return 'x';
 if(s.includes('pinterest'))return 'pinterest';
 if(s.includes('tiktok')||s.includes('tik tok'))return 'tiktok';
 if(s.includes('google'))return 'google';
 return 'other';
}

export default function PlatformIcon({platform,size=24,className='',logoData}) {
 const key=platformKey(platform);
 return <span className={`sm-platform sm-platform-${key} ${logoData?'sm-platform-custom':''} ${className}`} style={{'--sm-platform-size':`${size}px`}} role="img" aria-label={`${platform||'Other platform'} icon`}>
  {logoData&&<img src={logoData} alt="" className="sm-platform-img" style={{width:size*.7,height:size*.7}}/>}
  {!logoData&&key==='instagram'&&<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2.2"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.2"/><circle cx="17.6" cy="6.6" r="1.35" fill="currentColor"/></svg>}
  {!logoData&&key==='facebook'&&<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.2 22V12.9h3.1l.5-3.6h-3.6V7c0-1.04.3-1.75 1.8-1.75h2V2.04A25 25 0 0 0 15.1 1c-2.9 0-4.9 1.78-4.9 5.05V9.3H7v3.6h3.2V22z"/></svg>}
  {!logoData&&key==='youtube'&&<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1.5" y="5" width="21" height="14" rx="4" fill="currentColor"/><path d="m10 9 6 3-6 3z" fill="#fff"/></svg>}
  {!logoData&&key==='linkedin'&&<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 8h4v13H4zM6 2a2.25 2.25 0 1 0 0 4.5A2.25 2.25 0 0 0 6 2M10 8h3.8v1.8c.6-1.1 1.9-2.05 4-2.05 4.3 0 4.2 3.2 4.2 7.2V21h-4v-5.5c0-2.2 0-3.8-2-3.8s-2 1.6-2 3.7V21h-4z"/></svg>}
  {!logoData&&key==='whatsapp'&&<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a9.7 9.7 0 0 0-8.3 14.7L2.5 22l5.5-1.45A9.7 9.7 0 1 0 12 2Z" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M8.4 7.3c-.4-.6-.7-.6-1.05-.5-.4.15-1 1-1 2.2 0 2.5 3.3 6.6 7.8 7.8 1.2 0 2.15-.8 2.4-1.5.2-.5-.2-.8-.6-1l-2.2-1c-.35-.1-.55-.05-.8.25l-.9 1c-1.45-.45-2.7-1.65-3.3-3.1l1-1.15c.25-.3.2-.6.05-.9Z" fill="currentColor"/></svg>}
  {!logoData&&key==='x'&&<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 3h4.3l5.1 6.9L18.4 3H21l-7.4 8.6L21.5 21h-4.3l-5.5-7.5L5.2 21H2.6l7.9-9.1zm2.3 1.8L18 19.2h1L6.3 4.8z"/></svg>}
  {!logoData&&key==='pinterest'&&<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.7 19.3c-.05-.8 0-1.8.2-2.7l1.35-5.8s-.35-.7-.35-1.75c0-1.65.95-2.85 2.15-2.85 1 0 1.5.75 1.5 1.65 0 1-.65 2.5-.95 3.9-.3 1.2.6 2.2 1.8 2.2 2.15 0 3.8-2.25 3.8-5.5 0-2.85-2.05-4.85-4.95-4.85-3.4 0-5.4 2.55-5.4 5.2 0 1 .4 2.1.9 2.7.1.15.1.3.05.45l-.35 1.45c-.05.25-.2.3-.5.2-1.45-.7-2.35-2.75-2.35-4.45 0-3.6 2.6-6.9 7.5-6.9 3.95 0 7 2.8 7 6.55 0 3.9-2.45 7.05-5.85 7.05-1.15 0-2.2-.6-2.55-1.25l-.7 2.7c-.25.95-.9 2.15-1.35 3A10 10 0 1 0 12 2"/></svg>}
  {!logoData&&key==='tiktok'&&<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.2 2c.25 2.5 1.7 4.1 4.2 4.3v3.4a8.7 8.7 0 0 1-4.2-1.1v6.4a6 6 0 1 1-6.15-6V12.4a2.55 2.55 0 1 0 2.75 2.55V2z"/></svg>}
  {!logoData&&key==='google'&&<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.35 12.25c0-.65-.06-1.15-.18-1.68H12v3.5h5.35c-.25 1.5-1.2 2.8-2.55 3.65l2.7 2.1c2.5-2.3 3.85-5.65 3.85-7.57ZM12 22c2.75 0 5.05-.9 6.75-2.45l-2.7-2.1c-.75.5-1.95.8-4.05.8-3.2 0-5.95-2.2-6.95-5.1L2.2 15.3A10 10 0 0 0 12 22Zm-6.95-8.85a6.2 6.2 0 0 1 0-3.3L2.2 7.7a10 10 0 0 0 0 8.6ZM12 5.75c1.5 0 2.75.5 3.75 1.45l2.7-2.7A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9.8 5.7l2.85 2.15C6.05 7.95 8.8 5.75 12 5.75Z"/></svg>}
  {!logoData&&key==='other'&&<Globe2 size={size*.65} aria-hidden="true"/>}
 </span>;
}
