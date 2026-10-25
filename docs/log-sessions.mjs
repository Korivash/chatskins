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
let md = '# Codex sessions\n\nEvery OpenAI Codex session used to build ChatSkins, oldest first. They are generated from the local Codex session logs by `log-sessions.mjs`, so no row is typed by hand.\n\n';
md += `Total: **${rows.length}** sessions.\n\n| # | Started (UTC) | Session ID | Model | Role | Area | Task (first line of the prompt) |\n|---|---|---|---|---|---|---|\n`;
rows.forEach((r, i) => { md += `| ${i + 1} | ${String(r.ts).replace('T', ' ').slice(0, 19)} | \`${r.id}\` | ${r.model} | ${role(r.model)} | ${r.where} | ${r.task} |\n`; });
fs.mkdirSync(path.join(REPO, 'docs'), { recursive: true }); fs.writeFileSync(path.join(REPO, 'docs/CODEX-SESSIONS.md'), md);
console.log(rows.length, 'sessions');
