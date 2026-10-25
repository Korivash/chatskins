"""Design-only catalog and standalone specimen generator. Run from any directory."""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# id, name (existing names are asserted), silhouette, layout, type, tagline, ink, paper, accent, motion, duration, layers
ROWS = [
('aurora','Aurora','Asymmetric auroral arch; 36px upper-left and 4px lower-right corners','Small spaced sender above a wide calm text field','Trebuchet MS','Northern lights, right on the edge.','#F3F7FF','#0C202B','#8EF8D1','aurora-flow',14,1),
('glitter-bomb','Glitter Bomb','Scalloped party seal with six shallow teeth on each side','Bold centered sender over left-aligned message','Verdana','A little sparkle. A grand entrance.','#FFF2FC','#341833','#FFD1EE','glitter-twinkle + glitter-entry',4.6,2),
('neon-pulse','Neon Pulse','Open-ended neon tube; squared left, semicircular right','Condensed sender on a small black sign above body','Arial Narrow','The sign is on. Chat is alive.','#FFF3FA','#251225','#FF8EDB','neon-breathe + neon-arrive',3.8,1),
('prism-shift','Prism Shift','Faceted six-sided prism with clipped opposite points','Independent rainbow sender chip above plain white body','Verdana','Every color gets its moment.','#F5F6FF','#171B38','#BFC6FF','prism-hue',12,2),
('holo-foil','Holo Foil','Foil pass with one deep concave right notch','Monospaced sender beside a vertical foil registration strip','Consolas','Catch the light as the chat rolls in.','#F1F8FF','#152B37','#B9EDF2','holo-sweep',7,1),
('lava-lamp','Lava Lamp','Organic kidney lozenge with unequal bulbous ends','Heavy rounded sender, indented message below','Trebuchet MS','Slow lava. Warm conversation.','#FFF2E6','#361919','#FFBD82','lava-drift-a + lava-drift-b',11,2),
('electric-storm','Electric Storm','Jagged lightning plate with serrated side cuts','Slab sender on a high rail, body in a recessed well','Rockwell','A charged edge. Mods bring the thunder.','#EFF8FF','#121F38','#B9DFFF','storm-crackle + mod-bolt',5.2,2),
('starfall','Starfall','Observatory pennant with a shallow central lower point','Small serif sender above generous astronomical reading field','Georgia','Make a wish between messages.','#F5F2FF','#191B39','#DDD3FF','starfall-travel',6,1),
('fire-frame','Fire Frame','Ember hearth with flame-tooth crown and flat base','Bold slab sender anchored low above the body','Rockwell','Keep the conversation burning.','#FFF4DD','#301A16','#FFC276','fire-lick',2.8,1),
('ice-crystal','Ice Crystal','Crystal shard with three stepped facets on the right','Fine serif sender, upright sans body inside a frosted ledge','Georgia','A fresh frost on every arrival.','#F1FCFF','#142B3A','#BDEFFF','frost-sweep + ice-freeze',8,2),
('bubble-lift','Bubble Lift','Deep speech balloon with a real 12px left-pointing tail','Sender on top; body inset from tail','Trebuchet MS','Every voice gets a real speech bubble.','#EFFFFB','#123C40','#8AE9D6','lift-in',.32,1),
('glass-card','Glass Card','Transparent glass slide held by two offset opaque corner tabs','Sender in a top tab; body floats on a blue glass slide','Segoe UI','A glass slide, held up to the light.','#F4FAFF','#203D50','#B7DFFF','glass-in',.4,1),
('name-tag','Name Tag','Two stacked badge strips; short name tab over wide square body strip','Name tag protrudes left; body starts 18px to its right','Arial Narrow','Put every name on the guest list.','#F4F8FF','#203759','#B1D0FF','tag-in',.28,1),
('comic-burst','Comic Burst','Irregular eight-corner comic panel with offset hard ink shadow','Oversized italic sender; halftone margin and upright body','Impact','Big panel energy for the best lines.','#241B30','#FFF0AC','#211B2D','comic-in',.28,1),
('pastel-pop','Pastel Pop','Ticket stub with paired inward semicircle notches and perforation','Sender in the narrow stub; message in the main ticket','Verdana','A ticket to the softer side of chat.','#342245','#EAD9F2','#765083','ticket-in',.35,1),
('esports-slash','Esports Slash','Forward spear plate with a split swallowtail at the left','Wide condensed sender header; message aligned to spear base','Arial Narrow','Sharp calls. A sharper silhouette.','#F4FFE9','#203023','#B6F477','slash-in',.2,1),
('quiet-line','Quiet Line','Borderless newspaper ticker with one short lower rule','Small serif byline inline with the message','Georgia','A byline, a thought, a quiet rule.','#F0EADF','#18232E','#DCD1B7','quiet-in',.4,1),
('neon-edge','Neon Edge','Unclosed L-shaped neon bracket; no top or right perimeter','Tall sender at the elbow; body aligned to vertical rail','Arial Narrow','One bright bracket. Plenty of attitude.','#FFF0FF','#281B34','#DBAEFF','edge-in',.28,1),
('sticker-stack','Sticker Stack','Tilted sticky note with a folded lower-right corner','Handwritten sender across the note; left-aligned informal body','Segoe Print','Leave a little note for the stream.','#392B21','#FFE5A9','#A86639','note-in',.4,1),
('initial-card','Initial Card','Pill chip with a separate circular initial medallion overlapping its start','Initial spans two rows; bold name then compact body','Trebuchet MS','A face for every name, without a photo.','#EEF5FF','#283957','#B7CEFA','pill-in',.3,1),
('signal-console','Signal Console','Receipt with zigzag torn bottom and a narrow printed top strip','Monospaced sender header, dashed rule, message below','Consolas','Message received. Receipt printed.','#163B30','#DAF2DB','#38765E','receipt-in',.4,1),
('announcer','Announcer','Retro TV caption bar with projecting left station tab and stair-step right end','Large condensed sender; body on a separate black caption baseline','Arial Narrow','Give every line the headline treatment.','#FFF9E5','#22222B','#FFE095','caption-in',.25,1),
('bubble-chat','Bubble Chat','Double-lobed thought cloud with two detached trailing dots','Inline rounded bold name and airy message','Trebuchet MS','For the thoughts chat cannot keep in.','#372D56','#EDE8FF','#BBAEDB','cloud-in',.4,1),
('clean','Clean','Plain typewriter sheet with a red left margin and stepped paper top','Monospaced sender above full-width typed body; no reveal delay','Consolas','Just the words, on a fresh page.','#263346','#F1F5F9','#657891','paper-in',.22,1),
('candy-pop','Candy Pop','Playing card with rounded top, clipped bottom and opposite diamond pips','Serif sender at top; friendly sans body; pips in reserved corners','Georgia','Deal your chat a sweeter hand.','#562841','#FFE0EB','#A84570','card-in',.35,1),
('rainbow-border','Rainbow Border','Polaroid with square rainbow rim and a deep white caption foot','Dark photo-well body above the sender caption','Verdana','Frame the lines worth remembering.','#F7F3FF','#24243C','#E8C6FF','photo-in',.38,1),
('terminal','Terminal','Continuous-feed terminal paper with punched left holes','Monospaced prompt column and command body; full text on arrival','Consolas','The conversation, straight from the feed.','#CBF5D9','#11271C','#87D6A5','terminal-cursor',2,1),
('vaporwave','Vaporwave','Cassette label with chamfered top shoulders and twin reel windows','Italic wide sender on label band; plain body underneath','Trebuchet MS','Late-night chat on a drifting mixtape.','#FFF0FF','#35264C','#FAB5E9','tape-drift',16,1),
]

