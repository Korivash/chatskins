/**
 * Browser module request-form.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: module declarations.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {initSite} from './site.js';
initSite();

const limits={name:60,inspired:80,colors:80,font:60,frame:120,description:800,channel:25,discord:40,website:200};
const required=['name','inspired','colors','description'];
const form=document.querySelector('#quest-form'),status=document.querySelector('#form-status'),submit=document.querySelector('#submit-quest');

const palette=document.createElement('div');
palette.className='palette-pickers';
for(const [index,label] of ['Color one','Color two'].entries()){const wrapper=document.createElement('label');
  wrapper.textContent=label;
  const picker=document.createElement('input');
  picker.type='color';
  picker.value=index?'#C7B5FF':'#8CECE0';
  picker.setAttribute('aria-label',label);
  picker.addEventListener('input',()=>{const colors=[...palette.querySelectorAll('input')].map(el=>el.value.toUpperCase());form.elements.namedItem('colors').value=colors.join(', ')});
  wrapper.append(picker);
  palette.append(wrapper)}form.elements.namedItem('colors').after(palette);

function validate(data){const errors={};
  for(const [key,max] of Object.entries(limits)){const value=data[key];
    if(typeof value!=='string'){errors[key]='Enter text for this field.';
      continue}if([...value].length>max)errors[key]=`Use ${max} characters or fewer.`;
    else if(required.includes(key)&&!value.trim())errors[key]='This field is required.'}if(data.channel&&!/^[A-Za-z0-9_]{1,25}$/.test(data.channel.trim()))errors.channel='Use 1–25 letters, numbers or underscores.';
  return errors}
form.addEventListener('submit',async event=>{event.preventDefault();for(const el of form.querySelectorAll('[aria-invalid]')){el.removeAttribute('aria-invalid');el.removeAttribute('aria-describedby')}const data=Object.fromEntries(new FormData(form));const errors=validate(data);if(Object.keys(errors).length){for(const [key,msg] of Object.entries(errors)){const input=form.elements.namedItem(key);input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',`${key}-error`);document.querySelector(`#${key}-error`).textContent=msg}document.querySelector('#form-error').textContent='Check the highlighted fields: name, inspiration, colors and description.';form.querySelector('[aria-invalid]')?.focus();return}submit.disabled=true;status.textContent='Sending request…';try{const response=await fetch('/api/skin-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});let result={};try{result=await response.json()}catch{}if(response.status===429){status.textContent=`Quest board is busy. Try again in ${result.retryAfter||60} seconds. Your draft is safe.`;return}if(!response.ok){if(response.status===400&&result.errors){for(const[key,msg]of Object.entries(result.errors)){const input=form.elements.namedItem(key);if(input){input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',`${key}-error`);const error=document.querySelector(`#${key}-error`);if(error)error.textContent=msg}}document.querySelector('#form-error').textContent='Please check the highlighted fields.'}else status.textContent='Your quest couldn’t be delivered. Your draft is still here. Try again.';return}status.textContent='Your idea was received. It is not scheduled.';form.reset();document.querySelector('#another').hidden=false}catch{status.textContent='Your quest couldn’t be delivered. Your draft is still here. Try again.'}finally{submit.disabled=false}});
document.querySelector('#another').onclick=()=>{status.textContent='';
  document.querySelector('#another').hidden=true;
  form.querySelector('[name=name]').focus()};

