import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {renderMarkdown,searchDocs,slugify} from '../docs/docs.js';

test('Markdown escapes HTML and supports headings, paragraphs, lists, links, and images',()=>{
 const html=renderMarkdown('# Hello World\n\nSafe <script>alert(1)</script> text.\n\n- one\n- two\n\n[Guide](https://example.com/docs) and ![diagram](https://example.com/diagram.png)');
 assert.match(html,/<h1 id="hello-world">Hello World<\/h1>/);assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;script&gt;/);assert.match(html,/<ul><li>one<\/li><li>two<\/li><\/ul>/);assert.match(html,/<a href="https:\/\/example.com\/docs">Guide<\/a>/);assert.match(html,/<img src="https:\/\/example.com\/diagram.png" alt="diagram" loading="lazy">/);
 assert.doesNotMatch(renderMarkdown('[bad](javascript:alert(1))'),/href="javascript:/);
});

test('Markdown renders fenced code and labeled callouts',()=>{
 const html=renderMarkdown('> [!TIP]\n> Keep the link private.\n\n> [!WARNING]\n> Check the source.\n\n```html\n<img src=x>\n```');
 assert.match(html,/class="callout tip"><strong>Tip<\/strong><p>Keep the link private\.<\/p><\/aside>/);assert.match(html,/class="callout warning"><strong>Warning<\/strong>/);assert.match(html,/<pre><code>&lt;img src=x&gt;<\/code><\/pre>/);
});

test('docs navigation and content files match one-to-one',async()=>{
 const nav=JSON.parse(await readFile(new URL('../docs/nav.json',import.meta.url),'utf8')),files=(await readdir(new URL('../docs/content/',import.meta.url))).filter(name=>name.endsWith('.md')).map(name=>name.slice(0,-3));const entries=nav.flatMap(group=>group.pages.map(([slug,title])=>({slug,title,group:group.group})));assert.equal(entries.length,26);assert.deepEqual([...entries.map(x=>x.slug)].sort(),[...files].sort());for(const {slug,title} of entries){const markdown=await readFile(new URL(`../docs/content/${slug}.md`,import.meta.url),'utf8');assert.match(markdown,/^#\s/m,slug);assert.equal(markdown.match(/^#\s+(.+)$/m)?.[1],title,slug)}
});

test('client-side docs search matches titles and headings without case sensitivity',()=>{
 const pages=[{slug:'emotes',title:'Emotes',group:'Customize',headings:['7TV, BTTV, and FFZ']},{slug:'frames',title:'Frames',group:'Customize',headings:['Double borders']}];assert.deepEqual(searchDocs(pages,'emote').map(x=>x.page.slug),['emotes']);assert.deepEqual(searchDocs(pages,'7tv').map(x=>x.heading),['7TV, BTTV, and FFZ']);assert.deepEqual(searchDocs(pages,'BORDERS').map(x=>x.page.slug),['frames']);assert.deepEqual(searchDocs(pages,''),[]);assert.equal(slugify('7TV, BTTV & FFZ'),'7tv-bttv-ffz');
});
