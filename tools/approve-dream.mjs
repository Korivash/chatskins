#!/usr/bin/env node
/**
 * Repository tool approve-dream.mjs supports ChatSkins asset or review work.
 * Used from the command line by maintainers; it is not loaded by site pages.
 * Main exports: module declarations.
 * Invariant: tool output must not change site data unless explicitly requested.
 */
/**
 * Review a private Dream submission from the command line.
 * Usage: node tools/approve-dream.mjs <submission-id> [--reject]
 */
import {approveDream} from '../server/dream.mjs';

const id=process.argv[2];
const reject=process.argv.includes('--reject');
if(!id||id.startsWith('--')){
 process.stderr.write('Usage: node tools/approve-dream.mjs <submission-id> [--reject]\n');
 process.exitCode=2;
}else{
 try{
  const result=await approveDream(id,{reject});
  process.stdout.write(reject?`Rejected ${id}.\n`:`Approved ${result.id}.\n`);
 }catch(error){
  process.stderr.write(`Could not review ${id}: ${error.message}\n`);
  process.exitCode=1;
 }
}
