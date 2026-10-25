// Writes docs/CODEX-SESSIONS.md in the ChatSkins repo: every Codex session (id, model, time, task) whose working
// directory is the repo, the research folder or the trailer folder. Run after each Codex round.
import fs from 'node:fs'; import path from 'node:path';
const ROOT = 'C:/Users/Administrator/.codex/sessions'; const REPO = 'C:/Users/Administrator/Desktop/twitch-chat-overlay';
const MATCH = /twitch-chat-overlay|chatskins-research|chatskins-trailer/;
const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : p.endsWith('.jsonl') && files.push(p); } })(ROOT);
const rows = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const meta = lines.find(o => o.type === 'session_meta')?.payload ?? {};
  const cwd = meta.cwd || (JSON.stringify(lines.slice(0, 5)).match(/"cwd":"([^"]+)"/) || [])[1] || '';
  if (!MATCH.test(cwd)) continue;
  const model = (JSON.stringify(lines.slice(0, 20)).match(/"model":"([^"]+)"/) || [])[1] || '?';
  const user = lines.map(o => o.payload).filter(p => p?.type === 'message' && p.role === 'user').map(p => (p.content || []).map(c => c.text || '').join(' ')).find(t => t && !t.startsWith('<')) || '';
  const task = user.replace(/\s+/g, ' ').replace(/[|]/g, '/').slice(0, 110);
  const where = cwd.includes('research') ? 'research' : cwd.includes('trailer') ? 'trailer art' : 'app';
  rows.push({ ts: meta.timestamp || path.basename(f).slice(8, 27), id: meta.id || (path.basename(f).match(/([0-9a-f]{8}-[0-9a-f-]{27})/) || [])[1], model, where, task });
}
rows.sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
const role = m => m.includes('astra') ? 'design (Astra)' : 'build (Luna)';
const role2 = r => r.where === 'research' ? 'research (Luna)' : r.where === 'trailer art' ? 'trailer art (Luna)' : role(r.model);
let md = `# Codex sessions

ChatSkins was built entirely with **OpenAI Codex**. Instead of one giant thread, we ran a small **multi-agent workflow**: each Codex agent has one job, and every round is its own short, focused session.

| Agent | Codex model | Job |
|---|---|---|
| **Astra**: designer | \`gpt-6-astra\` | Reads the brief, the research and the bug reports, then writes the design: layout, skin recipes, settings schema, mockups (\`design/\`). |
| **Luna**: builder | \`gpt-6-luna\` | Builds the app from Astra's design, writes the unit tests, and fixes the bugs found in testing. |
| **Luna**: researcher | \`gpt-6-luna\` + web search | Surveyed the top Twitch chat overlays (\`research/TOP-CHAT-UIS.md\`). |

**Why many sessions instead of one thread**
- **Token efficiency:** a fresh session per round keeps each context small. The agent reads only the brief, the design and the code it needs, instead of dragging hours of history. Design runs on Astra, and the bulk of the coding runs on Luna, the lighter model.
- **Task management:** one round = one task = one session. Every task is written down as a prompt file in this repo (\`DESIGN-PROMPT*.md\` for Astra, \`PROMPT*.md\` for Luna), so you can match each session below with its exact prompt and its commit.
- **Quality loop:** after every build we test in a real browser (and on live Twitch chat), measure what's wrong, and write those measurements into the next session's prompt.

The list below is generated from the local Codex session logs by \`log-sessions.mjs\`, so no row is typed by hand.

`;
md += `Total: **${rows.length}** sessions.\n\n| # | Started (UTC) | Session ID | Model | Role | Area | Task (first line of the prompt) |\n|---|---|---|---|---|---|---|\n`;
rows.forEach((r, i) => { md += `| ${i + 1} | ${String(r.ts).replace('T', ' ').slice(0, 19)} | \`${r.id}\` | ${r.model} | ${role2(r)} | ${r.where} | ${r.task} |\n`; });
fs.mkdirSync(path.join(REPO, 'docs'), { recursive: true }); fs.writeFileSync(path.join(REPO, 'docs/CODEX-SESSIONS.md'), md);
console.log(rows.length, 'sessions');
