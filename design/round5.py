"""Regenerate the static Round 5 design artifacts; never imports application code."""
import copy, html, json, re
from pathlib import Path

ROOT = Path(__file__).parent
d = json.loads((ROOT / 'skins.json').read_text(encoding='utf-8'))
old = {s['id']: s for s in d['skins'] if s['id'] not in ['bubble-lift','name-tag','quiet-line','glass-card','neon-edge','sticker-stack','initial-card','comic-burst','signal-console','pastel-pop','announcer','esports-slash']}
base = copy.deepcopy(old['clean']['settings'])
# name, font, ink, name ink, surface, frame, format, scope, frame style,
# radius, layout, shape, name treatment, accent, visual rationale
rows = [
('Bubble Lift','Nunito Sans','#F7FCFF','#A5F4E4','#12313A','#65DCC7','{name}','message','solid',24,'stacked','speech','plain','none','Deep teal bubbles with a low left tail and a mint name above the message.'),
('Name Tag','Barlow','#F4F7FF','#14253B','#14253B','#8FC8FF','{name}','message','solid',3,'columns','rect','tab','rail','Blue name tabs form a vertical reading rail; bodies align in a second column.'),
('Quiet Line','DM Sans','#FFFFFF','#FFD78C','#101722','#FFD78C','{name} ·','message','none',0,'inline','rect','plain','underline','Warm editorial names, a short amber rule and a quiet dark reading strip.'),
('Glass Card','DM Sans','#F5FCFF','#B4E7FF','#182B43','#B4E7FF','{name}','message','solid',16,'stacked','rect','plain','topbar','Ice-blue translucent cards, a bright upper edge and soft depth.'),
('Neon Edge','Barlow','#F9F3FF','#F5A6FF','#21122E','#DC75FF','{name} /','message','solid',10,'stacked','rect','plain','rail','One violet neon rail on an ink-purple card; white body text stays unglowed.'),
('Sticker Stack','Nunito Sans','#FFF8F1','#382042','#382042','#FFBE75','{name}','message','solid',12,'stacked','rect','pill','none','Apricot name stickers with a small hard shadow on plum message cards.'),
('Initial Card','Lato','#F6FAFF','#B6D8FF','#1D293E','#728DB6','{name}','message','solid',8,'initials','rect','plain','none','A circular initial medallion anchors a compact two-row social card.'),
('Comic Burst','Barlow Condensed','#22223D','#22223D','#FFF4AC','#22223D','{name}!','message','solid',16,'stacked','speech','plain','none','Buttery speech balloons, thick ink outlines and offset ink shadows.'),
('Signal Console','IBM Plex Mono','#C9FBEA','#FFE2A0','#102322','#4EBA9E','@{name} $','message','dashed',0,'stacked','rect','plain','topbar','Mint receipt-like command blocks with amber prompts; no typing delay.'),
('Pastel Pop','Nunito Sans','#3C2B56','#513D6E','#F4DEFA','#9270BA','{name} ♡','message','solid',22,'stacked','ticket','plain','none','Lavender ticket bubbles with lilac corner dots and deep plum text.'),
('Announcer','Barlow Condensed','#F6FAFF','#FFCA79','#1D2738','#FFCA79','{name}','message','none',0,'announcer','rect','plain','underline','Oversized gold names headline compact dark lower thirds.'),
('Esports Slash','Barlow Condensed','#F7FAFF','#111F33','#111F33','#9DF36C','{name} //','message','solid',0,'columns','slash','tab','rail','Lime name plates and opposing diagonal ends; only the frame is slanted.'),
]

def presentation(layout='inline', shape='rect', treatment='plain', accent='none', color='#A9CAFF'):
    return dict(layout=layout, shape=shape, nameTreatment=treatment, accent=accent,
                chipColor=color+'FF', columnWidth=120, initialSize=40, tailSize=10, cutSize=12)

def configure(s, row):
    name,font,ink,nink,bg,edge,fmt,scope,style,radius,layout,shape,treatment,accent,desc=row
    s.update(fontFamily=font,fontSize=22,fontWeight=500,lineHeight=1.4,nameColorMode='fixed',
             nameTemplate='{badges} '+fmt+' ',nameFormat=fmt,textEffect='none',nameEffect='none',
             borderEffect='none',backgroundEffect='none',ambientEffect='none',animationIn='fade',animationDuration=180,
             messageSpacing=10,transparentBackground=False,hideFrames=False)
    for key,p in s['parts'].items():
        p.update(fontFamily=font,fontSize=14 if key=='badges' else 22,fontWeight=500,lineHeight=1.4,uppercase=False,italic=False,letterSpacing=0)
        p['paint'].update(mode='solid',color=(nink if key=='name' else ink)+'FF')
        p['outline']['width']=0
        p['shadow']['enabled']=False
        p['glow']['enabled']=False
    s['parts']['name']['fontWeight']=700
    s['parts']['name']['fontSize']=18 if layout in ('stacked','initials') else 22
    if layout=='announcer': s['parts']['name']['fontSize']=32
    f=s['frame']; f.update(target=scope,style=style,width=0 if style=='none' else 2,legacyDetail='none')
    f['paint'].update(mode='solid',color=edge+'FF')
    f['radius']={k:radius for k in f['radius']}
    f['padding']=dict(top=12,right=16,bottom=12,left=16)
    f['outer']['enabled']=False; f['ornament']['style']='none'
    for k,b in s['backgrounds'].items():
        b.update(mode='solid',color=bg+'FF',opacity=.96 if k==scope else 0,recipe='none',backdropBlur=0)
    s['presentation']=presentation(layout,shape,treatment,accent,edge)
    return desc

