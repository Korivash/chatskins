/**
 * Browser module compact-link.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: settingsDiff, applySettingsDiff, compressJson, decompressJson, compactOverlayUrl.
 * Invariant: preserve existing settings links and render chat content as text.
 */
const bytesToBase64Url=bytes=>{let binary='';
  for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'')};
const base64UrlToBytes=value=>Uint8Array.from(atob(String(value).replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(String(value).length/4)*4,'=')),char=>char.charCodeAt(0));
/** set diff.
 * @param {unknown} base Function input.
 * @param {unknown} value Function input.
 * @returns {unknown} The function result.
 */
export function settingsDiff(base,value){if(base===value)return undefined;if(!base||!value||typeof base!=='object'||typeof value!=='object'||Array.isArray(base)||Array.isArray(value))return structuredClone(value);const out={};for(const key of Object.keys(value)){const diff=settingsDiff(base[key],value[key]);if(diff!==undefined)out[key]=diff}return out}
/** apply settings diff.
 * @param {unknown} base Function input.
 * @param {unknown} diff Function input.
 * @returns {unknown} The function result.
 */
export function applySettingsDiff(base,diff){if(!diff||typeof diff!=='object'||Array.isArray(diff))return structuredClone(diff);const out=base&&typeof base==='object'&&!Array.isArray(base)?structuredClone(base):{};for(const[key,value]of Object.entries(diff))out[key]=value&&typeof value==='object'&&!Array.isArray(value)?applySettingsDiff(out[key],value):structuredClone(value);return out}
/** compress json.
 * @param {unknown} value Function input.
 * @returns {unknown} The function result.
 */
export async function compressJson(value){const source=new TextEncoder().encode(JSON.stringify(value));const stream=new Blob([source]).stream().pipeThrough(new CompressionStream('deflate-raw'));return`z2.${bytesToBase64Url(new Uint8Array(await new Response(stream).arrayBuffer()))}`}
/** decompress json.
 * @param {unknown} encoded Function input.
 * @returns {unknown} The function result.
 */
export async function decompressJson(encoded){if(!String(encoded).startsWith('z2.'))return null;const data=base64UrlToBytes(String(encoded).slice(3)),stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return JSON.parse(new TextDecoder().decode(await new Response(stream).arrayBuffer()))}
/** Handle overlay url.
 * @param {unknown} baseUrl Function input.
 * @param {unknown} payload Function input.
 * @param {unknown} token Function input.
 * @returns {unknown} The function result.
 */
export async function compactOverlayUrl(baseUrl,payload,token){const data=await compressJson(payload),url=new URL('overlay.html',baseUrl),params=new URLSearchParams({v:'2',data});url.search='';if(token)params.set('access_token',token);url.hash=params.toString();if(url.href.length>=30000)throw new RangeError('This link is too long. Allow fewer custom skins, then try again.');return url.href}
