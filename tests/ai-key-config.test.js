import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createAssistantHandler} from '../server/assistant.mjs';
import {createDescribeHandler} from '../server/describe.mjs';
import {createDreamHandler} from '../server/dream.mjs';

test('AI handlers report unavailable when OPENAI_KEY_FILE is unset',async t=>{
  const previousKeyFile=process.env.OPENAI_KEY_FILE;
  delete process.env.OPENAI_KEY_FILE;
  const dir=await mkdtemp(join(tmpdir(),'chatskins-no-key-path-'));
  t.after(async()=>{
    if(previousKeyFile===undefined)delete process.env.OPENAI_KEY_FILE;
    else process.env.OPENAI_KEY_FILE=previousKeyFile;
    await rm(dir,{recursive:true,force:true});
  });

  const logs=[];
  const logger=line=>logs.push(String(line));
  const common={usageFile:join(dir,'usage.json'),logger};
  const assistant=createAssistantHandler(common);
  const describe=createDescribeHandler({...common,catalogFile:{skins:[]}});
  const dream=createDreamHandler({...common,dataDir:join(dir,'private'),imagesEnabled:false});
  const origin='https://getchatskins.com';

  const assistantReply=await assistant({
    headers:{origin},
    body:JSON.stringify({messages:[{role:'user',content:'How do I add chat to OBS?'}]}),
  });
  const describeReply=await describe({
    headers:{origin},
    body:JSON.stringify({text:'spooky purple chat'}),
  });
  const dreamReply=await dream({
    headers:{origin},
    body:JSON.stringify({text:'spooky frame with a ghost'}),
  });

  for(const reply of [assistantReply,describeReply,dreamReply]){
    assert.equal(reply.status,503);
    assert.equal(reply.body.error,'unavailable');
    assert.doesNotMatch(JSON.stringify(reply),/OPENAI_KEY_FILE|no-key-path/i);
  }
  assert.deepEqual(logs,[],'missing key configuration does not log a filesystem path');
});