new=[]
for r in rows:
    ident=r[0].lower().replace(' ','-'); s=copy.deepcopy(base); desc=configure(s,r)
    if ident=='glass-card':
        s['backgrounds']['message'].update(opacity=.86,backdropBlur=12)
        s['parts']['messageBox']['shadow'].update(enabled=True,color='#00000066',x=0,y=4,blur=12)
    if ident=='comic-burst':
        s['frame']['width']=3
        s['parts']['messageBox']['shadow'].update(enabled=True,color='#22223DFF',x=4,y=4,blur=0)
    if ident=='neon-edge': s['borderEffect']='glow'
    if ident=='pastel-pop': s['frame']['ornament'].update(style='dots',color='#9270BAFF',size=4)
    new.append(dict(id=ident,name=r[0],category='Streamer favorites',description=desc,settings=s))

# Existing IDs remain stable. Guild's precise Round 3 geometry remains untouched.
polish=[
('fantasy-mmo','Noto Sans','#F3EEFF','#DAC1FF','#211D39','#B49CD8','[Party] {name} ›','panel','double',10,'inline','rect','plain','none','Lavender double window with inset diamond corners; softer and cooler than Guild.'),
('block-craft','Pixelify Sans','#F4F6EE','#B8F48E','#30392C','#829A6F','<{name}>','message','pixel',0,'inline','rect','plain','none','Moss-grey stepped blocks and bright grass names; compact square rows.'),
('old-school-mmo','Roboto Slab','#FFE498','#FFF3C5','#3C2B1B','#B39963','{name}:','panel','beveled',0,'inline','rect','plain','topbar','Ochre ledger in a brass bevel; a sober single pane with yellow dialogue.'),
('battle-arena','Barlow','#E4F6F6','#89EBDD','#102F34','#4FA59D','[Team] {name} ›','panel','solid',0,'columns','rect','plain','rail','Teal tactical pane with squared corner brackets and an aligned squad column.'),
('battle-royale','Barlow Condensed','#FFFFFF','#FFE7A1','#24303B','#D9B961','[Squad] {name}','message','solid',3,'stacked','ticket','plain','rail','Sand-yellow notched field cards; condensed names and individual charcoal plates.'),
('retro-rpg','VT323','#FFFFFF','#FFF2AB','#192E87','#EBF2FF','▸ {name}','panel','double',8,'inline','rect','plain','none','Cobalt dialogue window with a bright twin rim and triangular speaker prompt.'),
('terminal','IBM Plex Mono','#A9F7BB','#D4FFE0','#091A10','#598E63','{name} >','panel','solid',0,'inline','rect','plain','topbar','A single forest-green console pane; plain prompts and no animated typing.'),
('bubble-chat','Nunito Sans','#29334F','#573A88','#F2EEFF','#B8A8DC','{name}:','message','solid',24,'inline','rect','plain','none','Classic pale lavender inline capsules; deliberately compact beside Bubble Lift.'),
('clean','DM Sans','#F6F8FC','#C6DDFF','#111C2E','#7487A1','{name}:','message','none',6,'inline','rect','plain','none','Neutral navy reading strips with stronger backing and clear bold names.'),
('cyber-city','Barlow','#FFF2FD','#8CFFF3','#29112C','#EE76CE','// {name}','message','solid',0,'stacked','ticket','plain','topbar','Magenta cut-corner panels and cyan callsigns; a hard-edged city HUD.'),
('arcade-cabinet','Pixelify Sans','#FFF5C2','#FFE177','#291C49','#B788FF','P1 · {name}','panel','pixel',0,'inline','rect','plain','topbar','Purple cabinet bezel, butter-yellow score names and static scanlines.'),
('space-command','Barlow','#ECF9FF','#90DDFF','#10283A','#6FABC5','COMMS / {name}','panel','solid',0,'stacked','rect','plain','none','Steel-blue communications panel with long technical corner brackets.'),
('monster-trainer','VT323','#253A40','#234F63','#FFF5D5','#344F58','{name} says:','message','solid',12,'stacked','rect','plain','none','Ivory dialogue cards with a heavy blue-ink rim and friendly tall lettering.'),
('dungeon-crawler','Roboto Slab','#F2E6D0','#FFD69B','#302C29','#A69A83','[{name}]','panel','beveled',2,'inline','rect','plain','none','Stone-grey bevel, small brass corner diamonds and firelit serif names.'),
('cozy-farm','Nunito Sans','#FFF5DA','#FFE09B','#493526','#C69661','{name} ·','message','beveled',8,'stacked','rect','plain','none','Warm wood plaques, cream lettering and small peg dots at the corners.'),
('horror-survival','IBM Plex Mono','#FFE5DF','#FFAB9D','#241617','#C36966','[{name}] transmission:','message','dashed',0,'stacked','rect','plain','rail','Dusty red emergency slips; light body text instead of low-contrast blood red.'),
('hero-shooter','Barlow Condensed','#F8F8FF','#FFD0A3','#25303E','#FF9A55','{name} /','message','solid',0,'stacked','rect','plain','rail','Orange start stripe with small white corner wedges and compact team calls.'),
('kart-racer','Nunito Sans','#27314D','#27314D','#FFE68B','#6BC7B3','{name} »','message','solid',30,'inline','rect','plain','topbar','Sun-yellow racing capsules with a mint lane stripe; wide, playful spacing.'),
('candy-pop','Nunito Sans','#472C4B','#752E64','#FFE0ED','#CB83B2','{name} ✦','message','solid',14,'stacked','rect','plain','none','Pink candy tiles with cream-to-mint pastel fill and small diamond corners.'),
('vaporwave','Barlow','#FFF0FB','#C3FFF3','#392548','#D5A2E7','{name} ~','message','double',2,'stacked','rect','plain','underline','Plum-to-ocean gradient ribbons with fine lilac twin lines and mint names.'),
('rainbow-border','DM Sans','#F7F8FF','#E1E8FF','#171F35','#E6A7CF','{name} +','message','solid',10,'inline','rect','plain','none','Prismatic static perimeter around a sober midnight card; white names stay still.'),
]
old['guild-chat']['description']='Reference preserved: two continuous gold rings, green guild dialogue and a deep forest pane.'
old['guild-chat']['settings']['presentation']=presentation()
for r in polish:
    skin=old[r[0]]; skin['description']=configure(skin['settings'],(skin['name'],)+r[1:]); s=skin['settings']
    if r[0] in ('fantasy-mmo','dungeon-crawler','candy-pop'): s['frame']['ornament'].update(style='diamonds',size=4,color=s['frame']['paint']['color'])
    if r[0] in ('battle-arena','space-command'): s['frame']['ornament'].update(style='brackets',size=14,width=2,color=s['frame']['paint']['color']); s['frame']['padding']={k:22 for k in s['frame']['padding']}
    if r[0]=='cozy-farm': s['backgrounds']['message']['recipe']='boards'; s['frame']['ornament'].update(style='dots',size=4,color='#EBC899FF')
    if r[0]=='candy-pop': s['backgrounds']['message']['recipe']='rainbow'
    if r[0]=='arcade-cabinet': s['backgroundEffect']='scanlines'
    if r[0]=='hero-shooter': s['frame']['legacyDetail']='slab'; s['animationIn']='slide'; s['animationDuration']=120
    if r[0]=='retro-rpg':
        for p in s['parts'].values(): p['fontSize']=28 if p is not s['parts']['badges'] else 16; p['fontWeight']=400
    if r[0]=='monster-trainer': s['frame']['width']=4; s['parts']['messageText']['fontSize']=26
    if r[0] in ('block-craft','arcade-cabinet'): s['frame']['pixelStep']=5; s['frame']['padding']={k:16 for k in s['frame']['padding']}
    if r[0]=='vaporwave': s['backgrounds']['message'].update(mode='linear',stops=[dict(color='#392548FF',position=0),dict(color='#16434AFF',position=100)])
    if r[0]=='rainbow-border': s['frame']['paint'].update(mode='linear',stops=[dict(color='#FFB2D6FF',position=0),dict(color='#FFE69DFF',position=50),dict(color='#96E4FFFF',position=100)])

