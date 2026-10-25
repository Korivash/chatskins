"""Generate design-only channel specimens and catalog metadata. No app build."""
import copy, html, json
from pathlib import Path

ROOT = Path(__file__).parent
d = json.loads((ROOT / 'skins.json').read_text(encoding='utf-8'))
base = copy.deepcopy(next(s['settings'] for s in d['skins'] if s['id'] == 'guild-chat'))
def rule(match, fmt, color, name=None, italic=False):
    return dict(enabled=True, match=match, format=fmt, textColor=color, nameColor=name or color, italic=italic)
def r(match, label, color): return rule(match, label+' {name}: {message}', color)
specs = [
 ('chatskins-signature','ChatSkins Signature','Barlow','#101528','#7EEAD6','#F3F5FF',12,[5,5,4,1],
  [r('broadcaster','HOST','#FFDA8A'),r('mod','MOD','#7EEAD6'),rule('action','{name} {message}','#B7AAFF',italic=True),r('mentionsChannel','↳','#B7AAFF'),rule('vip','{name}: {message}','#F3F5FF'),rule('sub','{name}: {message}','#F3F5FF'),rule('everyone','{name}: {message}','#F3F5FF'),r('firstTime','✦ NEW','#7EEAD6')],
  'A folded mint-to-violet perimeter frames Twitch-color name chips; quiet navy backing keeps the conversation central.',
  '2 px gradient ring, 12 px corners, 1 px inset highlight; static 4 px scanline pitch at 3% opacity behind text. No blur dependency.'),
 ('crystal-realm','Crystal Realm','Lora','#111C2A','#A8C9E8','#FFFFFF',5,[5,4,2,2],
  [rule('broadcaster','[FC] <{name}> {message}','#A7EBDD'),rule('mod','[LS1] <{name}> {message}','#9FE6A5'),rule('allCaps','{name} shouts: {message}','#FFB36D'),rule('action','{name} {message}','#D5D9E1',italic=True),rule('mentionsChannel','>> {name}: {message}','#FFA6D7'),rule('vip','({name}) {message}','#A9D8FF'),rule('sub','[FC] <{name}> {message}','#A7EBDD'),rule('everyone','{name}: {message}','#FFFFFF')],
  'Cool silver lozenges and literary letterforms make a restrained, luminous social window.',
  '1 px silver-blue outer line plus inset 1 px blue line at 4 px; four original open diamond corner ornaments, 10 px.'),
 ('old-school-mmo','Old-School Realm','Bree Serif','#302217','#A78B62','#FFF06A',0,[4,4,3,5],
  [rule('mod','[Clan] {name}: {message}','#D4B1FF','#D99A83'),rule('allCaps','{name}: {message}','#FFF06A','#8EBBFF'),rule('action','{name} {message}','#FFF06A','#8EBBFF'),rule('everyone','{name}: {message}','#FFF06A','#8EBBFF')],
  'Blunt slab serifs sit in a chunky stone ledger; yellow speech carries the nostalgic read.',
  '3 px dark-brown stone bevel, square corners, inset ochre seam; CSS repeating-gradient stone seams only, no bitmap.'),
 ('frontier-mmo','Frontier MMO','Lato','#222521','#D5BF8C','#FFFFFF',0,[5,4,2,3],
  [r('broadcaster','[Squad]','#FFE38C'),r('mod','[Squad]','#FFE38C'),r('mentionsChannel','[Whisper]','#FFACE0'),r('vip','[Party]','#A9CEFF'),r('sub','[Guild]','#B8F0A6'),r('everyone','[Map]','#FFFFFF')],
  'Uneven parchment margins surround a clear charcoal field, like a traveling party log.',
  '2 px warm parchment rim; irregular 6 px SVG paper teeth at left/right, outside a rectangular unclipped reading surface.'),
 ('arena-league','Arena League','Barlow Condensed','#111E2C','#C7A55B','#FFAB91',0,[5,4,2,2],
  [r('broadcaster','[Team]','#FFDA8A'),r('mod','[Team]','#9CCEFF'),r('vip','[Team]','#9CCEFF'),r('sub','[Team]','#9CCEFF'),r('everyone','[All]','#FFAB91')],
  'Two offset gold cuts give the panel momentum while names and messages stay upright.',
  '12 px slanted ends on the frame layer only, 1 px gold trim and 3 px short leading rail; reserve cut width in padding.'),
 ('tactical-ops','Tactical Ops','IBM Plex Mono','#131B24','#7891A7','#FFBD86',2,[5,2,2,2],
  [rule('mod','(Admin) {name}: {message}','#D4E2F0'),r('sub','[Team]','#9CCEFF'),rule('everyone','{name}: {message}','#FFBD86'),rule('firstTime','*NEW* {name}: {message}','#FFE3A5')],
  'A narrow timestamp-like gutter and two team hues do the work of a spare comms terminal.',
  '1 px slate top/bottom rules, 2 px radius, 90% charcoal backing; no decorative glow or texture.'),
 ('block-server','Block Server','Pixelify Sans','#303338','#92979D','#FFFFFF',0,[4,3,1,5],
  [rule('broadcaster','[Owner] <{name}> {message}','#FF9C9C'),rule('mod','[Mod] <{name}> {message}','#FFDD79'),rule('sub','[VIP+] <{name}> {message}','#8DF5EF'),rule('everyone','<{name}> {message}','#FFFFFF'),rule('firstTime','{name} joined the game','#FFF176')],
  'Flat grey strips and stepped lettering evoke a friendly community server without borrowed textures.',
  'Square 1 px grey edge, 88% grey backing, 2 px stepped corner inset; no bevel or game artwork.'),
 ('hero-quest','Hero Quest','Lora','#251F2B','#BA9B76','#FFF0D9',6,[5,4,2,3],
  [r('broadcaster','[Leader]','#FFE09B'),r('mod','[Guard]','#ADD8FF'),r('vip','[Striker]','#FFD19E'),r('sub','[Support]','#FFB5CF'),r('everyone','[Party]','#FFF0D9')],
  'An inset party rail pairs handmade role silhouettes with warm dialogue and generous leading.',
  '2 px bronze party-frame rim, 6 px corners, 24 px icon gutter; shield for mod, sword for VIP, heart for sub in original SVG.'),
 ('space-station','Space Station','Nunito Sans','#F8FAFF','#8996AF','#202B40',20,[5,3,2,1],
  [rule('mod','📣 meeting · {name}: {message}','#202B40'),rule('everyone','{name}: {message}','#202B40')],
  'Soft white speech pods and stable crew-color dots make the meeting feel social and readable.',
  'Individual white bubbles, 20 px corners, 2 px slate border, 8 px left tail; 12 px crew dot with dark 1 px ring.')
]
ids = {x[0] for x in specs}
records=[]
for sid,name,font,bg,edge,ink,radius,stats,rules,note,recipe in specs:
    s=copy.deepcopy(base)
    s.update(fontFamily=font,fontSize=22,fontWeight=500,lineHeight=1.45,textColor=ink,nameColor=ink,systemColor=ink,nameColorMode='fixed',nameFormat='{name}:',nameTemplate='{name}: ',borderColor=edge,borderWidth=1,borderStyle='line',backgroundColor=bg,backgroundOpacity=.94,backgroundScope='panel',cornerRadius=min(radius,24),animationIn='fade',animationDuration=200,animationOut='fade',animationOutDuration=320,channels={'enabled':True,'rules':rules})
    s['presentation'].update(layout='inline',shape='rect',nameTreatment='plain',accent='none')
    for key,p in s['parts'].items():
        p.update(fontFamily=font,fontSize=22 if key!='badges' else 14,fontWeight=500,lineHeight=1.45)
        p['paint'].update(mode='solid',color=ink+'FF')
        p['outline'].update(width=0,color='#101528FF')
    s['frame'].update(target='panel',style='solid',width=1,legacyDetail='none')
    s['frame']['paint'].update(mode='solid',color=edge+'FF')
    s['frame']['outer']['enabled']=False
    s['frame']['radius']={k:radius for k in s['frame']['radius']}
    s['frame']['ornament'].update(style='none',color=edge+'FF')
    for key,b in s['backgrounds'].items(): b.update(mode='solid',color=bg+'FF',opacity=.94 if key=='panel' else 0,backdropBlur=0,recipe='none')
    if sid=='crystal-realm':
        s['frame']['outer'].update(enabled=True,color=edge+'FF',offset=3);s['frame']['ornament']['style']='diamonds';s['borderStyle']='double'
    if sid=='old-school-mmo': s['frame'].update(style='beveled',width=3);s.update(borderStyle='bevel',borderWidth=3)
    if sid=='arena-league': s['presentation'].update(shape='slash',cutSize=12)
    if sid=='space-station':
        s['frame']['target']='message';s['presentation']['shape']='speech';s['backgrounds']['panel']['opacity']=0;s['backgrounds']['message']['opacity']=1;s.update(backgroundScope='message',backgroundOpacity=1)
    if sid=='chatskins-signature':
        s.update(nameColorMode='twitch',borderEffect='animatedGradient',borderEffectSpeed=12,borderEffectColor='#B7AAFF',animationIn='pop',animationDuration=260,outlineWidth=1,outlineColor='#101528',mentionHighlightEnabled=True,mentionHighlightColor='#B7AAFF')
        s['frame']['width']=2;s['borderWidth']=2
        s['frame']['paint'].update(mode='linear',stops=[{'color':'#7EEAD6FF','position':0},{'color':'#B7AAFFFF','position':100}])
        s['presentation']['nameTreatment']='pill';s['presentation']['chipColor']='#101528FF'
        s['parts']['name']['fontFamily']='Chakra Petch';s['parts']['name']['glow'].update(enabled=True,color='#7EEAD640',blur=4)
        s['parts']['messageText']['outline']['width']=1
        s['emphasis'].update(firstMessage=True,color='#7EEAD6FF');s['emotes']['emoteOnlyScale']=2
    records.append(dict(id=sid,name=name,category='Game styles',description=note,designNotes=note,frameRecipe=recipe,settings=s,featured=sid=='chatskins-signature',stats=dict(zip(['readability','flair','motion','retro'],stats))))

