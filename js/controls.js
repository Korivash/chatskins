/**
 * Browser module controls.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: module declarations.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {CLEAN} from './settings.js';

function leaves(v,path='',out=[]){if(Array.isArray(v)){if(v.every(x=>x===null||['string','number','boolean'].includes(typeof x)))out.push(path);
    else v.forEach((x,i)=>leaves(x,`${path}.*`,out));
    return out}if(v&&typeof v==='object'){for(const[k,x]of Object.entries(v))leaves(x,path?`${path}.${k}`:k,out);
    return out}out.push(path);
  return out}
const section=path=>{const [r,p]=path.split('.');
  if(r==='parts')return `${({panel:'Panel',messageBox:'Message box',name:'Name',messageText:'Message text',badges:'Badges',system:'System'})[p]} · ${path.split('.')[2]==='fontFamily'||path.split('.')[2]==='fontSize'||path.split('.')[2]==='fontWeight'||path.split('.')[2]==='italic'||path.split('.')[2]==='letterSpacing'||path.split('.')[2]==='uppercase'||path.split('.')[2]==='lineHeight'||path.split('.')[2]==='inheritTypography'?'Font':(['paint','outline','shadow','glow'].includes(path.split('.')[2])?({paint:'Color',outline:'Effects',shadow:'Effects',glow:'Effects'})[path.split('.')[2]]:'Effects')}`;
  if(r==='channels'||r==='customCSS')return 'Advanced';
  if(r==='presentation'||r==='grouping'||r==='messageLimits'||['maxMessages','direction','alignment','overlayWidth','edgeInset','messageSpacing'].includes(r))return 'Layout';
  if(r==='frame'||r==='hideFrames')return 'Frame';
  if(r==='backgrounds'||r==='transparentBackground')return 'Background';
  if(r==='nameTemplate')return 'Name format';
  if(r==='emotes')return 'Emotes';
  if(r==='emphasis')return 'Filters & emphasis';
  if(r==='nameStyle')return 'Name';
  if(r==='lifecycle'||['animationOut','animationOutDuration','animationIn','animationDuration','reduceMotion','messageLifetime'].includes(r))return 'Motion';
  if(['hideCommands','hideBots','botNames','hideLinks','effectColors','roleColorsEnabled','broadcasterNameColor','modNameColor','vipNameColor','subNameColor','mentionHighlightEnabled','mentionHighlightColor','nameColorMode'].includes(r))return 'Filters & emphasis';
  if(r==='schemaVersion')return '';
  return 'Motion';
  };

const human={fontFamily:'Font family',fontSize:'Font size',fontWeight:'Font weight',italic:'Italic',letterSpacing:'Letter spacing',uppercase:'Uppercase',lineHeight:'Line height',inheritTypography:'Use parent typography',mode:'Color mode',color:'Color',angle:'Gradient angle',position:'Stop position',width:'Outline width',enabled:'Shadow on',x:'Shadow offset X',y:'Shadow offset Y',blur:'Shadow blur',spread:'Glow spread',radius:'Corner radius',target:'Frame target',style:'Frame style',doubleGap:'Double frame gap',pixelStep:'Pixel step',topLeft:'Top left radius',topRight:'Top right radius',bottomRight:'Bottom right radius',bottomLeft:'Bottom left radius',padding:'Padding',top:'Top padding',right:'Right padding',bottom:'Bottom padding',left:'Left padding',outer:'Outer ring',ornament:'Ornaments',size:'Ornament size',inset:'Ornament inset',opacity:'Opacity',backdropBlur:'Backdrop blur',recipe:'Background recipe',imageUrl:'Image URL',imageFit:'Image fit',imageOpacity:'Image opacity',radialCenterX:'Gradient center X',radialCenterY:'Gradient center Y',layout:'Name layout',shape:'Message shape',nameTreatment:'Name treatment',accent:'Frame accent',chipColor:'Name chip color',columnWidth:'Name column width',initialSize:'Initial size',tailSize:'Speech tail size',cutSize:'Cut corner size',readableColors:'Keep names readable',minContrast:'Minimum name contrast',windowSeconds:'Group within',maxLineCh:'Maximum line length',maxLines:'Maximum message lines',fadeMaskPx:'Overflow fade depth',firstMessage:'Highlight tagged first messages',sevenTV:'7TV emotes',bttv:'BTTV emotes',ffz:'FFZ emotes',emoteOnlyScale:'Emote only scale',inlineSize:'Inline emote size',animationOutDuration:'Removal duration',messageLifetime:'Message lifetime',animationDuration:'Entrance duration',borderEffectSpeed:'Border effect speed',typewriterDuration:'Typewriter duration',maxMessages:'Maximum messages',overlayWidth:'Chat width',edgeInset:'Edge inset',messageSpacing:'Message spacing',direction:'Chat direction',alignment:'Chat alignment',transparentBackground:'Transparent background',hideFrames:'Hide frames',roleColorsEnabled:'Use role colors',mentionHighlightEnabled:'Highlight mentions',hideCommands:'Hide commands',hideBots:'Hide bots',hideLinks:'Hide links',botNames:'Bot names',reduceMotion:'Reduce motion',source:'Custom CSS'};

const labels={};
for(const path of leaves(CLEAN)){if(path==='schemaVersion')continue;
  const key=path.split('.').at(-1).replace(/\[\d+\]/g,'');
  let label=human[key]||key.replace(/[A-Z]/g,m=>' '+m.toLowerCase()).replace(/^./,m=>m.toUpperCase());
  if(key==='shadow')label='Shadow';
  if(key==='glow')label='Glow';
  if(path==='frame.width')label='Frame width';
  if(path.includes('.glow.blur'))label='Glow blur';
  if(path.includes('.shadow.blur'))label='Shadow blur';
  if(path.includes('.glow.enabled'))label='Glow on';
  if(path.includes('.shadow.enabled'))label='Shadow on';
  if(path.endsWith('.shadow.x'))label='Shadow offset X';
  if(path.endsWith('.shadow.y'))label='Shadow offset Y';
  labels[path]=label;
  }
function indexed(v,path='',out={}){if(Array.isArray(v)){if(v.every(x=>x===null||['string','number','boolean'].includes(typeof x))){out[path]=labels[path];
      return out}v.forEach((x,i)=>indexed(x,`${path}.${i}`,out));
    return out}if(v&&typeof v==='object'){for(const[k,x]of Object.entries(v))indexed(x,path?`${path}.${k}`:k,out);
    return out}if(path!=='schemaVersion')out[path]=labels[path.replace(/\.\d+(?=\.|$)/g,'.*')];
  return out}
export const CONTROL_MAP=Object.freeze(Object.fromEntries(Object.keys(indexed(CLEAN)).map(path=>[path,section(path)]).filter(([,s])=>s)));

const controlLabels=indexed(CLEAN);
controlLabels['channels.enabled']='Enable chat channels';
controlLabels['channels.rules']='Chat channel rules';

export const CONTROL_LABELS=Object.freeze(controlLabels);

export const CONTROL_SECTIONS=Object.freeze([...new Set(Object.values(CONTROL_MAP))]);

