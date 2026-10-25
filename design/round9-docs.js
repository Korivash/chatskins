// Self-contained document viewer. Markdown sources remain the editorial deliverable.
const pages=window.docsContent, main=document.querySelector('#main'), sidebar=document.querySelector('#doc-sidebar'),toc=document.querySelector('#doc-toc');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const inline=s=>escape(s).replace(/`([^`]+)`/g,'<code>$1</code>');
function markdown(text){
 let html='',list='',code=null,paragraph=[];
 const flush=()=>{if(paragraph.length){html+='<p>'+inline(paragraph.join(' '))+'</p>';paragraph=[]}if(list){html+='</'+list+'>';list=''}};
 for(const line of text.split('\n')){
  if(line.startsWith('```')){flush();if(code!==null){html+='<div class="codebox"><button class="copy" type="button">Copy</button><pre><code>'+escape(code.join('\n'))+'</code></pre></div>';code=null}else code=[];continue}
  if(code!==null){code.push(line);continue}
  if(!line.trim()){flush();continue}
  const heading=line.match(/^(#{1,3}) (.+)$/);
  if(heading){flush();const level=heading[1].length;html+='<h'+level+' id="'+slug(heading[2])+'">'+inline(heading[2])+'</h'+level+'>';continue}
  const callout=line.match(/^> (Tip|Note|Warning): (.+)$/);
  if(callout){flush();html+='<aside class="callout '+callout[1].toLowerCase()+'"><strong>'+callout[1]+'</strong>'+inline(callout[2])+'</aside>';continue}
  const item=line.match(/^(?:- |\d+\. )(.+)$/);
  if(item){const type=line.startsWith('-')?'ul':'ol';if(list!==type){flush();list=type;html+='<'+type+'>'}html+='<li>'+inline(item[1])+'</li>';continue}
  paragraph.push(line);
 }
 flush();return html;
}
for(const group of [...new Set(pages.map(p=>p.group))]){const h=document.createElement('h3');h.textContent=group;sidebar.append(h);for(const p of pages.filter(p=>p.group===group)){const a=document.createElement('a');a.href='#'+p.slug;a.textContent=p.title;a.dataset.page=p.slug;sidebar.append(a)}}
const menu=document.querySelector('#doc-menu');
function closeMenu(){sidebar.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open documentation navigation')}
menu.onclick=()=>{const open=sidebar.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close documentation navigation':'Open documentation navigation');if(open)sidebar.querySelector('[aria-current=page]')?.focus()};
function render(){
 const [id,heading]=location.hash.slice(1).split('/');const p=pages.find(p=>p.slug===id)||pages[0],i=pages.indexOf(p);
 main.innerHTML='<div class="crumb">Documentation / '+escape(p.group)+'</div>'+markdown(p.markdown)+'<nav class="doc-pagination" aria-label="Previous and next page">'+(i?'<a href="#'+pages[i-1].slug+'"><small>Previous</small>'+escape(pages[i-1].title)+'</a>':'')+(i<pages.length-1?'<a href="#'+pages[i+1].slug+'"><small>Next</small>'+escape(pages[i+1].title)+'</a>':'')+'</nav>';
 document.title=p.title+' · ChatSkins Docs';
 sidebar.querySelectorAll('a').forEach(a=>{if(a.dataset.page===p.slug)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 toc.innerHTML='<strong>On this page</strong>'+p.headings.map(h=>'<a href="#'+p.slug+'/'+slug(h)+'">'+escape(h)+'</a>').join('');
 main.querySelectorAll('.copy').forEach(button=>button.onclick=async()=>{const code=button.parentElement.querySelector('code');try{await navigator.clipboard.writeText(code.textContent);button.textContent='Copied';setTimeout(()=>button.textContent='Copy',1800)}catch{const range=document.createRange();range.selectNodeContents(code);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent='Selected — copy manually'}});
 closeMenu();results.hidden=true;
 if(heading)document.getElementById(heading)?.scrollIntoView();else window.scrollTo(0,0);
}
const search=document.querySelector('#doc-search'),results=document.querySelector('#search-results');
search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();results.replaceChildren();results.hidden=!q;if(!q)return;
 const found=[];for(const p of pages){if(p.title.toLowerCase().includes(q))found.push({p,label:p.title});for(const h of p.headings)if(h.toLowerCase().includes(q))found.push({p,label:h,h})}
 if(!found.length){const empty=document.createElement('p');empty.className='empty';empty.textContent='No matches. Try “emotes”, “size”, or “frames”.';results.append(empty)}
 for(const {p,label,h}of found.slice(0,24)){const a=document.createElement('a');a.href='#'+p.slug+(h?'/'+slug(h):'');a.innerHTML=escape(label)+'<small>'+escape(p.group+' / '+p.title)+'</small>';a.onclick=()=>{results.hidden=true;search.value='';if(location.hash===a.hash)main.focus()};results.append(a)}
});
search.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('a')?.focus()}if(e.key==='Enter')results.querySelector('a')?.click()});
results.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp'].includes(e.key))return;e.preventDefault();const links=[...results.querySelectorAll('a')],i=links.indexOf(document.activeElement);links[Math.max(0,Math.min(links.length-1,i+(e.key==='ArrowDown'?1:-1)))]?.focus()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){results.hidden=true;if(sidebar.classList.contains('open')){closeMenu();menu.focus()}else search.focus()}});
document.addEventListener('click',e=>{if(!results.contains(e.target)&&e.target!==search)results.hidden=true;if(sidebar.classList.contains('open')&&!sidebar.contains(e.target)&&!menu.contains(e.target))closeMenu()});
window.addEventListener('hashchange',()=>{render();main.focus({preventScroll:true})});render();
