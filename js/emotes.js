/**
 * Browser module emotes.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: parseEmotes, normalizeEmoteResponse, resolveEmotes.
 * Invariant: preserve existing settings links and render chat content as text.
 */
// Twitch's native byte/code-point ranges are resolved before community codes.
/** parse emotes.
 * @param {unknown} text Function input.
 * @param {unknown} emotes Function input.
 * @param {unknown} markNative Function input.
 * @returns {unknown} The function result.
 */
export function parseEmotes(text, emotes = {}, markNative = false) {
  const spans=[];
  
  for(const [id,positions] of Object.entries(emotes||{})) for(const pos of positions||[]) {
    const [a,b]=String(Array.isArray(pos)?pos.join('-'):pos).split('-').map(Number);
    
    if(Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=a&&b<text.length)spans.push({a,b,id});
    
  }
  spans.sort((x,y)=>x.a-y.a||x.b-y.b);
  
  const out=[];
  let i=0;
  
  for(const s of spans){if(s.a<i)continue;
    if(s.a>i)out.push({type:'text',text:text.slice(i,s.a)});
    out.push({type:'emote',id:s.id,text:text.slice(s.a,s.b+1),...(markNative?{native:true}:{})});
    i=s.b+1;
    }
  if(i<text.length)out.push({type:'text',text:text.slice(i)});
  return out;
  
}

const httpsUrl = value => { if(typeof value!=='string')return '';
  const u=value.startsWith('//')?`https:${value}`:value;
  try{return new URL(u).protocol==='https:'?u:''}catch{return ''} };

const item=(provider,id,url,width=28,height=28)=>url?{provider,id:String(id||''),url,width:Number(width)||28,height:Number(height)||28}:null;

function put(map,code,value){if(typeof code==='string'&&code&&!/\s/.test(code)&&value?.url)map.set(code,value)}
function seven(emotes,map){for(const e of emotes||[]){const files=e.data?.host?.files||e.host?.files||e.images;
    const host=e.data?.host?.url||e.host?.url;
    let url='';
    if(Array.isArray(files)){const f=files.find(x=>/webp/i.test(x.name||''))||files.find(x=>/png/i.test(x.name||''))||files[0];
      if(f)url=host?`${host}/${f.name}`:f.url;
      }url=httpsUrl(url);
    put(map,e.name,item('7tv',e.id,url,e.data?.width||e.width,e.data?.height||e.height));
    }}
function bttv(list,map){for(const e of list||[])put(map,e.code,item('bttv',e.id,httpsUrl(`https://cdn.betterttv.net/emote/${encodeURIComponent(e.id)}/2x`),e.width,e.height));
  }
function ffzSets(sets,map){for(const set of Object.values(sets||{}))for(const e of set.emoticons||[]){const urls=e.urls||{};
    const choice=urls['2']||urls['1']||urls['4'];
    const url=httpsUrl(typeof choice==='string'?choice:'');
    put(map,e.name,item('ffz',e.id,url));
    }}
/** normalize emote response.
 * @param {unknown} provider Function input.
 * @param {unknown} data Function input.
 * @param {unknown} scope Function input.
 * @returns {unknown} The function result.
 */
export function normalizeEmoteResponse(provider,data,scope='channel'){
  const map=new Map();
  
  if(provider==='7tv') {if(scope==='global'){if(!Array.isArray(data?.emotes))throw Error('Invalid 7TV global response');
      seven(data.emotes,map);
      }else{if(!data||!('emote_set'in data))throw Error('Invalid 7TV channel response');
      seven(data.emote_set?.emotes||[],map);
      }}
  else if(provider==='bttv'){const list=scope==='global'?data:(data&&Array.isArray(data.channelEmotes)&&Array.isArray(data.sharedEmotes)?[...data.channelEmotes,...data.sharedEmotes]:null);
    if(!Array.isArray(list))throw Error('Invalid BTTV response');
    bttv(list,map);
    }
  else if(provider==='ffz'){if(scope==='global'){if(!data?.sets||!Array.isArray(data.default_sets))throw Error('Invalid FFZ global response');
      ffzSets(Object.fromEntries(data.default_sets.map(id=>[id,data.sets[id]]).filter(x=>x[1])),map);
      }else{if(!data?.sets||data.room?.set===undefined||data.room?.set===null)throw Error('Invalid FFZ channel response');
      const ids=Array.isArray(data.room.set)?data.room.set:[data.room.set];
      ffzSets(Object.fromEntries(ids.map(id=>[id,data.sets[id]]).filter(x=>x[1])),map);
      }}
  else throw Error('Unknown emote provider');
  
  return map;
  
}
// Native spans always win. Community codes only match complete whitespace-delimited tokens.
/** resolve emotes.
 * @param {unknown} text Function input.
 * @param {unknown} native Function input.
 * @param {unknown} community Function input.
 * @returns {unknown} The function result.
 */
export function resolveEmotes(text,native={},community=new Map()){
  const result=[];
  for(const part of parseEmotes(text,native,true)){if(part.type==='emote'){result.push(part);
      continue;
      }const re=/\S+/gu;
    let last=0,m;
    while((m=re.exec(part.text))){if(m.index>last)result.push({type:'text',text:part.text.slice(last,m.index)});
      const value=community.get(m[0]),url=typeof value?.url==='string'&&value.url.trim()&&value.url!=='undefined'?value.url:'';
      result.push(value&&url?{type:'emote',id:value.id,text:m[0],url,provider:value.provider,width:value.width,height:value.height}:{type:'text',text:m[0]});
      last=m.index+m[0].length;
      }if(last<part.text.length)result.push({type:'text',text:part.text.slice(last)});
    }return result;
  
}
