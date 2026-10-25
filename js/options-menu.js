export const OPTION_TABS=Object.freeze(['look','studio','style','chat','viewers','alerts','link']);

export function nextOptionTab(current,key,length=OPTION_TABS.length){
  if(!length)return 0;
  if(key==='Home')return 0;
  if(key==='End')return length-1;
  if(key==='ArrowRight')return(current+1)%length;
  if(key==='ArrowLeft')return(current-1+length)%length;
  return current;
}

export function initOptionsMenu({document:doc=globalThis.document,storage=globalThis.localStorage,returnTo='',onChange=()=>{}}={}){
  const tabs=OPTION_TABS.map(name=>doc.querySelector(`#options-tab-${name}`));
  const panels=OPTION_TABS.map(name=>doc.querySelector(`#options-panel-${name}`));
  if(tabs.some(x=>!x)||panels.some(x=>!x))return{activate(){},selected:()=>0};
  let selected=0;
  try{const saved=storage?.getItem('chat-studio.options-menu.v1');if(OPTION_TABS.includes(saved))selected=OPTION_TABS.indexOf(saved)}catch{}
  if(returnTo&&returnTo.startsWith('#'))selected=Math.max(0,panels.findIndex(panel=>panel.contains(doc.querySelector(returnTo))));
  const activate=(index,{focusPanel=true,focusTab=false,restore=false}={})=>{
    if(index<0||index>=tabs.length)return;
    selected=index;
    tabs.forEach((tab,i)=>{const active=i===index;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;panels[i].hidden=!active});
    try{storage?.setItem('chat-studio.options-menu.v1',OPTION_TABS[index])}catch{}
    onChange(OPTION_TABS[index]);
    if(focusTab)tabs[index].focus();tabs[index].scrollIntoView?.({block:'nearest',inline:'nearest'});
    if(focusPanel&&!restore)panels[index].querySelector('h2')?.focus?.({preventScroll:true});
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activate(index,{focusPanel:true}));
    tab.addEventListener('keydown',event=>{const next=nextOptionTab(index,event.key,tabs.length);if(next===index)return;event.preventDefault();activate(next,{focusPanel:false,focusTab:true})});
  });
  activate(selected,{focusPanel:false,restore:true});
  return{activate,selected:()=>selected,tabNames:OPTION_TABS};
}

export function isDockVisible(rect,viewportHeight){return !!rect&&rect.width>0&&rect.height>0&&rect.top>=-1&&rect.bottom<=viewportHeight+1}

export function hasFrameCard(skin){return !!(skin?.frameTemplate||skin?.illustration)}

export function frameBrandColorPatch(settings){
  const color=String(settings?.parts?.name?.paint?.color||'#A9CAFFFF').slice(0,7).toUpperCase();
  const patch={frameColor:color};
  if(settings?.illustration?.layers){patch.illustration={layers:{}};for(const[name,layer]of Object.entries(settings.illustration.layers))patch.illustration.layers[name]={...layer,color}}
  return patch;
}
