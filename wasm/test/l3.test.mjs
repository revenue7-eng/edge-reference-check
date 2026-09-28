// Level 3 of check.html, both halves, against synthetic material made here.
//
// No publisher's reference set, envelope or key is stored in this repository
// (methodology: the catalog holds no reference values of its own). Everything
// below is generated on each run: a three-level CA with the RIM signing purpose,
// a tactiq-rim/1 document with made-up values, and an envelope v2 quoted under a
// fresh P-256 attestation key.
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

// ---- envelope v2 (DDR-004): the canonical message, a TPMS_ATTEST quote over it, and
// the AK's TPM2B_PUBLIC. Both TPM structures are built here byte by byte, so no
// publisher's key or quote is stored.
//   message: device_id(16) || counter_be(8) || selection(5) || pcr_hash(32) || evidence_hash(32)
const sha = (...b) => createHash('sha256').update(Buffer.concat(b)).digest();
const SEL = Buffer.from('000b030000', 'hex');
const env = (composite, counter = 7n, evidence = Buffer.alloc(0)) => {
  const c = Buffer.alloc(8); c.writeBigUInt64BE(counter);
  return Buffer.concat([Buffer.from('TEST-DEVICE-0001'), c, SEL, composite, sha(evidence)]);
};
const u16 = (n) => { const x = Buffer.alloc(2); x.writeUInt16BE(n); return x; };
const u32 = (n) => { const x = Buffer.alloc(4); x.writeUInt32BE(n); return x; };
const u64 = (n) => { const x = Buffer.alloc(8); x.writeBigUInt64BE(n); return x; };
const t2b = (b) => Buffer.concat([u16(b.length), b]);
// TPMA_OBJECT: fixedTPM, fixedParent, sensitiveDataOrigin, userWithAuth, restricted, sign
const AK_ATTRS = 0x00050072;
const tpmPublic = (pub, attrs = AK_ATTRS) => {
  const j = pub.export({ format: 'jwk' });
  const tpmt = Buffer.concat([u16(0x0023), u16(0x000b), u32(attrs), t2b(Buffer.alloc(0)), u16(0x0010),
    u16(0x0018), u16(0x000b), u16(0x0003), u16(0x0010),
    t2b(Buffer.from(j.x, 'base64url')), t2b(Buffer.from(j.y, 'base64url'))]);
  return { tpm2b: t2b(tpmt), name: Buffer.concat([u16(0x000b), sha(tpmt)]) };
};
const quote = (msg, digest = msg.subarray(29, 61), bits = SEL.subarray(2)) => Buffer.concat([
  u32(0xff544347), u16(0x8018), t2b(Buffer.concat([u16(0x000b), Buffer.alloc(32, 0xaa)])), t2b(sha(msg)),
  u64(1000n), u32(3), u32(1), Buffer.from([1]), u64(0x20191023n),
  u32(1), u16(0x000b), Buffer.from([bits.length]), bits, t2b(digest)]);

const ak = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const akPub = tpmPublic(ak.publicKey);
const otherPub = tpmPublic(generateKeyPairSync('ec', { namedCurve: 'P-256' }).publicKey);
const put = (b) => { const p = w.erc_alloc(b.length); new Uint8Array(w.memory.buffer, p, b.length).set(b); return [p, b.length]; };
const check = (msg, att, sig, ev, key, r = rim) => w.erc_check_v2(...[msg, att, sig, ev, key, r].flatMap(put));
const name = () => Buffer.from(new Uint8Array(w.memory.buffer, w.erc_name_ptr(), w.erc_name_len())).toString('hex');
const q = (msg, ...a) => { const att = quote(msg, ...a); return [att, sign('sha256', att, ak.privateKey)]; };
const b = (hex) => Buffer.from(hex, 'hex');
const none = Buffer.alloc(0);

const slotA = env(sha(b(p0), b(p1a))), slotB = env(sha(b(p0), b(p1b)));
expect('envelope, slot A state', check(slotA, ...q(slotA), none, akPub.tpm2b), 0);
expect('the TPM name of the AK is reported', name(), akPub.name.toString('hex'));
expect('envelope, slot B state', check(slotB, ...q(slotB), none, akPub.tpm2b), 0);
const unknown = env(sha(b(h()), b(p1a)));
expect('envelope, state not in the reference set', check(unknown, ...q(unknown), none, akPub.tpm2b), 5);
expect('quote, verified with another AK', check(slotA, ...q(slotA), none, otherPub.tpm2b), 1);
const [attA, sigA] = q(slotA);
const flippedAtt = Buffer.from(attA); flippedAtt[attA.length - 1] ^= 1;
expect('quote, changed after signing', check(slotA, flippedAtt, sigA, none, akPub.tpm2b), 1);
const moved = Buffer.from(slotA); moved[23] ^= 1;
expect('envelope, counter changed after quoting', check(moved, attA, sigA, none, akPub.tpm2b), 9);
expect('quote, pcrDigest differs from the envelope', check(slotA, ...q(slotA, sha(b(h()))), none, akPub.tpm2b), 9);
expect('quote, PCR selection differs from the envelope', check(slotA, ...q(slotA, undefined, b('070000')), none, akPub.tpm2b), 9);
expect('envelope, evidence not the signed one', check(slotA, ...q(slotA), Buffer.from([1]), akPub.tpm2b), 4);
expect('v1 envelope: signed message, no quote', check(slotA, none, sign('sha256', slotA, ak.privateKey), none, akPub.tpm2b), 3);
expect('key not restricted', check(slotA, ...q(slotA), none, tpmPublic(ak.publicKey, AK_ATTRS & ~0x00010000).tpm2b), 103);
expect('key is a SubjectPublicKeyInfo, not a TPM2B_PUBLIC', check(slotA, ...q(slotA), none, ak.publicKey.export({ type: 'spki', format: 'der' })), 103);
expect('no AK name after a refused key', name(), '');
expect('reference set not tactiq-rim/1', check(slotA, ...q(slotA), none, akPub.tpm2b, Buffer.from('{}')), 102);

console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