def main():
    catalog = json.loads((ROOT/'skins.json').read_text(encoding='utf-8'))
    existing = {s['id']:s for s in catalog['skins']}
    base = copy.deepcopy(existing['clean'])
    records = []
    for i, row in enumerate(ROWS):
        sid,name,shape,layout,font,tag,ink,paper,accent,motion,seconds,layers = row
        new = sid not in existing
        skin = copy.deepcopy(base) if new else existing[sid]
        if not new:
            assert skin['name'] == name
        skin.update(id=sid,name=name,tagline=tag)
        if new:
            skin.update(category='Animated',featured=False,galleryOrder=42+i)
            skin['alertRecipe'] = copy.deepcopy(base['alertRecipe'])
            skin['alertRecipe'].update(title=name+' update',frameNote=shape,motion='fade')
            # Deliberately valid static v3 fallback; full new geometry is design metadata.
            s=skin['settings']
            s.update(fontFamily=font,textColor=ink,nameColor=accent,backgroundColor=paper,borderColor=accent,backgroundOpacity=1,backgroundScope='message',borderStyle='line',borderWidth=2,borderEffect='none',backgroundEffect='none',ambientEffect='none',textEffect='none',nameEffect='none',animationIn='none')
            for k,p in s['parts'].items():
                p.update(fontFamily=font,inheritTypography=False)
                p['paint'].update(mode='solid',color=(accent if k=='name' else ink)+'FF')
                p['shadow']['enabled']=False
                p['outline']['width']=0
                p['glow']['enabled']=False
            s['frame'].update(target='message',style='solid',width=2)
            s['frame']['paint'].update(mode='solid',color=accent+'FF')
            s['backgrounds']['message'].update(mode='solid',color=paper+'FF',opacity=1,backdropBlur=0,recipe='none')
            s['backgrounds']['panel']['opacity']=0
            catalog['skins'].append(skin)
        skin['stats']={'readability':4 if i<10 or sid in ('comic-burst','sticker-stack','vaporwave') else 5,'flair':5 if i<10 else (2 if sid in ('clean','quiet-line') else 4),'motion':5 if i<10 else (4 if sid in ('terminal','vaporwave') else 2),'retro':4 if font in ('Consolas','Rockwell','Impact','Georgia') else 1}
        recipe={'version':10,'status':'design-only; authoritative over earlier visual recipes; settings retained as v3 fallback','silhouette':shape,'layout':layout,'typography':{'nameFamily':font,'bodyFamily':'Segoe UI' if sid in ('ice-crystal','candy-pop','comic-burst') else font,'nameSizePx':20 if sid!='announcer' else 28,'bodySizePx':22,'lineHeight':1.45,'fallback':'serif' if font in ('Georgia','Rockwell') else 'monospace' if font=='Consolas' else 'sans-serif'},'palette':{'ink':ink,'surface':paper,'accent':accent},'motion':{'keyframes':motion.split(' + '),'cycleSeconds':seconds,'maximumAnimatedLayersPerMessage':layers,'trigger':'ambient + entry' if i<10 else 'ambient' if sid in ('terminal','vaporwave') else 'entry only','reduced':'No animation; full text and final silhouette immediately; static accent and texture. No burst, bolts, travel or typing.'},'geometryReference':'round10.css .skin-'+sid,'content':'Reserve ornaments outside content; wrap names and long words; no text clipping; preserve badges, emotes and moderation.'}
        skin['round10Recipe']=recipe
        records.append({'id':sid,'name':name,'category':skin['category'],'tagline':tag,'stats':skin['stats'],'recipe':recipe,'new':i<10})
    catalog['designRevision']=10
    catalog['round10Design']={'status':'design-only','totalSkins':52,'newAnimated':10,'reworkedBasics':18,'recipeAuthority':'round10Recipe overrides earlier appearance prose; settings remain valid static fallbacks, not a full implementation','preview':'animated-mockup.html','statsMeaning':'Art-directed 1–5 descriptors, not measured performance or accessibility scores','motionBudget':'At most 3 animated elements per message including entrance; no per-frame JavaScript; visible previews only','heroSkinIds':['aurora','glitter-bomb','holo-foil']}
    (ROOT/'skins.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    template=(ROOT/'animated-template.html').read_text(encoding='utf-8')
    (ROOT/'animated-mockup.html').write_text(template.replace('/*CATALOG*/',json.dumps(records,ensure_ascii=False).replace('</','<\\/')),encoding='utf-8')
    # Update only our new round; preserve every byte of earlier text (including existing edits).
    path=ROOT/'DESIGN.md'
    previous=path.read_text(encoding='utf-8').split('\n# Round 10: Skins that stand out')[0]
    prose=(ROOT/'round10-notes.md').read_text(encoding='utf-8')
    table='\n\n### Complete silhouette register (all 52 skins)\n\nEvery changed record has its exact geometry in `round10.css` and layout/type/palette/motion in `round10Recipe`. Retained game worlds keep their historical panel geometry; uniqueness below is mandatory for the 28 Round 10 treatments, not a retroactive redesign of those game worlds.\n\n| Skin / stable ID | Silhouette | Layout and type |\n| --- | --- | --- |\n'
    retained={
    'chatskins-signature':('Mint/violet rounded shared panel','Role chips; Chakra Petch + Barlow'), 'guild-chat':('Two continuous gold rings, 2px gap, forest shared panel','Inline guild channels; Lato'), 'fantasy-mmo':('Lavender double window, inset diamonds','Inline party lines; Noto Sans'), 'block-craft':('Two-step moss pixel blocks','Angle-bracket sender; Pixelify Sans'), 'battle-arena':('Teal tactical shared pane with square corner brackets','Squad name column; Barlow'), 'battle-royale':('Sand notched field cards','Squad header; Barlow Condensed'), 'retro-rpg':('Cobalt dialogue panel with twin white rim','Triangular speaker prompt; VT323'), 'cyber-city':('Magenta cut-corner city panels','Cyan callsign header; Barlow'), 'arcade-cabinet':('Purple pixel cabinet bezel','Score-line names; Pixelify Sans'), 'space-command':('Steel-blue shared communications pane with long brackets','Comms header; Barlow'), 'monster-trainer':('Ivory heavy-rim dialogue cards','Sender says header; VT323'), 'dungeon-crawler':('Stone bevel panel with brass diamonds','Bracketed serif names; Roboto Slab'), 'cozy-farm':('Wood plaques with peg corners','Cream name over body; Nunito Sans'), 'horror-survival':('Dusty red emergency slips','Transmission header; IBM Plex Mono'), 'hero-shooter':('Orange stripe cards with white corner wedges','Compact callsign; Barlow Condensed'), 'kart-racer':('Yellow racing capsules with mint lane stripe','Inline sender; Nunito Sans'), 'crystal-realm':('Crystal blue shared panel with corner facets','Party channels; Lora'), 'old-school-mmo':('Brass-beveled brown ledger','Inline golden realm chat; Bree Serif'), 'frontier-mmo':('Charcoal map-chat pane','Colored channel labels; Lato'), 'arena-league':('Dark team-chat shared pane','Team/all columns; Barlow Condensed'), 'tactical-ops':('Dark tactical feed','Team prompts; IBM Plex Mono'), 'block-server':('Grey block-server pane','VIP and arrival labels; Pixelify Sans'), 'hero-quest':('Dark role-party pane','Role titles; Lora'), 'space-station':('White station bubble row with small tail','Role dots; Nunito Sans')}
    for skin in catalog['skins']:
        r=skin.get('round10Recipe')
        shape,layout=(r['silhouette'],r['layout']+'; '+r['typography']['nameFamily']+' / '+r['typography']['bodyFamily']) if r else retained[skin['id']]
        table+=f"| {skin['name']} (`{skin['id']}`) | {shape} | {layout} |\n"
    path.write_text((previous+ '\n'+prose+table).rstrip()+'\n',encoding='utf-8')
    print('52 catalog skins; 10 new Animated; 18 reworked; 28 standalone specimens generated.')

if __name__=='__main__':
    main()