featured=['bubble-lift','glass-card','name-tag','comic-burst','pastel-pop','esports-slash']
d['skins']=sorted(new,key=lambda s:featured.index(s['id']) if s['id'] in featured else 10+next(i for i,r in enumerate(rows) if r[0]==s['name']))+list(old.values())
d['designRevision']=5
d['galleryGroups']=['Streamer favorites','Game styles','Colorful','Animated']
d['featuredSkinIds']=featured
d['skins']=sorted(d['skins'],key=lambda s:(d['galleryGroups'].index(s['category']),0 if s['id'] in featured else 1))

feature_defaults=dict(nameStyle=dict(readableColors=True,minContrast=4.5),
    grouping=dict(enabled=False,windowSeconds=20),
    messageLimits=dict(maxLineCh=38,maxLines=0),
    lifecycle=dict(fadeMaskPx=0),
    emphasis=dict(firstMessage=False,color='#FFE095FF'),
    emotes=dict(sevenTV=True,bttv=True,ffz=True,emoteOnlyScale=2,inlineSize=28))

def schema(v):
    if isinstance(v,dict): return dict(type='object',properties={k:schema(x) for k,x in v.items()},required=list(v),additionalProperties=False)
    if isinstance(v,bool): return dict(type='boolean',default=v)
    if isinstance(v,(int,float)): return dict(type='number',default=v)
    return dict(type='string',default=v)
props=d['settingsSchema']['properties']
extensions={**feature_defaults,'presentation':presentation(),'transparentBackground':False,'hideFrames':False}
for k,v in extensions.items():
    props[k]=schema(v)
    if k not in d['settingsSchema']['required']: d['settingsSchema']['required'].append(k)
