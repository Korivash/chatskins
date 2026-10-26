import {readFile,rename,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const stores=new Map();
export function createAiUsageStore(file){
 const path=resolve(file);if(stores.has(path))return stores.get(path);
 let statePromise=null,writeQueue=Promise.resolve();
 const load=()=>statePromise||=(async()=>{try{const data=JSON.parse(await readFile(path,'utf8'));if(data&&data.version===1){for(const day of Object.values(data.days||{}))day.reservedTokens=0;return data}}catch{}return{version:1,days:{}}})();
 const persist=state=>{writeQueue=writeQueue.catch(()=>{}).then(async()=>{const temp=`${path}.tmp`;try{await writeFile(temp,JSON.stringify(state),'utf8');await rename(temp,path)}catch{await writeFile(path,JSON.stringify(state),'utf8').catch(()=>{})}});return writeQueue};
 const store={load,persist};stores.set(path,store);return store;
}
