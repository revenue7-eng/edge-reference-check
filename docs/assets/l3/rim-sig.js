/* Level 3, part one: the RIM signature (tactiq-rim/1, RELEASE_INTEGRITY.md 5.5).
 *
 * CMS SignedData, detached, DER, SHA-256, no signed attributes: the signature
 * is over the RIM bytes themselves. The container carries the signer and the
 * intermediate CA; the reader supplies the root. Verification uses WebCrypto
 * only (RSASSA-PKCS1-v1_5 with SHA-256), so nothing leaves the tab.
 *
 * Every refusal names the step that failed. An algorithm this code does not
 * implement is reported as unsupported, not as a bad signature. */
(function (root) {
  'use strict';

  var OID = {
    signedData: '1.2.840.113549.1.7.2',
    data: '1.2.840.113549.1.7.1',
    sha256: '2.16.840.1.101.3.4.2.1',
    rsaEncryption: '1.2.840.113549.1.1.1',
    sha256WithRSA: '1.2.840.113549.1.1.11',
    basicConstraints: '2.5.29.19',
    extKeyUsage: '2.5.29.37',
    rimSigner: '2.25.209288284150790823604684143005475146259'
  };

  function Fail(step, detail, unsupported) {
    this.step = step; this.detail = detail; this.unsupported = !!unsupported;
  }

  // ---- DER reader: definite lengths only, as DER requires ----
  function read(buf, off) {
    if (off + 2 > buf.length) throw new Fail('der', 'truncated at ' + off);
    var tag = buf[off], p = off + 1, len = buf[p++];
    if (len & 0x80) {
      var n = len & 0x7f;
      if (n === 0 || n > 4) throw new Fail('der', 'unsupported length form at ' + off);
      len = 0;
      for (var i = 0; i < n; i++) len = len * 256 + buf[p++];
    }
    if (p + len > buf.length) throw new Fail('der', 'element overruns input at ' + off);
    return { tag: tag, start: off, hdr: p - off, len: len, body: p, end: p + len };
  }
  function children(buf, el) {
    var out = [], p = el.body;
    while (p < el.end) { var c = read(buf, p); out.push(c); p = c.end; }
    return out;
  }
  function raw(buf, el) { return buf.subarray(el.start, el.end); }
  function body(buf, el) { return buf.subarray(el.body, el.end); }
  function oid(buf, el) {
    if (el.tag !== 0x06) throw new Fail('der', 'expected OID');
    var b = body(buf, el), out = [Math.floor(b[0] / 40), b[0] % 40], v = 0;
    for (var i = 1; i < b.length; i++) {
      v = v * 128 + (b[i] & 0x7f);
      if (!(b[i] & 0x80)) { out.push(v); v = 0; }
    }
    return out.join('.');
  }
  // 2.25.<uuid> arcs exceed 2^53; decode arcs as BigInt when needed.
  function oidBig(buf, el) {
    var b = body(buf, el), out = [String(Math.floor(b[0] / 40)), String(b[0] % 40)], v = 0n;
    for (var i = 1; i < b.length; i++) {
      v = v * 128n + BigInt(b[i] & 0x7f);
      if (!(b[i] & 0x80)) { out.push(v.toString()); v = 0n; }
    }
    return out.join('.');
  }
  function eq(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  function hex(b) { return Array.prototype.map.call(b, function (x) { return (x < 16 ? '0' : '') + x.toString(16); }).join(''); }

  // ---- X.509 ----
  function parseCert(buf, el) {
    var top = children(buf, el);                       // tbs, sigAlg, sigValue
    var tbs = top[0], f = children(buf, tbs), i = 0;
    if (f[0].tag === 0xa0) i++;                        // [0] version
    var c = {
      der: raw(buf, el),
      tbs: raw(buf, tbs),
      serial: body(buf, f[i]),
      issuer: raw(buf, f[i + 2]),
      notBefore: null, notAfter: null,
      subject: raw(buf, f[i + 4]),
      spki: raw(buf, f[i + 5]),
      sigAlg: oid(buf, children(buf, top[1])[0]),
      sig: body(buf, top[2]).subarray(1),            // BIT STRING, drop unused-bits byte
      ext: {}
    };
    var val = children(buf, f[i + 3]);
    c.notBefore = timeOf(buf, val[0]); c.notAfter = timeOf(buf, val[1]);
    for (var j = i + 6; j < f.length; j++) {
      if (f[j].tag !== 0xa3) continue;
      children(buf, children(buf, f[j])[0]).forEach(function (e) {
        var p = children(buf, e), crit = p.length === 3 && p[1].tag === 0x01 && buf[p[1].body] !== 0;
        c.ext[oid(buf, p[0])] = { critical: crit, value: body(buf, p[p.length - 1]) };
      });
    }
    return c;
  }
  function timeOf(buf, el) {
    var s = String.fromCharCode.apply(null, body(buf, el));
    if (el.tag === 0x17) s = (Number(s.slice(0, 2)) < 50 ? '20' : '19') + s;   // UTCTime
    return new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12), +s.slice(12, 14)));
  }
  function isCA(c) {
    var e = c.ext[OID.basicConstraints];
    if (!e) return false;
    var seq = read(e.value, 0), k = children(e.value, seq);
    return k.length > 0 && k[0].tag === 0x01 && e.value[k[0].body] !== 0;
  }
  function ekus(c) {
    var e = c.ext[OID.extKeyUsage];
    if (!e) return null;
    return { critical: e.critical, list: children(e.value, read(e.value, 0)).map(function (x) { return oidBig(e.value, x); }) };
  }

  function pemToDer(text) {
    var m = /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/.exec(text);
    if (!m) throw new Fail('root', 'no PEM certificate found');
    var bin = atob(m[1].replace(/\s+/g, '')), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  var subtle = (root.crypto || globalThis.crypto).subtle;
  function rsaVerify(spki, sig, data, step) {
    return subtle.importKey('spki', spki, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
      .catch(function (e) { throw new Fail(step, 'key is not an RSA key this page can use: ' + e.message, true); })
      .then(function (k) { return subtle.verify('RSASSA-PKCS1-v1_5', k, sig, data); })
      .then(function (ok) { if (!ok) throw new Fail(step, 'signature does not verify'); });
  }
  function certSignedBy(child, parent, step) {
    if (child.sigAlg !== OID.sha256WithRSA) return Promise.reject(new Fail(step, 'certificate signature algorithm ' + child.sigAlg, true));
    if (!eq(child.issuer, parent.subject)) return Promise.reject(new Fail(step, 'issuer does not name the parent'));
    return rsaVerify(parent.spki, child.sig, child.tbs, step);
  }

  /* verify(rimBytes, p7sBytes, rootPemText, now) -> Promise<report>
   * Resolves with a report when every step holds; rejects with Fail otherwise. */
  function verify(rim, p7s, rootPem, now) {
    return Promise.resolve().then(function () {
      var ci = read(p7s, 0), cik = children(p7s, ci);
      if (oid(p7s, cik[0]) !== OID.signedData) throw new Fail('container', 'not CMS SignedData');
      var sd = children(p7s, children(p7s, cik[1])[0]), k = 1;
      var digestAlgs = children(p7s, sd[k++]).map(function (a) { return oid(p7s, children(p7s, a)[0]); });
      var encap = children(p7s, sd[k++]);
      if (oid(p7s, encap[0]) !== OID.data) throw new Fail('container', 'content type is not data');
      if (encap.length > 1) throw new Fail('container', 'content is embedded; this format is detached');
      var certs = [];
      if (sd[k] && sd[k].tag === 0xa0) { certs = children(p7s, sd[k]).map(function (e) { return parseCert(p7s, e); }); k++; }
      if (sd[k] && sd[k].tag === 0xa1) k++;           // CRLs, unused
      var signers = children(p7s, sd[k]);
      if (signers.length !== 1) throw new Fail('container', signers.length + ' signers, expected 1');
      var si = children(p7s, signers[0]), s = 1;
      var sid = si[s++];
      if (sid.tag !== 0x30) throw new Fail('container', 'signer identified by key identifier; expected issuer and serial', true);
      var sidk = children(p7s, sid), sidIssuer = raw(p7s, sidk[0]), sidSerial = body(p7s, sidk[1]);
      var dAlg = oid(p7s, children(p7s, si[s++])[0]);
      if (si[s].tag === 0xa0) throw new Fail('container', 'signed attributes present; this format signs the content directly');
      var sAlg = oid(p7s, children(p7s, si[s++])[0]);
      var sig = body(p7s, si[s]);
      if (dAlg !== OID.sha256 || digestAlgs.indexOf(OID.sha256) < 0) throw new Fail('container', 'digest ' + dAlg, true);
      if (sAlg !== OID.rsaEncryption && sAlg !== OID.sha256WithRSA) throw new Fail('container', 'signature algorithm ' + sAlg, true);

      var signer = certs.filter(function (c) { return eq(c.issuer, sidIssuer) && eq(c.serial, sidSerial); })[0];
      if (!signer) throw new Fail('signer', 'signer certificate not in the container');
      var e = ekus(signer);
      if (!e || !e.critical || e.list.length !== 1 || e.list[0] !== OID.rimSigner)
        throw new Fail('signer', 'extended key usage is not exactly the RIM purpose, critical');
      var ca = certs.filter(function (c) { return c !== signer && eq(c.subject, signer.issuer); })[0];
      if (!ca) throw new Fail('chain', 'issuing CA not in the container');
      if (!isCA(ca)) throw new Fail('chain', 'issuing certificate is not a CA');
      var rootCert = parseCert(pemToDer(rootPem), read(pemToDer(rootPem), 0));
      if (!isCA(rootCert)) throw new Fail('root', 'the pinned certificate is not a CA');

      var t = now || new Date();
      var validity = [signer, ca, rootCert].map(function (c) {
        return { notBefore: c.notBefore, notAfter: c.notAfter, current: t >= c.notBefore && t <= c.notAfter };
      });
      return certSignedBy(ca, rootCert, 'chain')
        .then(function () { return certSignedBy(signer, ca, 'signer'); })
        .then(function () { return rsaVerify(signer.spki, sig, rim, 'rim'); })
        .then(function () { return subtle.digest('SHA-256', rootCert.spki); })
        .then(function (fp) {
          return { rootSpkiSha256: hex(new Uint8Array(fp)), validity: validity };
        });
    });
  }

  var api = { verify: verify, Fail: Fail };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ERCRimSig = api;
})(typeof self !== 'undefined' ? self : this);
