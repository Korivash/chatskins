import {CLEAN} from './settings.js';

const sectionFor = path => {
  const [root, part] = path.split('.');
  if (root === 'parts') return ({panel:'Panel',messageBox:'Message box',name:'Name',messageText:'Message text',badges:'Badges',system:'System'})[part];
  if (root === 'frame' || root === 'hideFrames') return 'Frame';
  if (root === 'backgrounds' || root === 'transparentBackground') return 'Background';
  if (root === 'nameTemplate') return 'Name format';
  if (root === 'customCSS') return 'Advanced';
  if (['animationIn','animationDuration','animationOut','animationOutDuration','borderEffect','borderEffectSpeed','borderEffectColor','nameEffect','nameGradientColor1','nameGradientColor2','textEffect','typewriterDuration','backgroundEffect','backgroundSecondaryColor','backgroundTreatment','ambientEffect','reduceMotion'].includes(root)) return 'Animation & effects';
  if (['roleColorsEnabled','broadcasterNameColor','modNameColor','vipNameColor','subNameColor','mentionHighlightEnabled','mentionHighlightColor','effectColors'].includes(root)) return 'Roles';
  if (['hideCommands','hideBots','botNames','hideLinks'].includes(root)) return 'Filters';
  if (['maxMessages','messageLifetime','direction','alignment','overlayWidth','edgeInset','messageSpacing'].includes(root)) return 'Layout';
  if (['fontFamily','fontSize','fontWeight','lineHeight','textColor','nameColorMode','nameColor','systemColor','showBadges','outlineWidth','outlineColor','shadowEnabled','shadowColor','shadowOpacity','shadowBlur','borderStyle','borderColor','borderWidth','backgroundColor','backgroundOpacity','backgroundScope','cornerRadius','paddingX','paddingY'].includes(root)) return 'Frame';
  return 'Layout';
};

function leaves(value, path='', out=[]) {
  if (Array.isArray(value)) { if(value.every(item=>item===null||['string','number','boolean'].includes(typeof item))) out.push(path); else value.forEach((item,index)=>leaves(item,`${path}.${index}`,out)); return out; }
  if (value && typeof value === 'object') { for (const [key, child] of Object.entries(value)) leaves(child, path ? `${path}.${key}` : key, out); return out; }
  out.push(path); return out;
}

export const CONTROL_MAP = Object.freeze(Object.fromEntries(leaves(CLEAN).filter(path => path !== 'schemaVersion').map(path => [path, sectionFor(path)])));
export const CONTROL_SECTIONS = Object.freeze([...new Set(Object.values(CONTROL_MAP))]);
