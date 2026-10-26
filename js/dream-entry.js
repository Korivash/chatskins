/**
 * Browser module dream-entry.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: module declarations.
 * Invariant: preserve existing settings links and render chat content as text.
 */
/** Dream entry point shared by the skins gallery and Frame Studio editor. */
import {requestDream} from './dream-client.js';


const form=document.querySelector('#skins-dream-form');

if(form){
 const text=form.querySelector('#skins-dream-text');
  
 const status=form.querySelector('#skins-dream-status');
  
 const button=form.querySelector('button[type="submit"]');
  
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  const idea=text.value.trim();
  if(!idea||[...idea].length>300){status.textContent='Write a short idea, up to 300 characters.';text.focus();return}
  button.disabled=true;button.textContent='Dreaming up your frame…';status.textContent='Building an editable design for Frame Studio.';
  try{
   const dream=await requestDream(fetch,idea);
   try{sessionStorage.setItem('chat-studio.dream.pending.v1',JSON.stringify(dream))}catch{throw new Error('This browser could not keep the new design for the editor.')}
   status.textContent=dream.paintMessage||`${dream.name} is ready. Opening Frame Studio…`;
   location.href=new URL('/editor.html?assistantTab=studio',location.href).href;
  }catch(error){status.textContent=error.message||'Frame Studio could not create that design. Try again.';button.disabled=false;button.textContent='Create my frame'}
 });
  
}
