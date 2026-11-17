import {useRef,useState} from 'react';
import {Bold,Italic,Heading2,List,ListOrdered,Link2,Eye,Pencil,Undo2} from 'lucide-react';
import './workspace.css';

function inlineParts(text){
 const re=/(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*)/g;
 const elements=[];let start=0,match;let n=0;
 while((match=re.exec(text))!==null){
  if(match.index>start)elements.push(text.slice(start,match.index));
  if(match[2])elements.push(<a key={n++} href={match[3]} target="_blank" rel="noopener noreferrer">{match[2]}</a>);
  else if(match[4])elements.push(<strong key={n++}>{match[4]}</strong>);
  else elements.push(<em key={n++}>{match[5]}</em>);
  start=re.lastIndex;
 }
 if(start<text.length)elements.push(text.slice(start));return elements;
}
export function FormattedText({value,empty='Not provided'}){
 if(!String(value||'').trim())return <span className="sm-rich-empty">{empty}</span>;
 const lines=String(value).split(/\r?\n/),blocks=[];let list=[],ordered=false;
 const flush=()=>{if(list.length){const Comp=ordered?'ol':'ul';blocks.push(<Comp key={blocks.length}>{list.map((text,index)=><li key={index}>{inlineParts(text)}</li>)}</Comp>);list=[]}};
 lines.forEach((line,index)=>{
  const bullet=line.match(/^\s*[-*]\s+(.+)$/),number=line.match(/^\s*\d+\.\s+(.+)$/);
  if(bullet||number){if(list.length&&ordered!==!!number)flush();ordered=!!number;list.push((bullet||number)[1]);return;}
  flush();if(/^##\s+/.test(line))blocks.push(<h3 key={index}>{inlineParts(line.replace(/^##\s+/,''))}</h3>);
  else if(/^#\s+/.test(line))blocks.push(<h2 key={index}>{inlineParts(line.replace(/^#\s+/,''))}</h2>);
  else if(line.trim())blocks.push(<p key={index}>{inlineParts(line)}</p>);
 });flush();return <div className="sm-rich-content">{blocks}</div>;
}
export default function RichTextEditor({label,value,onChange,maxLength=10000,placeholder='Add formatted details…'}){
 const ref=useRef(null),[preview,setPreview]=useState(false);
 const update=(before,after='',fallback='text')=>{
  const element=ref.current;if(!element)return;
  const start=element.selectionStart,end=element.selectionEnd,selected=value.slice(start,end)||fallback;
  const next=value.slice(0,start)+before+selected+after+value.slice(end);
  if(next.length>maxLength)return;
  onChange(next);setPreview(false);
  requestAnimationFrame(()=>{element.focus();element.setSelectionRange(start+before.length,start+before.length+selected.length)});
 };
 const actions=[
  ['Heading',Heading2,()=>update('## ','','Heading')],
  ['Bold',Bold,()=>update('**','**')],
  ['Italic',Italic,()=>update('*','*')],
  ['Bullets',List,()=>update('- ','','List item')],
  ['Numbered list',ListOrdered,()=>update('1. ','','List item')],
  ['Link',Link2,()=>update('[','](https://example.com)','link text')],
 ];
 return <div className="sm-rich-editor">
  <div className="sm-rich-top"><strong>{label}</strong><span>{value.length.toLocaleString()}/{maxLength.toLocaleString()}</span></div>
  <div className="sm-rich-toolbar" role="toolbar" aria-label={`${label} formatting`}>
   {actions.map(([title,Icon,fn])=><button key={title} type="button" title={title} aria-label={title} onClick={fn} disabled={preview}><Icon size={16}/></button>)}
   <span className="sm-rich-divider"/>
   <button type="button" className={!preview?'selected':''} aria-pressed={!preview} onClick={()=>setPreview(false)}><Pencil size={15}/> Write</button>
   <button type="button" className={preview?'selected':''} aria-pressed={preview} onClick={()=>setPreview(true)}><Eye size={15}/> Preview</button>
  </div>
  {preview?<div className="sm-rich-preview"><FormattedText value={value} empty="Preview will appear here."/></div>:
    <textarea ref={ref} aria-label={label} spellCheck maxLength={maxLength} rows={7} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>}
  <div className="sm-rich-help">Select text, then use the formatting buttons. Formatting is shown in Preview; older plain-text entries remain readable.</div>
 </div>
}
