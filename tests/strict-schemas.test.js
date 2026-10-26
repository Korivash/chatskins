import assert from 'node:assert/strict';
import test from 'node:test';
import {assistantToolDefinitions} from '../server/assistant.mjs';
import {buildDescribeSchema} from '../server/describe.mjs';
import {buildDreamSchema,studioSchema} from '../server/dream.mjs';

const supportedTypes=new Set(['string','number','integer','boolean','object','array','null']);
const supportedFormats=new Set(['date-time','time','date','duration','email','hostname','ipv4','ipv6','uuid']);
const supportedKeywords=new Set([
 'type','properties','required','additionalProperties','items','enum','anyOf',
 'pattern','format','minLength','maxLength','minimum','maximum','exclusiveMinimum',
 'exclusiveMaximum','multipleOf','minItems','maxItems','description','title'
]);

/** Walk a JSON schema and enforce the strict subset used by these API calls. */
function validateSchema(root,label){
 let propertyCount=0;
 let enumValueCount=0;

 function visit(node,path,depth){
  assert.ok(node&&typeof node==='object'&&!Array.isArray(node),`${label} ${path} must be a schema object`);
  for(const keyword of Object.keys(node)){
   assert.ok(supportedKeywords.has(keyword),`${label} ${path} uses unsupported keyword ${keyword}`);
  }
  assert.ok(node.type!==undefined,`${label} ${path} must declare a type`);

  const types=Array.isArray(node.type)?node.type:[node.type];
  assert.ok(types.length>0,`${label} ${path} has an empty type list`);
  for(const type of types)assert.ok(supportedTypes.has(type),`${label} ${path} has unsupported type ${type}`);
  const objectDepth=depth+(types.includes('object')?1:0);
  assert.ok(objectDepth<=5,`${label} ${path} is nested deeper than five object levels`);

  if(node.enum!==undefined){
   assert.ok(Array.isArray(node.enum),`${label} ${path} enum must be an array`);
   enumValueCount+=node.enum.length;
  }
  if(node.format!==undefined)assert.ok(supportedFormats.has(node.format),`${label} ${path} uses unsupported format ${node.format}`);
  if(node.pattern!==undefined)assert.ok(types.includes('string'),`${label} ${path} applies pattern to a non-string`);

  if(types.includes('object')){
   const properties=node.properties||{};
   assert.equal(node.additionalProperties,false,`${label} ${path} objects must set additionalProperties:false`);
   assert.ok(Array.isArray(node.required),`${label} ${path} objects must list required properties`);
   assert.deepEqual([...node.required].sort(),Object.keys(properties).sort(),`${label} ${path} must require every property`);
   propertyCount+=Object.keys(properties).length;
   for(const [name,child]of Object.entries(properties))visit(child,`${path}.${name}`,objectDepth);
  }
  if(types.includes('array')){
   assert.ok(node.items,`${label} ${path} arrays need an item schema`);
   visit(node.items,`${path}[]`,objectDepth);
  }
  if(node.anyOf!==undefined){
   assert.ok(Array.isArray(node.anyOf)&&node.anyOf.length>0,`${label} ${path} anyOf must contain schemas`);
   node.anyOf.forEach((choice,index)=>visit(choice,`${path}.anyOf[${index}]`,objectDepth));
  }
 }

 visit(root,label,1);
 assert.ok(propertyCount<=5000,`${label} exceeds the object property limit`);
 assert.ok(enumValueCount<=1000,`${label} exceeds the enum value limit`);
}

test('Dream, Describe and every Assistant function use valid strict schemas',()=>{
 const parts=Array.from({length:61},(_,index)=>index);
 validateSchema(studioSchema,'Dream Studio schema');
 validateSchema(buildDreamSchema(parts,['DM Sans','Barlow']),'Dream response schema');
 validateSchema(buildDescribeSchema({skins:[{id:'clean'},{id:'signature'}]},['DM Sans','Barlow']),'Describe response schema');
 for(const tool of assistantToolDefinitions){
  assert.equal(tool.strict,true,`${tool.name} is strict`);
  validateSchema(tool.parameters,`Assistant ${tool.name}`);
 }
});

test('the schema walker rejects untyped anyOf branches and optional object fields',()=>{
 const badBranch={type:'object',additionalProperties:false,required:['value'],properties:{value:{type:'string',anyOf:[{}]}}};
 assert.throws(()=>validateSchema(badBranch,'fixture'),/must declare a type/);
 const optionalField={type:'object',additionalProperties:false,required:[],properties:{value:{type:'string'}}};
 assert.throws(()=>validateSchema(optionalField,'fixture'),/must require every property/);
});