# Keep the channel rule shape already present in 5e; effects are catalog recipes, not new rule fields.
recipes={
 'old-school-mmo':{'allCaps':'flash: text hue cycles yellow → pale coral → lavender over 2.4s, once, no opacity flash; then yellow.','action':'wave: translate whole message body Y 0 → -2px → 0 over 1.2s once; no character splitting.'},
 'block-server':{'firstTime':'One supplemental arrival line before the normal role-formatted first message; never hide the original message.'},
 'tactical-ops':{'firstTime':'Prefix *NEW* to the normal role line once; preserve admin/team color and show original message once.'},
 'space-station':{'crewDot':'Hash lowercase login with unsigned FNV-1a over UTF-8 bytes, modulo palette length; display name fallback. Palette: #C94949 #3978BF #38834E #9960B4 #BD7323 #438D91. Name remains visible; dot is decorative.'},
 'hero-quest':{'badges':'mod shield; vip sword; sub heart; highest role only, accessible role label, never rely on color.'},
 'chatskins-signature':{'nameChip':'Twitch color fill + same-color 4px static soft glow. Choose #101528 or #FFFFFF text by greater WCAG contrast; if neither reaches 4.5 adjust chip luminance minimally. Missing color #7EEAD6. Retain 1px contrasting chip edge.', 'badges':'Original SVG crown / sword / gem / star for broadcaster / mod / VIP / sub. Highest role wins; text label accompanies icon.', 'broadcaster':'Gold HOST tag; 600ms gold border-opacity pulse once (never text blink).','firstTime':'Supplemental ✦ NEW tag on existing message, one 800ms shimmer, no duplicate body.', 'mentionsChannel':'Violet 3px leading highlight bar independent of winning role.', 'action':'Italic violet body independent of role; retain role tag.', 'emoteOnly':'2× inline size, max 56px; preserve alt text and layout bounds.', 'entrance':'260ms translateY(10px) scale(.96) opacity(0) → identity opacity(1); 320ms fade exit, reserve row height.', 'ambient':'12s mint→violet ring: translate gradient layer inside border mask, static scanlines behind text; no animated blur/filter, no per-frame JS.', 'readability':'94% navy backing, white body with 1px navy outline; backing stays without blur. Contrast guarantee applies to default preset, not user transparency overrides.'}}
