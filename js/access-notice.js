// Visible, dismissible connection notices for OBS Interact and browser previews.
/** Show one access notice without exposing tokens or blocking chat. */
export function showAccessNotice(host,message,doc=globalThis.document){
 if(!host)return;
 host.querySelector('.access-notice')?.remove();
 const notice=doc.createElement('div');
 notice.className='access-notice';
 notice.setAttribute('role','status');
 Object.assign(notice.style,{
  position:'absolute',left:'12px',bottom:'12px',zIndex:'100',
  maxWidth:'calc(100% - 24px)',padding:'10px',borderRadius:'6px',
  background:'#172132',color:'#fff',font:'14px/1.4 sans-serif',pointerEvents:'auto'
 });
 const text=doc.createElement('span');
 text.textContent=message;
 const dismiss=doc.createElement('button');
 dismiss.type='button';
 dismiss.textContent='Dismiss';
 dismiss.style.marginLeft='8px';
 dismiss.onclick=()=>notice.remove();
 notice.append(text,dismiss);
 host.append(notice);
 return notice;
}
