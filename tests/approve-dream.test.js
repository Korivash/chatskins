import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {approveDream} from '../server/dream.mjs';

async function seed(t){
 const dataDir=await mkdtemp(join(tmpdir(),'chatskins-approval-'));
 const submissions=join(dataDir,'dream-submissions');await mkdir(submissions,{recursive:true});
 const id='a'.repeat(24),entry={id,name:'Ghost Garden',description:'A lilac ghost chat frame.',credit:'MoonCat',moodTags:['spooky'],design:{version:1,catalog:19,board:[600,680],name:'Ghost Garden',motion:true,palette:['#8A69B8'],instances:[{part:19,x:8,y:10,w:84,h:80,angle:0,flipX:false,flipY:false,colors:[0,0,0]}]},settings:{fontSize:20},status:'pending'};
 const file=join(submissions,`${id}.json`);await writeFile(file,JSON.stringify(entry));
 const skinsFile=join(dataDir,'skins.json');await writeFile(skinsFile,JSON.stringify({skins:[{id:'clean',name:'Clean',settings:{fontSize:18}}]}));
 t.after(()=>rm(dataDir,{recursive:true,force:true}));return{dataDir,file,skinsFile,id};
}

test('approved dreams become Community skins and retain art credit',async t=>{
 const fx=await seed(t),skin=await approveDream(fx.id,{dataDir:fx.dataDir,skinsFile:fx.skinsFile});
 assert.equal(skin.category,'Community');assert.equal(skin.credit,'MoonCat');assert.ok(skin.settings.studioDesign.instances.some(part=>part.part===19));
 const catalog=JSON.parse(await readFile(fx.skinsFile,'utf8'));assert.equal(catalog.skins.at(-1).id,`community-${fx.id}`);
});

test('rejected dreams are retained with a rejected state',async t=>{
 const fx=await seed(t),entry=await approveDream(fx.id,{dataDir:fx.dataDir,reject:true});
 assert.equal(entry.status,'rejected');assert.equal(JSON.parse(await readFile(fx.file,'utf8')).status,'rejected');
});