pr=props['presentation']['properties']
for k,values in dict(layout=['inline','stacked','columns','initials','announcer'],shape=['rect','speech','slash','ticket'],nameTreatment=['plain','pill','tab'],accent=['none','rail','underline','topbar']).items(): pr[k]['enum']=values
for root,key,lo,hi in [('presentation','columnWidth',64,180),('presentation','initialSize',24,64),('presentation','tailSize',0,20),('presentation','cutSize',0,24),('nameStyle','minContrast',3,7),('grouping','windowSeconds',1,120),('messageLimits','maxLineCh',16,80),('messageLimits','maxLines',0,12),('lifecycle','fadeMaskPx',0,64),('emotes','emoteOnlyScale',1,3),('emotes','inlineSize',16,64)]:
    props[root]['properties'][key].update(minimum=lo,maximum=hi)
for root,key in [('presentation','chipColor'),('emphasis','color')]: props[root]['properties'][key]['pattern']='^#[0-9A-Fa-f]{8}$'
props['messageLimits']['properties']['maxLines']['type']='integer'

def project(s):
    p=s['parts']; f=s['frame']; b=s['backgrounds'][f['target']]; t=p['messageText']
    for key in ('fontFamily','fontSize','fontWeight','lineHeight'): s[key]=t[key]
    for key,part in [('textColor','messageText'),('nameColor','name'),('systemColor','system')]: s[key]=p[part]['paint']['color'][:7]
    s.update(borderStyle='double' if f['outer']['enabled'] else {'solid':'line','beveled':'bevel'}.get(f['style'],f['style']) if f['style'] in ('solid','beveled','double','pixel','none') else 'line',borderWidth=f['width'],borderColor=f['paint']['color'][:7],cornerRadius=f['radius']['topLeft'],paddingX=f['padding']['left'],paddingY=f['padding']['top'],backgroundScope=f['target'],backgroundColor=b['color'][:7],backgroundOpacity=b['opacity'],backgroundTreatment='gradient' if b['mode']=='linear' else b['recipe'] if b['recipe']!='none' else 'solid',backgroundSecondaryColor=b['stops'][-1]['color'][:7],nameFormat=s['nameTemplate'].replace('{badges} ','').rstrip(),outlineWidth=t['outline']['width'],outlineColor=t['outline']['color'][:7],shadowEnabled=t['shadow']['enabled'],shadowColor=t['shadow']['color'][:7],shadowOpacity=round(int(t['shadow']['color'][7:9],16)/255,4),shadowBlur=t['shadow']['blur'])

for i,skin in enumerate(d['skins']):
    skin.update(featured=skin['id'] in featured,galleryOrder=i)
    for k,v in feature_defaults.items(): skin['settings'][k]=copy.deepcopy(v)
    project(skin['settings'])
    skin['settings']['cornerRadius']=min(24,skin['settings']['cornerRadius'])
# Schema defaults describe the actual Clean baseline, including polished values.
def defaults(spec,value):
    if spec.get('type')=='object':
        for k,v in value.items():
            if k in spec['properties']: defaults(spec['properties'][k],v)
    else: spec['default']=copy.deepcopy(value)
defaults(d['settingsSchema'],next(s['settings'] for s in d['skins'] if s['id']=='clean'))
# Embedded schemas also carry the extended object, where applicable.
if 'settings' in d['savedSkinSchema'].get('properties',{}): d['savedSkinSchema']['properties']['settings']=copy.deepcopy(d['settingsSchema'])
if 'baseline' in d['editorStateSchema'].get('properties',{}):
    b=d['editorStateSchema']['properties']['baseline']
    if 'anyOf' in b: b['anyOf']=[copy.deepcopy(d['settingsSchema']) if x.get('type')=='object' else x for x in b['anyOf']]

# Explicit labels are metadata, not URL state. No raw key is ever used as a UI label.
special={'fontFamily':'Font family','fontSize':'Font size','fontWeight':'Font weight','lineHeight':'Line height','letterSpacing':'Letter spacing','inheritTypography':'Use parent typography','enabled':'On','x':'Offset X','y':'Offset Y','blur':'Blur','spread':'Spread','sevenTV':'7TV emotes','bttv':'BTTV emotes','ffz':'FFZ emotes','maxLineCh':'Maximum line length','maxLines':'Maximum message lines','emoteOnlyScale':'Emote-only size multiplier','inlineSize':'Inline emote size','firstMessage':'Highlight tagged first messages','minContrast':'Minimum name contrast','readableColors':'Keep names readable','windowSeconds':'Group within','fadeMaskPx':'Overflow fade depth','chipColor':'Name chip color','layout':'Name layout','shape':'Frame shape','nameTreatment':'Name decoration','columnWidth':'Name column width','initialSize':'Initial circle size','tailSize':'Speech tail size','cutSize':'Corner cut size','source':'Custom CSS','color':'Color','mode':'Fill style','opacity':'Opacity','imageUrl':'Image URL','topLeft':'Top left','topRight':'Top right','bottomLeft':'Bottom left','bottomRight':'Bottom right'}
def words(k): return special.get(k,re.sub(r'([a-z])([A-Z])',r'\1 \2',k).replace('_',' ').capitalize())
labels={}
def labelwalk(obj,path=''):
    if obj.get('type')=='object':
        for k,v in obj['properties'].items(): labelwalk(v,path+'.'+k if path else k)
    elif obj.get('type')=='array' and obj.get('items',{}).get('type')=='object': labelwalk(obj['items'],path+'.*')
    else:
        bits=path.split('.'); key=bits[-1]; parent=bits[-2] if len(bits)>1 else ''
        label=words(key)
        if parent in ('shadow','glow','outline','outer','ornament'):
            label=words(parent)+' '+label.lower()
        elif key in ('width','color','enabled','mode','style','size','target','speed','angle','position','recipe'): label=words(parent)+' '+label.lower() if parent else label
        labels[path]=label
