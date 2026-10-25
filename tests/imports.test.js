import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = (await readdir(path.join(root, 'js'))).filter(name => name.endsWith('.js'));
const sources = new Map(await Promise.all(files.map(async name => [name, await readFile(path.join(root, 'js', name), 'utf8')])));
const exportsByFile = new Map();

for (const [name, source] of sources) {
  const names = new Set();
  for (const match of source.matchAll(/\bexport\s+(?:async\s+)?(?:function|class|const|let|var)\s+([\w$]+)/g)) names.add(match[1]);
  for (const match of source.matchAll(/\bexport\s*\{([^}]+)\}(?:\s*from\s*['"][^'"]+['"])?/g)) {
    for (const item of match[1].split(',')) {
      const parts = item.trim().split(/\s+as\s+/);
      if (parts[0]) names.add(parts.at(-1));
    }
  }
  exportsByFile.set(name, names);
}

const importedNames = source => {
  const names = new Set();
  for (const match of source.matchAll(/\bimport\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g)) {
    for (const item of match[1].split(',')) {
      const parts = item.trim().split(/\s+as\s+/);
      if (parts[0]) names.add(parts.at(-1));
    }
  }
  return names;
};

const definedNames = source => {
  const names = new Set();
  for (const match of source.matchAll(/\b(?:async\s+)?function\s+([\w$]+)|\bclass\s+([\w$]+)|\b(?:const|let|var)\s+([\w$]+)/g)) names.add(match[1] || match[2] || match[3]);
  return names;
};

let failures = 0;
for (const [file, source] of sources) {
  const imported = importedNames(source);
  const defined = definedNames(source);
  const otherExports = new Set([...exportsByFile].filter(([other]) => other !== file).flatMap(([, names]) => [...names]));
  const missing = new Set();
  for (const match of source.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
    const name = match[1], before = source.slice(Math.max(0, match.index - 2), match.index);
    if (before.endsWith('.') || before.endsWith('?.')) continue;
    if (otherExports.has(name) && !imported.has(name) && !defined.has(name)) missing.add(name);
  }
  if (missing.size) {
    failures++;
    console.error(`${file}: called exported identifiers are not imported or defined: ${[...missing].join(', ')}`);
  }
}
assert.equal(failures, 0, 'module calls must import or define identifiers exported by another module');
console.log(`Checked imports and cross-module calls in ${files.length} modules.`);
