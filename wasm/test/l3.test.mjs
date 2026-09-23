// Level 3 of check.html, both halves, against synthetic material made here.
//
// No publisher's reference set, envelope or key is stored in this repository
// (methodology: the catalog holds no reference values of its own). Everything
// below is generated on each run: a three-level CA with the RIM signing purpose,
// a tactiq-rim/1 document with made-up values, and an envelope signed by a
// fresh P-256 key.
//
//   node wasm/test/l3.test.mjs      (needs openssl on PATH)

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, generateKeyPairSync, randomBytes, sign } from 'node:crypto';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const R = createRequire(import.meta.url)(join(repo, 'docs/assets/l3/rim-sig.js'));
const w = (await WebAssembly.instantiate(readFileSync(join(repo, 'docs/assets/l3/erc_level3.wasm')))).instance.exports;

let failed = 0;
const expect = (name, got, want) => {
  const ok = got === want;
  if (!ok) failed++;
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : `: got ${got}, want ${want}`));
};

// ---- a CA chain shaped like RELEASE_INTEGRITY.md 5.5 ----
const d = mkdtempSync(join(tmpdir(), 'erc-l3-'));
const ossl = (...a) => execFileSync('openssl', a, { cwd: d, stdio: ['ignore', 'ignore', 'pipe'] });
const ext = (name, body) => { writeFileSync(join(d, name), body); return name; };
const RIM_OID = '2.25.209288284150790823604684143005475146259';
ossl('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'root.key', '-out', 'root.pem', '-subj', '/CN=Test Root', '-days', '30',
  '-addext', 'basicConstraints=critical,CA:TRUE', '-addext', 'keyUsage=critical,keyCertSign');
ossl('req', '-new', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'ca.key', '-out', 'ca.csr', '-subj', '/CN=Test Signing CA');
ossl('x509', '-req', '-in', 'ca.csr', '-CA', 'root.pem', '-CAkey', 'root.key', '-CAcreateserial', '-out', 'ca.pem', '-days', '30',
  '-extfile', ext('ca.ext', 'basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=critical,keyCertSign\n'));
for (const [name, eku] of [['rim', RIM_OID], ['other', 'codeSigning']]) {
  ossl('req', '-new', '-newkey', 'rsa:2048', '-nodes', '-keyout', `${name}.key`, '-out', `${name}.csr`, '-subj', `/CN=Test ${name} signer`);
  ossl('x509', '-req', '-in', `${name}.csr`, '-CA', 'ca.pem', '-CAkey', 'ca.key', '-CAcreateserial', '-out', `${name}.pem`, '-days', '30',
    '-extfile', ext(`${name}.ext`, `basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=critical,${eku}\n`));
}
ossl('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'x.key', '-out', 'unrelated.pem', '-subj', '/CN=Unrelated Root', '-days', '30',
  '-addext', 'basicConstraints=critical,CA:TRUE');

// ---- a tactiq-rim/1 document with two slots ----
const h = () => randomBytes(32).toString('hex');
const [p0, p1a, p1b] = [h(), h(), h()];
const rimText = JSON.stringify({ format: 'tactiq-rim/1', pcr: { bank: 'sha256', selection: [0, 1], values: { 0: [p0], 1: { A: p1a, B: p1b } } } });
writeFileSync(join(d, 'rim.json'), rimText);
const cms = (signer, out, extra = []) => ossl('cms', '-sign', '-binary', '-noattr', '-md', 'sha256', '-in', 'rim.json',
  '-signer', `${signer}.pem`, '-inkey', `${signer}.key`, '-certfile', 'ca.pem', '-outform', 'DER', '-out', out, ...extra);
cms('rim', 'rim.p7s');
cms('other', 'rim.other.p7s');
ossl('cms', '-sign', '-binary', '-md', 'sha256', '-in', 'rim.json', '-signer', 'rim.pem', '-inkey', 'rim.key',
  '-certfile', 'ca.pem', '-outform', 'DER', '-out', 'rim.attrs.p7s');

const rim = new Uint8Array(readFileSync(join(d, 'rim.json')));
const file = (n) => new Uint8Array(readFileSync(join(d, n)));
const pem = (n) => readFileSync(join(d, n), 'utf8');
const rimRes = (p7s, root, data = rim) => R.verify(data, file(p7s), pem(root)).then(() => 'OK', (e) => e.step);

expect('RIM signed for the purpose, pinned root', await rimRes('rim.p7s', 'root.pem'), 'OK');
const flipped = rim.slice(); flipped[5] ^= 1;
expect('RIM changed after signing', await rimRes('rim.p7s', 'root.pem', flipped), 'rim');
expect('RIM, unrelated root pinned', await rimRes('rim.p7s', 'unrelated.pem'), 'chain');
expect('RIM signed by a leaf without the RIM purpose', await rimRes('rim.other.p7s', 'root.pem'), 'signer');
expect('RIM with signed attributes', await rimRes('rim.attrs.p7s', 'root.pem'), 'container');

// ---- envelopes: device_id(16) || counter_be(8) || selection(5) || pcr_hash(32) || evidence_hash(32) ----
const sha = (...b) => createHash('sha256').update(Buffer.concat(b)).digest();
const env = (composite, counter = 7n, evidence = Buffer.alloc(0)) => {
  const c = Buffer.alloc(8); c.writeBigUInt64BE(counter);
  return Buffer.concat([Buffer.from('TEST-DEVICE-0001'), c, Buffer.from('000b030000', 'hex'), composite, sha(evidence)]);
};
const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const spki = publicKey.export({ type: 'spki', format: 'der' });
const other = generateKeyPairSync('ec', { namedCurve: 'P-256' }).publicKey.export({ type: 'spki', format: 'der' });
const put = (b) => { const p = w.erc_alloc(b.length); new Uint8Array(w.memory.buffer, p, b.length).set(b); return [p, b.length]; };
const check = (msg, sig, ev, key, r = rim) => w.erc_check(...[msg, sig, ev, key, r].flatMap(put));
const b = (hex) => Buffer.from(hex, 'hex');

const slotA = env(sha(b(p0), b(p1a))), slotB = env(sha(b(p0), b(p1b)));
expect('envelope, slot A state', check(slotA, sign('sha256', slotA, privateKey), Buffer.alloc(0), spki), 0);
expect('envelope, slot B state', check(slotB, sign('sha256', slotB, privateKey), Buffer.alloc(0), spki), 0);
const unknown = env(sha(b(h()), b(p1a)));
expect('envelope, state not in the reference set', check(unknown, sign('sha256', unknown, privateKey), Buffer.alloc(0), spki), 5);
expect('envelope, verified with another key', check(slotA, sign('sha256', slotA, privateKey), Buffer.alloc(0), other), 1);
const moved = Buffer.from(slotA); moved[23] ^= 1;
expect('envelope, counter changed after signing', check(moved, sign('sha256', slotA, privateKey), Buffer.alloc(0), spki), 1);
expect('envelope, evidence not the signed one', check(slotA, sign('sha256', slotA, privateKey), Buffer.from([1]), spki), 4);
expect('envelope, key not a public key', check(slotA, sign('sha256', slotA, privateKey), Buffer.alloc(0), Buffer.from([1, 2, 3])), 100);
expect('reference set not tactiq-rim/1', check(slotA, sign('sha256', slotA, privateKey), Buffer.alloc(0), spki, Buffer.from('{}')), 102);

console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