labelwalk(d['settingsSchema'])
d['editorLabels']=labels
(ROOT/'skins.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

esc=lambda x:html.escape(str(x),quote=True)
def rgba(c,opacity=1):
    return f'rgba({int(c[1:3],16)},{int(c[3:5],16)},{int(c[5:7],16)},{int(c[7:9],16)/255*opacity if len(c)==9 else opacity})'

def specimen(skin):
    s=skin['settings']; f=s['frame']; p=s['presentation']; t=s['parts']['messageText']; n=s['parts']['name']; b=s['backgrounds'][f['target']]
    bg=rgba(b['color'],b['opacity'])
    if b['mode']=='linear': bg='linear-gradient(135deg,'+','.join(rgba(x['color'],b['opacity'])+' '+str(x['position'])+'%' for x in b['stops'])+')'
    if b['recipe']=='rainbow': bg='linear-gradient(120deg,#FFE0ED,#FFF1BA,#D8F4DE)'
    shadow=s['parts']['messageBox']['shadow']
    vs={'font':'"'+t['fontFamily']+'"','ink':t['paint']['color'],'name':n['paint']['color'],'surface':bg,'edge':f['paint']['color'],'radius':str(f['radius']['topLeft'])+'px','width':str(f['width'])+'px','chip':p['chipColor'],'ns':str(n['fontSize'])+'px','size':str(t['fontSize'])+'px','lh':t['lineHeight'],'gap':str(s['messageSpacing'])+'px','pad':f"{f['padding']['top']}px {f['padding']['right']}px {f['padding']['bottom']}px {f['padding']['left']}px",'col':str(p['columnWidth'])+'px','cut':str(p['cutSize'])+'px','tail':str(p['tailSize'])+'px','initial':str(p['initialSize'])+'px','boxshadow':f"{shadow['x']}px {shadow['y']}px {shadow['blur']}px {shadow['color']}" if shadow['enabled'] else 'none'}
    classes=f"chat scope-{f['target']} layout-{p['layout']} shape-{p['shape']} treatment-{p['nameTreatment']} accent-{p['accent']} style-{f['style']} ornament-{f['ornament']['style']} recipe-{b['recipe']} detail-{f['legacyDetail']}"
    if f['outer']['enabled']: classes+=' outer-ring'
    if s['borderEffect']=='glow': classes+=' neon'
    if s['backgroundEffect']=='scanlines': classes+=' scanlines'
    if f['paint']['mode']=='linear': classes+=' rainbow'
    if b['backdropBlur']: classes+=' glass'
    result=f'<div class="{classes}" style="'+esc(';'.join('--'+k+':'+str(v) for k,v in vs.items()))+'">'
    for i,(name,msg) in enumerate([('Moss','That last-second save!!'),('Juniper','Welcome in. There’s room for one more.'),('SomeoneWithALongName','One more round before we call it a night?'),('Orbit','✦ ✦ ✦')]):
        name_text=s['nameTemplate'].replace('{badges} ','').replace('{name}',name).replace('{channel}','cozy_channel')
        body=esc(msg) if i!=3 else '<span class="emote-demo" aria-label="Three original star emote placeholders">✦ ✦ ✦</span>'
        result+='<div class="row">'+(f'<span class="initial" aria-hidden="true">{name[0]}</span>' if p['layout']=='initials' else '')+f'<span class="who">'+('<span class="badge" aria-label="Moderator">M</span> ' if i==1 else '')+esc(name_text)+f'</span><span class="body">{body}</span></div>'
    return result+'</div>'

cards=[]
for group in d['galleryGroups']:
    cards.append(f'<section aria-labelledby="{group.replace(" ","-")}"><h2 id="{group.replace(" ","-")}">{group}</h2><div class="gallery">')
    for skin in [s for s in d['skins'] if s['category']==group]:
        cards.append(f'<article id="{skin["id"]}"><div class="card-heading"><h3>{skin["name"]}</h3>'+('<span class="featured">Featured</span>' if skin['featured'] else '')+f'</div><div class="sample">{specimen(skin)}</div><p>{esc(skin["description"])}</p></article>')
    cards.append('</div></section>')

def field(path,value,sch):
    ident='control-'+path.replace('.','-'); title=labels.get(path,words(path.split('.')[-1])); typ=sch.get('type')
    start=f'<label class="field" for="{ident}"><span>{esc(title)}</span>'
    if typ=='boolean': return start+f'<input class="switch" type="checkbox" id="{ident}" '+('checked' if value else '')+'></label>'
    if isinstance(value,str) and re.fullmatch('#[0-9A-Fa-f]{8}',value):
        return start+f'<span class="color"><i style="background:{value}"></i><input id="{ident}" value="{value}" aria-label="{esc(title)} hex with alpha"></span></label>'+f'<label class="field" for="{ident}-alpha"><span>{esc(title)} opacity</span><input id="{ident}-alpha" type="range" min="0" max="100" value="{round(int(value[7:9],16)/255*100)}"><output>{round(int(value[7:9],16)/255*100)}%</output></label>'
    if 'enum' in sch: return start+f'<select id="{ident}">'+''.join(f'<option '+('selected' if v==value else '')+f'>{esc(words(str(v)))}</option>' for v in sch['enum'])+'</select></label>'
    if typ in ('integer','number'):
        unit='px' if any(x in path.lower() for x in ['size','width','blur','spread','offset','padding','radius','spacing']) or path.endswith(('.x','.y')) else '×' if path.endswith(('lineHeight','emoteOnlyScale')) else 's' if path.endswith('Seconds') else ''
        return start+f'<input id="{ident}" type="range" min="{sch.get("minimum",0)}" max="{sch.get("maximum",100)}" step="0.1" value="{value}"><output>{value} {unit}</output></label>'
    return start+f'<input id="{ident}" value="{esc(value)}"></label>'

def fields(obj,sch,path):
    out=''
    for k,v in obj.items():
        sub=path+'.'+k if path else k; spec=sch['properties'][k]
        if isinstance(v,dict): out+=f'<details><summary>{words(k)}</summary>'+fields(v,spec,sub)+'</details>'
        elif isinstance(v,list): continue
        else: out+=field(sub,v,spec)
    return out

controls=[]; cs=next(s['settings'] for s in d['skins'] if s['id']=='glass-card')
for part in ['messageBox','name','messageText','badges','system','panel']:
    title={'messageBox':'Message box','messageText':'Message text'}.get(part,words(part)); v=cs['parts'][part]; spec=props['parts']['properties'][part]
    controls.append(f'<details class="part" '+('open' if part=='name' else '')+f'><summary>{title}</summary><button class="reset" type="button">Reset section</button><h4>Font</h4>')
    for k in ['fontFamily','fontSize','fontWeight','lineHeight']: controls.append(field('parts.'+part+'.'+k,v[k],spec['properties'][k]))
    controls.append('<h4>Color</h4>'+field('parts.'+part+'.paint.color',v['paint']['color'],spec['properties']['paint']['properties']['color']))
    controls.append('<h4>Effects</h4>'+fields({k:v[k] for k in ['outline','shadow','glow']},spec,'parts.'+part))
    controls.append('<details><summary>Advanced typography & fill</summary>'+''.join(field('parts.'+part+'.'+k,v[k],spec['properties'][k]) for k in ['italic','uppercase','letterSpacing','inheritTypography'])+'</details></details>')
for key,title in [('presentation','Name layout'),('frame','Frame'),('backgrounds','Background'),('nameStyle','Readable names'),('emotes','Community emotes'),('grouping','Group messages'),('messageLimits','Message length'),('emphasis','First messages'),('lifecycle','Overflow')]:
    controls.append(f'<details class="part"><summary>{title}</summary><button class="reset" type="button">Reset section</button>'+fields(cs[key],props[key],key)+'</details>')

css=r'''
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#101722;color:#F2F5FA;font:15px/1.5 'DM Sans',sans-serif}header{padding:24px 32px;border-bottom:1px solid #34465E;display:flex;align-items:center;justify-content:space-between;gap:20px}h1{font-size:24px;margin:0}header p{color:#AFBDD0;margin:4px 0}a{color:#BBD7FF}nav{display:flex;gap:20px;flex-wrap:wrap}main{max-width:1740px;margin:auto;padding:24px 32px}h2{font-size:24px;margin:32px 0 18px}h3{font-size:17px;margin:0}.gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}article{min-width:0;background:#182230;border:1px solid #34465E;border-radius:10px;overflow:hidden}.card-heading{display:flex;justify-content:space-between;align-items:center;padding:16px;gap:8px}.featured{color:#F4D38D;border:1px solid #7B6B47;border-radius:20px;padding:3px 9px;font-size:12px}article p{padding:0 16px;margin:16px 0 20px;color:#AFBDD0;font-size:13px}.sample{padding:24px 18px;min-height:350px;background:linear-gradient(145deg,transparent 35%,#E6AE6533 35% 41%,transparent 41%),linear-gradient(25deg,#14283B 20%,#5B7C6544 20% 42%,#132030 42% 64%,#A7657833 64% 70%,#1B3842 70%);display:flex;align-items:flex-end;overflow:hidden}.chat{width:100%;min-width:0;font-family:var(--font),sans-serif;font-size:var(--size);line-height:var(--lh);color:var(--ink);display:flex;flex-direction:column;gap:var(--gap)}.row{min-width:0;position:relative;overflow-wrap:anywhere}.who{color:var(--name);font-size:var(--ns);font-weight:700}.body{max-width:38ch;overflow-wrap:anywhere}.scope-message .row,.scope-panel{background:var(--surface);border:var(--width) solid var(--edge);border-radius:var(--radius);padding:var(--pad);box-shadow:var(--boxshadow);position:relative}.scope-panel .row{padding:0}.scope-message.style-none .row,.scope-panel.style-none{border:0}.scope-message.style-double .row,.scope-panel.style-double{border:var(--width) solid var(--edge);outline:var(--width) solid var(--edge);outline-offset:2px}.outer-ring{outline:1px solid var(--edge);outline-offset:2px}.scope-message.style-dashed .row,.scope-panel.style-dashed{border-style:dashed}.scope-message.style-beveled .row,.scope-panel.style-beveled{border-top-color:color-mix(in srgb,var(--edge),white 28%);border-left-color:color-mix(in srgb,var(--edge),white 28%);border-bottom-color:color-mix(in srgb,var(--edge),black 40%);border-right-color:color-mix(in srgb,var(--edge),black 40%)}.scope-message.style-pixel .row,.scope-panel.style-pixel{border-radius:0;clip-path:polygon(10px 0,calc(100% - 10px) 0,calc(100% - 10px) 5px,calc(100% - 5px) 5px,calc(100% - 5px) 10px,100% 10px,100% calc(100% - 10px),calc(100% - 5px) calc(100% - 10px),calc(100% - 5px) calc(100% - 5px),calc(100% - 10px) calc(100% - 5px),calc(100% - 10px) 100%,10px 100%,10px calc(100% - 5px),5px calc(100% - 5px),5px calc(100% - 10px),0 calc(100% - 10px),0 10px,5px 10px,5px 5px,10px 5px);box-shadow:inset 0 0 0 3px var(--edge)}.layout-stacked .who,.layout-announcer .who{display:block;margin-bottom:4px}.layout-columns .row{display:grid;grid-template-columns:minmax(64px,min(var(--col),35%)) minmax(0,1fr);gap:12px;align-items:start}.layout-columns .who{font-size:16px}.layout-initials .row{display:grid;grid-template-columns:var(--initial) minmax(0,1fr);column-gap:12px}.layout-initials .initial{grid-row:1/3;width:var(--initial);height:var(--initial);background:var(--chip);color:#14243A;border-radius:50%;display:grid;place-items:center;font-weight:700}.layout-initials .body{grid-column:2}.treatment-pill .who,.treatment-tab .who{background:var(--chip);padding:4px 9px;width:fit-content;max-width:100%}.treatment-pill .who{border:1px solid #FFFFFFAA;border-radius:20px;box-shadow:2px 2px 0 #00000070;margin-bottom:8px}.treatment-tab .who{border-radius:2px}.accent-rail .row{border-left:5px solid var(--edge)}.accent-underline .who{border-bottom:2px solid var(--edge);padding-bottom:3px}.accent-topbar.scope-panel,.accent-topbar.scope-message .row{border-top:5px solid var(--edge)}.shape-speech .row{margin-bottom:var(--tail)}.shape-speech .row:after{content:'';position:absolute;bottom:calc(-1 * var(--tail));left:24px;width:var(--tail);height:var(--tail);background:var(--edge);clip-path:polygon(0 0,100% 0,0 100%)}.shape-slash .row{clip-path:polygon(var(--cut) 0,100% 0,calc(100% - var(--cut)) 100%,0 100%);padding-left:calc(16px + var(--cut));padding-right:calc(16px + var(--cut))}.shape-ticket .row{clip-path:polygon(var(--cut) 0,calc(100% - var(--cut)) 0,100% var(--cut),100% calc(100% - var(--cut)),calc(100% - var(--cut)) 100%,var(--cut) 100%,0 calc(100% - var(--cut)),0 var(--cut))}.badge{font:600 11px 'DM Sans',sans-serif;color:inherit;border:1px solid currentColor;padding:1px 3px;border-radius:3px;vertical-align:middle}.emote-demo{font:40px/1.2 'DM Sans',sans-serif;color:var(--name);letter-spacing:4px}.neon .row{box-shadow:0 0 8px #DC75FF66,inset 0 0 8px #DC75FF22}.glass .row{backdrop-filter:blur(12px)}.recipe-boards .row{background-image:repeating-linear-gradient(0deg,transparent 0 31px,#FFFFFF10 31px 32px)}.scanlines{background-image:repeating-linear-gradient(0deg,#00000020 0 1px,transparent 1px 4px)}.rainbow .row{border-color:#E6A7CF;box-shadow:inset 0 2px #FFE69D,inset -2px 0 #96E4FF}.ornament-dots .row:before,.ornament-diamonds .row:before{content:'◆';position:absolute;right:6px;top:2px;font-size:8px;color:var(--edge)}.ornament-dots .row:before{content:'●'}.ornament-diamonds.scope-panel:before{content:'◆';position:absolute;right:6px;top:2px;font-size:8px;color:var(--edge)}.ornament-brackets{background-image:linear-gradient(var(--edge),var(--edge)),linear-gradient(var(--edge),var(--edge)),linear-gradient(var(--edge),var(--edge)),linear-gradient(var(--edge),var(--edge));background-size:14px 2px,2px 14px,14px 2px,2px 14px;background-position:5px 5px,5px 5px,calc(100% - 5px) calc(100% - 5px),calc(100% - 5px) calc(100% - 5px);background-repeat:no-repeat}.detail-slab .row:after{content:'';position:absolute;right:4px;top:4px;border-top:7px solid white;border-left:7px solid transparent}.editor{border:1px solid #34465E;border-radius:10px;overflow:hidden;display:grid;grid-template-columns:400px minmax(0,1fr);height:760px}.rail{min-height:0;display:flex;flex-direction:column;background:#182230;border-right:1px solid #34465E}.search{padding:16px;border-bottom:1px solid #34465E;background:#182230;flex:none;position:sticky;top:0;z-index:2}.search label{display:block;margin-bottom:6px}.search input{width:100%}.scroll{overflow:auto;padding:0 16px 16px;scroll-padding-top:16px}.part{padding:16px 0;border-bottom:1px solid #34465E}summary{cursor:pointer;font-weight:600;padding:8px 0;min-height:40px}.reset{display:block;margin:0 0 12px auto;background:none!important;border:0!important;color:#BBD7FF;min-height:40px;text-decoration:underline;font-size:12px}h4{margin:20px 0 8px;color:#AFBDD0;font-size:13px}.field{display:flex;align-items:center;gap:10px;justify-content:space-between;margin:12px 0;min-height:40px;font-size:13px}.field>span:first-child{flex:1;min-width:90px}input,select,button{font:inherit;color:inherit;background:#222F40;border:1px solid #526580;border-radius:6px;min-height:40px;padding:8px;max-width:100%;min-width:0}input:not([type]),select{width:170px}input[type=range]{width:110px;padding:0;accent-color:#A9CAFF}output{min-width:44px;font-variant-numeric:tabular-nums;font-size:12px}.switch{appearance:none;width:42px;min-height:24px;height:24px;padding:2px;border-radius:14px;background:#34465E;flex:none;cursor:pointer}.switch:before{content:'';display:block;width:18px;height:18px;border-radius:50%;background:#F2F5FA}.switch:checked{background:#A9CAFF}.switch:checked:before{transform:translateX(16px);background:#14243A}.color{display:flex;gap:8px;align-items:center}.color i{width:24px;height:24px;border:1px solid #AFBDD0;border-radius:4px;box-shadow:inset 0 0 0 2px #FFFFFF22}.color input{width:112px;font-size:12px}.actions{padding:16px;display:flex;gap:10px;background:#182230;border-top:1px solid #34465E}.stage{padding:24px;display:flex;flex-direction:column;justify-content:center;background:repeating-conic-gradient(#172334 0 25%,#1B293D 0 50%) 0/32px 32px;min-width:0}.stage .chat{max-width:480px}.stage p{color:#AFBDD0;font-size:13px}.notice{color:#AFBDD0;font-size:14px;max-width:75ch}.footer{padding:32px;color:#AFBDD0;font-size:13px}:focus-visible{outline:2px solid #F4D38D;outline-offset:3px}@media(min-width:1600px){.gallery{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:1199px){.gallery{grid-template-columns:repeat(2,minmax(0,1fr))}.editor{grid-template-columns:360px minmax(0,1fr)}}@media(max-width:899px){header{align-items:start;flex-direction:column}main{padding:16px}.gallery{grid-template-columns:1fr}.editor{height:auto;display:flex;flex-direction:column}.stage{order:-1;padding:20px}.rail{max-height:680px}.sample{padding:22px 16px}.chat{font-size:min(var(--size),22px)}header{padding:20px}.layout-columns .row{grid-template-columns:minmax(64px,30%) minmax(0,1fr);gap:8px}.layout-columns .who{font-size:14px}.field{flex-wrap:wrap}.actions{flex-wrap:wrap}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
'''
fonts='DM+Sans:wght@400;500;600;700&family=Lato:wght@400;700&family=Noto+Sans:wght@400;500;700&family=Nunito+Sans:wght@400;500;700&family=Barlow:wght@400;500;700&family=Barlow+Condensed:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&family=Roboto+Slab:wght@400;500;700&family=Pixelify+Sans:wght@400;500;700&family=VT323'
css+='\n.emote-demo{color:var(--ink)} .color i{background-image:repeating-conic-gradient(#ffffff22 0 25%,transparent 0 50%);background-size:8px 8px}\n'
page='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chat studio — Round 5 design review</title><link href="https://fonts.googleapis.com/css2?family='+fonts+'&display=swap" rel="stylesheet"><style>'+css+'</style></head><body><header><div><h1>Chat studio</h1><p>Round 5 · 34 original skins · Design review</p></div><nav><a href="#Streamer-favorites">Streamer favorites</a><a href="#Game-styles">Game styles</a><a href="#editor">Editor polish</a></nav></header><main><p class="notice">Six Featured looks lead the collection. Every sample uses the same conversation over a busy abstract backdrop. Stars are original emote placeholders. This is a static design sheet; controls do not change the samples or connect to chat.</p>'+''.join(cards)+'<section id="editor"><h2>An editor that gets out of the way</h2><p class="notice">Glass Card selected. Inspect the grouped controls below: human labels, value readouts, alpha swatches and quiet advanced rows. Reset buttons are visual specifications.</p><div class="editor"><aside class="rail"><div class="search"><label for="find">Find a setting</label><input id="find" placeholder="Try font, glow or message length"><p class="notice">Search layout specimen</p></div><div class="scroll">'+''.join(controls)+'</div><div class="actions"><button type="button">Save skin</button><button type="button">Copy overlay URL</button></div></aside><div class="stage">'+specimen(next(s for s in d['skins'] if s['id']=='glass-card'))+'<p>Sample chat · Glass Card<br>Transparent OBS canvas; backing stays readable without blur.</p></div></div></section></main><footer class="footer">Original CSS geometry and Google Fonts only. No product artwork, logos or copied theme CSS. Static samples show final motion states; implementation and OBS validation belong to the builder.</footer></body></html>'
(ROOT/'mockup.html').write_text(page,encoding='utf-8')
print('Wrote 34 skins, 6 Featured, labels, and static gallery/editor mockup.')
