"""Structural design review without third-party dependencies."""
import json, re
from pathlib import Path
d=json.loads(Path('design/skins.json').read_text(encoding='utf-8'))
errors=[]
def check(v,s,p):
    t=s.get('type')
    if t=='object':
        if not isinstance(v,dict): errors.append(p+': object'); return
        for k in s.get('required',[]):
            if k not in v: errors.append(p+'.'+k+': missing')
        for k,x in v.items():
            if k in s.get('properties',{}): check(x,s['properties'][k],p+'.'+k)
            elif s.get('additionalProperties') is False: errors.append(p+'.'+k+': unknown')
    elif t=='array':
        for i,x in enumerate(v): check(x,s['items'],p+'.'+str(i))
        if len(v)<s.get('minItems',0) or len(v)>s.get('maxItems',float('inf')): errors.append(p+': array size')
    elif t in ('number','integer'):
        if not isinstance(v,(int,float)) or isinstance(v,bool): errors.append(p+': numeric type')
        elif v<s.get('minimum',-float('inf')) or v>s.get('maximum',float('inf')): errors.append(p+': numeric range')
        elif t=='integer' and int(v)!=v: errors.append(p+': not integer')
    elif t=='boolean' and not isinstance(v,bool): errors.append(p+': boolean')
    elif t=='string':
        if not isinstance(v,str): errors.append(p+': string')
        elif len(v)<s.get('minLength',0) or len(v)>s.get('maxLength',float('inf')): errors.append(p+': length')
        elif 'pattern' in s and not re.search(s['pattern'],v): errors.append(p+': pattern')
    if 'enum' in s and v not in s['enum']: errors.append(p+': enum')
    if 'const' in s and v!=s['const']: errors.append(p+': const')
for skin in d['skins']: check(skin['settings'],d['settingsSchema'],skin['id'])
assert len(d['skins'])==34
assert len({s['id'] for s in d['skins']})==34
assert [s['id'] for s in d['skins'] if s['featured']]==d['featuredSkinIds']
assert len(d['featuredSkinIds'])==6
assert all(s['category']=='Streamer favorites' for s in d['skins'][:12])
page=Path('design/mockup.html').read_text(encoding='utf-8')
assert page.count('<article ')==34
assert page.count('class="featured"')==6
for s in d['skins']: assert 'id="'+s['id']+'"' in page
print('\n'.join(errors) if errors else 'PASS: 34 full presets satisfy schema types, ranges, patterns, enums, required keys and gallery invariants.')
raise SystemExit(bool(errors))
