import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const host = resolve(process.env.PI_MANAGED_INSTALL_ROOT ?? join(process.env.HOME, '.pi/agent/install'), 'releases/1.0.1/node_modules/@earendil-works/pi-coding-agent');
const { loadSkillsFromDir, formatSkillsForPrompt } = await import(join(host, 'dist/core/skills.js'));
const { DefaultResourceLoader } = await import(join(host, 'dist/core/resource-loader.js'));

const direct = loadSkillsFromDir({ dir: join(root, 'skills'), source: 'path' });
assert.equal(direct.skills.length, 48, 'all 48 pstack skills load');
assert.deepEqual(direct.diagnostics, [], 'no pstack parsing warnings');
assert.ok(direct.skills.every(s => s.disableModelInvocation), 'all pstack skills require explicit invocation');
assert.equal(formatSkillsForPrompt(direct.skills), '', 'pstack does not enter automatic skill routing');
assert.equal(new Set(direct.skills.map(s => s.name)).size, 48, 'unique command names');

for (const skill of direct.skills) {
    const content = readFileSync(skill.filePath, 'utf8');
    assert.ok(!content.includes('$pstack-codex:'), `${skill.name} uses Pi invocation syntax`);
    assert.ok(content.includes('Pi runtime adapter') || skill.name === 'setup-pstack', `${skill.name} declares the runtime boundary`);
}

const loader = new DefaultResourceLoader({
    cwd: process.env.HOME,
    agentDir: join(process.env.HOME, '.pi/agent'),
    noExtensions: true,
    noContextFiles: true,
});
await loader.reload();
const configured = loader.getSkills();
const installed = configured.skills.filter(s => s.filePath.startsWith(join(root, 'skills') + '/'));
assert.equal(installed.length, 48, 'actual user configuration discovers the installed package');
const collisions = configured.diagnostics.filter(d => d.path?.startsWith(root) || d.collision?.winnerPath?.startsWith(root));
assert.deepEqual(collisions, [], 'no pstack configuration warnings or collisions');
assert.ok(configured.skills.some(s => s.name === 'korean-technical-writing'), 'existing configured skills retained');

const lock = JSON.parse(readFileSync(join(root, 'source-lock.json'), 'utf8'));
const { createHash } = await import('node:crypto');
for (const [path, hash] of Object.entries(lock.sourceSkillSha256)) {
    assert.equal(createHash('sha256').update(readFileSync(join(lock.source, path))).digest('hex'), hash, 'Codex source remains unchanged');
}
console.log(JSON.stringify({ package: root, sourceVersion: lock.version, skills: installed.length, explicitOnly: true, warnings: collisions.length, originalCodexSkillsUnchanged: true }, null, 2));