for rec in records: rec['channelPresentation']=recipes.get(rec['id'],{})
d['skins']=[records[0]]+[s for s in d['skins'] if s['id'] not in ids]+records[1:]
for i,s in enumerate(d['skins']):s['galleryOrder']=i
d['featuredSkinIds']=['chatskins-signature']+[x for x in d['featuredSkinIds'] if x!='chatskins-signature']
d['designRevision']='7a'
# Repair the absent schema declaration for the existing channels object, including saved snapshots.
channel_schema={'type':'object','properties':{'enabled':{'type':'boolean'},'rules':{'type':'array','maxItems':16,'items':{'type':'object','properties':{'enabled':{'type':'boolean'},'match':{'type':'string','enum':['broadcaster','mod','vip','sub','allCaps','action','mentionsChannel','everyone','firstTime']},'format':{'type':'string','maxLength':160},'textColor':{'type':'string','pattern':'^#[0-9A-Fa-f]{6}$'},'nameColor':{'type':'string','pattern':'^#[0-9A-Fa-f]{6}$'},'italic':{'type':'boolean'}},'required':['enabled','match','format','textColor','nameColor','italic'],'additionalProperties':False}}},'required':['enabled','rules'],'additionalProperties':False}
for schema in [d['settingsSchema'],d['savedSkinSchema']['properties']['settings']]:schema['properties']['channels']=copy.deepcopy(channel_schema)
(ROOT/'skins.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def icon(shape):
    paths={'shield':'M3 2h10v7l-5 5-5-5Z','sword':'m3 13 9-11 2 2-9 11M2 9l5 5','heart':'M8 14 2 8C-2 1 6 0 8 5 10 0 18 1 14 8Z','crown':'M2 12 1 4l4 3 3-5 3 5 4-3-1 8Z','gem':'m8 1 6 5-6 9L2 6Z','star':'m8 1 2 4 5 1-3 4 1 5-5-3-5 3 1-5-3-4 5-1Z'}
    return '<svg class="r7-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="'+paths[shape]+'"/></svg>'
def sample(rec):
    sid=rec['id'];rows=[]
    for i,q in enumerate(rec['settings']['channels']['rules']):
        m=q['match'];name={'broadcaster':'Orbit','mod':'Juniper','vip':'Nova','sub':'Moss','firstTime':'Pip'}.get(m,'Luna')
        msg={'allCaps':'WE HELD THE GATE!','action':'waves to the party','mentionsChannel':'@cozy_channel, ready when you are.','firstTime':'First time here — hello!'}.get(m,'One more run? I saved you a place.')
        name_markup='<b class="r7-name">'+name+'</b>'
        if sid in ['hero-quest','chatskins-signature']:
            shape=({'mod':'shield','vip':'sword','sub':'heart'} if sid=='hero-quest' else {'broadcaster':'crown','mod':'sword','vip':'gem','sub':'star'}).get(m)
            if shape:name_markup=icon(shape)+name_markup
        if sid=='space-station':
            crew_hash=2166136261
            for byte in name.lower().encode('utf-8'):crew_hash=((crew_hash ^ byte)*16777619)&0xffffffff
            crew_color=['#C94949','#3978BF','#38834E','#9960B4','#BD7323','#438D91'][crew_hash%6]
            name_markup='<span class="r7-dot" aria-hidden="true" style="background:'+crew_color+'"></span>'+name_markup
        body=html.escape(q['format']).replace('{name}',name_markup).replace('{message}','<span class="r7-body">'+html.escape(msg)+'</span>')
        rows.append(f'<div class="r7-line r7-{m}" data-channel="{m}" style="--line:{q["textColor"]};--name:{q["nameColor"]};font-style:{"italic" if q["italic"] else "normal"}"><small class="r7-label">{m}</small><div>{body}</div></div>')
    if sid=='chatskins-signature':rows.append('<div class="r7-line"><small class="r7-label">emote-only</small><div><b class="r7-name">Ember</b> <span class="r7-emotes" aria-label="Three original star emote placeholders">✦ ✦ ✦</span></div></div>')
    return '<div class="r7-chat '+sid+'" style="--r7-bg:'+rec['settings']['backgroundColor']+';--r7-edge:'+rec['settings']['borderColor']+';--r7-font:&quot;'+rec['settings']['fontFamily']+'&quot;;--r7-radius:'+str(rec['settings']['cornerRadius'])+'px">'+''.join(rows)+'</div>'
cards=[]
for rec in records:
    bars=''.join('<span>'+k.title()+' <meter min="0" max="5" value="'+str(v)+'">'+str(v)+'/5</meter> '+str(v)+'/5</span>' for k,v in rec['stats'].items())
    cards.append('<article class="r7-card" id="sample-'+rec['id']+'"><h3>'+rec['name']+('</h3><p class="r7-featured">First Featured · Brand original</p>' if rec['featured'] else '</h3>')+sample(rec)+'<div class="r7-stats">'+bars+'</div><p>'+rec['designNotes']+'</p><details><summary>Frame recipe and channel treatments</summary><p>'+rec['frameRecipe']+'</p>'+''.join('<p><b>'+html.escape(k)+':</b> '+html.escape(v)+'</p>' for k,v in rec['channelPresentation'].items())+'</details></article>')
section='<section class="r7-samples" id="round7a"><h2>More worlds. Your conversation.</h2><p>Round 7a · Signature showcase + eight game-style studies. Every channel is shown below. Sample chat; original CSS/SVG frames only.</p><p><a href="#sample-chatskins-signature">Signature showcase</a> · <a href="#sample-crystal-realm">Game styles</a></p><button type="button" onclick="this.closest(\'.r7-samples\').classList.toggle(\'r7-paused\');this.setAttribute(\'aria-pressed\',this.closest(\'.r7-samples\').classList.contains(\'r7-paused\'))" aria-pressed="false">Pause sample motion</button><div class="r7-grid">'+''.join(cards)+'</div></section>'
for filename in ['mockup.html','skins-mockup.html']:
    path=ROOT/filename;txt=path.read_text(encoding='utf-8')
    start=txt.find('<section class="r7-samples"')
    if start>=0: txt=txt[:start]+txt[txt.index('</main>',start):]
    if 'href="round7a.css"' not in txt:txt=txt.replace('</head>','<link rel="stylesheet" href="round7a.css"></head>')
    txt=txt.replace('</main>',section+'</main>');path.write_text(txt,encoding='utf-8')
catalog=[]
for rec in d['skins']:
    s=rec['settings'];x={k:rec[k] for k in ['id','name','category','description','featured','stats']};x.update(bg=s['backgroundColor'],border=s['borderColor'],text=s['textColor'],nameColor=s['nameColor'],radius=s['cornerRadius'],font=s['fontFamily'])
    if rec['id'] in ids:x['sampleHtml']=sample(rec)
    catalog.append(x)
(ROOT/'game-catalog.js').write_text('// Design-only catalog, generated from skins.json by round7a.py.\nwindow.reviewSkins='+json.dumps(catalog,ensure_ascii=False)+';\n',encoding='utf-8')
print('Wrote',len(records),'studies;',len(d['skins']),'total skins; all samples generated from channel rules.')
