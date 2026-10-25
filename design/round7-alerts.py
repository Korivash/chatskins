"""Design artifact generator only. Never imports or modifies application code."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
path = ROOT / 'skins.json'
catalog = json.loads(path.read_text(encoding='utf-8'))
directions = {
 'chatskins-signature': ('Community achievement', 'Mint/violet ring, inset highlight and compact name chip', 'pop', 'triangle'),
 'bubble-lift': ('A little celebration', 'Mint speech balloon with low left tail', 'pop', 'sine'),
 'glass-card': ('Stream moment', 'Ice edge and translucent card; no dependence on backdrop blur', 'fade', 'sine'),
 'name-tag': ('Community update', 'Blue tab above aligned body; icon occupies name rail', 'slide', 'triangle'),
 'comic-burst': ('Big moment!', 'Butter balloon, heavy ink perimeter and hard offset shadow', 'pop', 'square'),
 'pastel-pop': ('Something lovely', 'Lavender ticket corners with restrained lilac dots', 'pop', 'sine'),
 'esports-slash': ('Squad milestone', 'Lime diagonal plate with upright lettering', 'slide', 'triangle'),
 'quiet-line': ('Thank you', 'Warm name rule and quiet dark reading strip', 'fade', 'sine'),
 'neon-edge': ('Signal received', 'Violet start rail with static edge glow; unglowed body', 'fade', 'triangle'),
 'sticker-stack': ('New sticker moment', 'Apricot title sticker on a plum card', 'pop', 'sine'),
 'initial-card': ('Community moment', 'Icon medallion spanning two text rows', 'fade', 'sine'),
 'signal-console': ('Event received', 'Dashed mint receipt and amber prompt', 'slide', 'triangle'),
 'announcer': ('In the spotlight', 'Gold headline above dark lower third', 'slide', 'triangle'),
 'guild-chat': ('[Guild] Achievement', 'Two continuous 1px gold rings, 2px clear gap, forest backing', 'fade', 'triangle'),
 'fantasy-mmo': ('[Party] Commendation', 'Lavender double window and inset diamond corners', 'fade', 'sine'),
 'block-craft': ('Advancement unlocked', 'Moss-grey staircase frame with grass-green icon tile', 'step', 'square'),
 'battle-arena': ('[Team] Milestone', 'Teal corner brackets and aligned tactical pane', 'slide', 'triangle'),
 'battle-royale': ('Squad supply drop', 'Sand-yellow notched field card', 'slide', 'triangle'),
 'retro-rpg': ('A new adventure!', 'Blue dialog window and full white double ring', 'step', 'square'),
 'cyber-city': ('City transmission', 'Magenta frame, cyan headline, deep plum backing', 'slide', 'triangle'),
 'arcade-cabinet': ('New high moment', 'Purple pixel frame, amber text, static scanlines behind content', 'step', 'square'),
 'space-command': ('Incoming transmission', 'Cyan HUD brackets on a navy instrument panel', 'slide', 'triangle'),
 'monster-trainer': ('A new friend!', 'Ivory dialog box and thick charcoal perimeter', 'step', 'square'),
 'dungeon-crawler': ('Treasure discovered', 'Stone-colored bevel with warm amber icon', 'fade', 'triangle'),
 'cozy-farm': ('A gift at the gate', 'Brown board seams and cream lettering', 'pop', 'sine'),
 'horror-survival': ('Contact confirmed', 'Dim red frame, clear warm text; no flicker or scare sound', 'fade', 'sine'),
 'hero-shooter': ('Team recognition', 'Orange stripe with white corner wedges', 'slide', 'triangle'),
 'kart-racer': ('Victory lap', 'Yellow/mint pill with dark ink', 'pop', 'square'),
 'bubble-chat': ('A happy update', 'Pale rounded capsule with plum text', 'pop', 'sine'),
 'clean': ('Community update', 'Minimal dark card with no added ornamental frame', 'fade', 'sine'),
 'candy-pop': ('Sweet moment', 'Warm pastel tile with dark plum lettering', 'pop', 'sine'),
 'rainbow-border': ('A colorful milestone', 'Static multicolor perimeter on navy', 'fade', 'triangle'),
 'terminal': ('event > received', 'One green console pane; complete text, no typing delay', 'fade', 'square'),
 'vaporwave': ('New frequency', 'Pink/teal fill with pale mint lettering', 'fade', 'sine'),
 'crystal-realm': ('[Party] Honor earned', 'Silver inset window and cool diamond seal', 'fade', 'sine'),
 'old-school-mmo': ('Realm achievement', 'Brass bevel, brown stone ledger and yellow serif text', 'step', 'square'),
 'frontier-mmo': ('[Map] New discovery', 'Parchment-colored margin on an olive pane', 'slide', 'triangle'),
 'arena-league': ('[Team] Honor', 'Slanted gold plate; orange body remains upright', 'slide', 'triangle'),
 'tactical-ops': ('[Comms] Event confirmed', 'Minimal blue-grey comms strip with orange monospace text', 'slide', 'triangle'),
 'block-server': ('Server milestone', 'Square grey server notice with pixel icon', 'step', 'square'),
 'hero-quest': ('[Party] Quest complete', 'Bronze role-icon rail on a purple story pane', 'fade', 'triangle'),
 'space-station': ('Crew announcement', 'White meeting bubble, navy ink and small crew dot', 'pop', 'sine'),
}
types = {
 'follow': ('Follow', '{name} joined the adventure!', 5, 'spark', [523.25,659.25]),
 'sub': ('Subscription', '{name} subscribed!', 7, 'star', [523.25,659.25,783.99]),
 'resub': ('Resubscription', '{name} is back for {months} months!', 9, 'cycle', [659.25,783.99,1046.5]),
 'giftSub': ('Gift subscriptions', '{name} gifted {count} subscriptions!', 8, 'gift', [523.25,783.99,1046.5]),
 'raid': ('Raid', '{name} arrived with {viewers} viewers!', 9, 'banner', [392,523.25,783.99]),
 'cheer': ('Cheer', '{name} cheered {bits} bits!', 6, 'gem', [783.99,1046.5]),
 'redemption': ('Channel points', '{name} redeemed a channel reward!', 7, 'ticket', [659.25,523.25]),
}
icons = {
 'spark': 'M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z',
 'star': 'M12 2 L15 8 L22 9 L17 14 L18 21 L12 18 L6 21 L7 14 L2 9 L9 8 Z',
 'cycle': 'M19 8 A8 8 0 1 0 20 15 M19 3 L19 8 L14 8',
 'gift': 'M3 9 H21 V14 H3 Z M5 14 V22 H19 V14 M12 9 V22 M12 9 C2 9 4 0 8 3 Z M12 9 C22 9 20 0 16 3 Z',
 'banner': 'M5 22 V3 H20 L17 8 L20 13 H5 M9 6 H14 M9 10 H13',
 'gem': 'M12 2 L21 10 L12 22 L3 10 Z M3 10 H21 M12 2 L8 10 L12 22 L16 10 Z',
 'ticket': 'M3 5 H21 V9 Q17 12 21 15 V19 H3 V15 Q7 12 3 9 Z M12 8 V16',
}

def obj(properties):
 return {'type':'object', 'properties':properties, 'required':list(properties), 'additionalProperties':False}
def integer(default, lo, hi):
 return {'type':'integer','default':default,'minimum':lo,'maximum':hi}
def boolean(default):
 return {'type':'boolean','default':default}
defaults = {'version':1,'enabled':False,'position':'top-center','widthPx':480,'insetPx':36,
 'queue':{'maxPending':20,'maxAgeSeconds':120,'followDedupeSeconds':30,'gapMs':500},
 'sound':{'enabled':False,'volume':0.2},'showViewerMessage':True,'showRewardTitle':True,
 'types':{k:{'enabled':k!='redemption','message':v[1],'holdSeconds':v[2]} for k,v in types.items()}}
schema = obj({
 'version':{'const':1}, 'enabled':boolean(False),
 'position':{'type':'string','enum':['top-left','top-center','top-right','center','bottom-left','bottom-right'],'default':'top-center'},
 'widthPx':integer(480,280,800),'insetPx':integer(36,0,120),
 'queue':obj({'maxPending':integer(20,1,50),'maxAgeSeconds':integer(120,15,300),'followDedupeSeconds':integer(30,5,120),'gapMs':integer(500,0,2000)}),
 'sound':obj({'enabled':boolean(False),'volume':{'type':'number','minimum':0,'maximum':1,'default':0.2}}),
 'showViewerMessage':boolean(True),'showRewardTitle':boolean(True),
 'types':obj({k:obj({'enabled':boolean(k!='redemption'),'message':{'type':'string','minLength':1,'maxLength':160,'default':v[1]},'holdSeconds':integer(v[2],3,20)}) for k,v in types.items()}),
})
catalog['alertDesign'] = {'version':1,'status':'design-only; requires a new alerts renderer and codec',
 'settingsSchema':schema,'defaults':defaults,
 'tokenBindings':{'frame':'frame','shape':'presentation','bodyTypography':'resolved parts.messageText',
 'titleTypography':'resolved parts.name','bodyPaint':'parts.messageText.paint','namePaint':'parts.name.paint',
 'surface':'backgrounds[frame.target]','accent':'frame.paint','reduceMotion':'reduceMotion OR system preference'},
 'icons':{k:{'viewBox':'0 0 24 24','path':v,'fill':'none','stroke':'currentColor','strokeWidth':1.75} for k,v in icons.items()},
 'types':{k:{'label':v[0],'defaultMessage':v[1],'holdSeconds':v[2],'icon':v[3],'notesHz':v[4]} for k,v in types.items()},
 'soundEnvelope':{'noteMs':110,'gapMs':35,'attackMs':8,'releaseMs':75,'peakGain':0.08,'maxVoices':1},
 'motion':{'fade':{'enterMs':220,'exitMs':180,'from':'opacity(0)'},
 'slide':{'enterMs':220,'exitMs':180,'from':'translateY(-12px) opacity(0); bottom anchors use +12px'},
 'pop':{'enterMs':240,'exitMs':180,'from':'scale(.96) opacity(0)'},
 'step':{'enterMs':160,'exitMs':160,'from':'translateY(-8px) opacity(0); steps(2,end)'},
 'exit':'opacity only; step uses steps(2,end); no reverse travel','reduced':'immediate enter/exit; preserve hold'},
 'templateTokens':{'follow':['name'],'sub':['name'],'resub':['name','months'],'giftSub':['name','count'],'raid':['name','viewers'],'cheer':['name','bits'],'redemption':['name']},
 'subscriptionVariants':['tier1','tier2','tier3','prime'],
 'primeNotice':'Preview-only Prime variant: EventSub cannot distinguish Prime from Tier 1. Live 1000 badge: Tier 1 / Prime.',
}
for skin in catalog['skins']:
 title, frame, motion, wave = directions[skin['id']]
 skin['alertRecipe'] = {'version':1,'title':title,'frameNote':frame,
  'tokenBindings':'alertDesign.tokenBindings','iconSet':'alertDesign.icons','iconTreatment':'pixel-grid' if motion=='step' else 'outline',
  'motion':motion,'soundWave':wave,'typeDefaults':'alertDesign.types','surfaceOpacityFloor':0.94,
  'titleSizePx':16,'bodySizePx':'clamp(20, resolved messageText fontSize, 32)',
  'iconSizePx':36,'paddingPx':20,'columnGapPx':16,
  'followMessage': 'A wild follower appears! {name} joined the party.' if skin['id']=='retro-rpg' else types['follow'][1]}
path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Standalone, offline review sheet: baked specimens, no catalog fetch or application scripts.
review_ids=['guild-chat','retro-rpg','block-craft','chatskins-signature']
samples=[('follow','Follow',{'name':'Moss'}),('sub','Sub · Tier 1',{'name':'Nova','tier':'Tier 1'}),
 ('sub','Sub · Tier 2',{'name':'Nova','tier':'Tier 2'}),('sub','Sub · Tier 3',{'name':'Nova','tier':'Tier 3'}),
 ('sub','Sub · Prime',{'name':'Nova','tier':'Prime · test only'}),
 ('resub','Resub · 12 months',{'name':'Moss','months':12,'viewerMessage':'A year of late-night adventures. Glad to be here!'}),
 ('giftSub','Gift · 5 subs',{'name':'Juniper','count':5}),('raid','Raid · 128 viewers',{'name':'NightCrew','viewers':128}),
 ('cheer','Cheer · 1,000 bits',{'name':'PixelPilot','bits':'1,000'}),
 ('redemption','Channel points',{'name':'Fern','rewardTitle':'Hydrate the party'})]
skin_map={s['id']:s for s in catalog['skins']}
def card(sid, index):
 s=skin_map[sid]; recipe=s['alertRecipe']; kind,label,data=samples[index]
 message=recipe['followMessage'] if kind=='follow' else types[kind][1]
 for key,value in data.items(): message=message.replace('{'+key+'}',str(value))
 title=recipe['title']; detail=data.get('viewerMessage',data.get('rewardTitle',''))
 icon=icons[types[kind][3]]
 return f'<article class="alert {sid}" data-kind="{kind}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="{icon}"/></svg><div><div class="alert-title">{html.escape(title)}</div><div class="event-label">{html.escape(label)}</div><p class="alert-message">{html.escape(message)}</p>{"<blockquote>"+html.escape(detail)+"</blockquote>" if detail else ""}</div></article>'
css=[]
for sid in review_ids:
 s=skin_map[sid]['settings']; f=s['frame']; bg=s['backgrounds'][f['target']]
 css.append(f'.{sid}{{--skin-bg:{bg["color"]};--skin-ink:{s["parts"]["messageText"]["paint"]["color"]};--skin-accent:{f["paint"]["color"]};--skin-name:{s["parts"]["name"]["paint"]["color"]};font-family:"{s["parts"]["messageText"]["fontFamily"]}",'+('monospace' if sid in ['retro-rpg','block-craft'] else 'sans-serif')+';}')
atlas=''.join('<section class="specimen"><h3>'+html.escape(skin_map[sid]['name'])+'</h3><p class="recipe-note">'+html.escape(skin_map[sid]['alertRecipe']['frameNote'])+'</p>'+''.join('<div class="specimen-row"><span class="sample-caption">'+html.escape(label)+'</span>'+card(sid,i)+'</div>' for i,(_,label,_) in enumerate(samples))+'</section>' for sid in review_ids)
controls=''.join(f'<fieldset><legend>{v[0]}</legend><label class="toggle"><input type="checkbox" {"checked" if k!="redemption" else ""}> Enable {v[0].lower()}</label><label>Message <input value="{html.escape(v[1],quote=True)}" maxlength="160"></label><small>Tokens: '+', '.join('{'+t+'}' for t in catalog['alertDesign']['templateTokens'][k])+f'</small><button type="button" class="type-test" data-index="{next(i for i,x in enumerate(samples) if x[0]==k)}">Send test {v[0].lower()}</button></fieldset>' for k,v in types.items())
data={'cards':{sid:[card(sid,i) for i in range(len(samples))] for sid in review_ids},'samples':samples,'recipes':{sid:skin_map[sid]['alertRecipe'] for sid in review_ids},'types':catalog['alertDesign']['types']}
template=(ROOT/'alerts-template.html').read_text(encoding='utf-8')
out=template.replace('/* SKIN_CSS */','\n'.join(css)).replace('<!-- ATLAS -->',atlas).replace('<!-- TYPE_CONTROLS -->',controls).replace('/* REVIEW_DATA */','const review = '+json.dumps(data,ensure_ascii=False).replace('</',r'<\/')+';')
(ROOT/'alerts-mockup.html').write_text(out,encoding='utf-8')
print(f'Added {len(directions)} recipes; generated {len(review_ids)*len(samples)} specimens.')
