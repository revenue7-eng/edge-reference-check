---
title: TactiQ OS
layout: default
parent: Catalog
nav_order: 1
platforms: Radxa ROCK 5A (RK3588S)
l1: not yet
l2_identity: published
l2_measurements: not yet
l3: not yet
last_checked: 2026-09-13
---

# TactiQ OS

Pairs covered by this page: TactiQ OS on Radxa ROCK 5A (RK3588S).

This is the system maintained by this project. It appears here on the same
terms as any other, is described in the same words, and is not marked up for
being ours. Two of the sections below record defects found while running this
catalog's own procedure against our own release.

Verdicts were established against release `v2.1.0-rc7`.

## How to find the release at all

`/releases/latest` does not resolve to a release. Every release of this system
is marked as a pre-release, so the conventional entry point redirects to the
list and a reader following it gets nothing.

```sh
curl -sI https://github.com/revenue7-eng/tactiq-os/releases/latest | grep -i ^location
```

Our output, 2026-09-13: the redirect goes to `/releases`, not to a tag. Tags
have to be read from the list instead, and the most recent is `v2.1.0-rc7`.
This is a defect in how this system publishes, recorded here rather than
quietly worked around.

## Integrity

`published`, established 2026-09-13. The release carries `SHA256SUMS` covering
eleven artefacts, including the image, the kernel, the device tree, the SBOM
and the CVE reports.

```sh
curl -sL https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc7/SHA256SUMS | wc -l
curl -sL https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc7/SHA256SUMS | sha256sum
```

Our output, 2026-09-13:

```
11
c233ee011cb5c8027eccf674173a38bc45e27c9dea6e5dc11b7c3ccc4735f2b4
```

The checksum file does not list itself, its signature or its certificate, which
is correct: those are verified by the signature, not by the list.

## Signature

`published`, established 2026-09-13. `SHA256SUMS` is signed with a keyless
Sigstore certificate issued to the release workflow, and the signature
verifies with nothing but `openssl`.

One defect: `SHA256SUMS.workflow.pem` is published base64-encoded rather than
as a PEM file. A reader who passes it straight to a verification tool, as most
published examples show, gets a parse error and may conclude the signature is
broken. It is not; the file needs one decode step first. The commands below
include it.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc7
curl -sL $B/SHA256SUMS -o SHA256SUMS
curl -sL $B/SHA256SUMS.workflow.pem | base64 -d > cert.pem
curl -sL $B/SHA256SUMS.workflow.sig | base64 -d > sig.der
openssl x509 -in cert.pem -noout -ext subjectAltName | tail -1
openssl x509 -in cert.pem -noout -issuer
openssl x509 -in cert.pem -pubkey -noout > pub.pem
openssl dgst -sha256 -verify pub.pem -signature sig.der SHA256SUMS
```

Our output, 2026-09-13:

```
URI:https://github.com/revenue7-eng/tactiq-os/.github/workflows/release-sign.yml@refs/tags/v2.1.0-rc7
issuer=O = sigstore.dev, CN = sigstore-intermediate
Verified OK
```

The certificate is valid for ten minutes (notBefore 2026-08-08 07:49:52 UTC,
notAfter 07:59:52 UTC). That is the point of keyless signing: there is no
long-lived private key to steal, and the evidence that the signature was made
inside that window lives in the transparency log rather than in the
certificate.

The identity in the certificate is the release workflow at the tag, not a
person. A reader checking this system should pin that identity: a signature
made by any other workflow, or from a branch instead of a tag, is a different
claim even though it verifies.

## SBOM

`published`, established 2026-09-13. `sbom-rock5a.spdx.json` is released
alongside the image and is covered by `SHA256SUMS`, so it is inside the signed
set rather than sitting next to it.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc7
curl -sL $B/sbom-rock5a.spdx.json -o sbom.json
sha256sum sbom.json
grep sbom-rock5a.spdx.json SHA256SUMS
python3 -c 'import json,collections; g=json.load(open("sbom.json"))["@graph"]; c=collections.Counter(n.get("type") for n in g); print(len(g), "nodes"); [print(" ", k, v) for k,v in c.most_common(5)]'
```

Our output, 2026-09-13: the digest matches the line in `SHA256SUMS`, and the
document is SPDX 3.0.1 JSON-LD, 48,997,385 bytes.

```
2b0e67de2d08fe7c366b9b665aa3168496f10aaaefb7dc66f60edea397e514a3
77970 nodes
  software_File 38952
  Relationship 36539
  LifecycleScopedRelationship 1254
  software_Package 615
  build_Build 177
```

## Transparency log

`published`, established 2026-09-13. The signing event is recorded in the
public Rekor log and can be looked up from the digest alone, without the
release page and without this project.

```sh
H=$(curl -sL https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc7/SHA256SUMS | sha256sum | cut -d' ' -f1)
curl -s -X POST -H 'Content-Type: application/json' -d "{\"hash\":\"sha256:$H\"}" https://rekor.sigstore.dev/api/v1/index/retrieve
```

Our output, 2026-09-13: one entry, UUID
`108e9186e8c5677a3f9e6039528b348b30ff71c5ddd9f7f0b49404a1912fa6646922b7ac45f5ea80`.
Fetching that entry gives log index `2380986847`, integrated 2026-08-08
07:49:53 UTC, kind `hashedrekord` 0.0.1, over the same digest as above.

The integration time falls inside the ten-minute certificate window, which is
what ties the two together.

## Expected measurements

`not yet`, established 2026-09-11, not re-examined since. The measured boot
chain is not closed on this platform: on that date there was no device-mapper
target in the boot chain, so there are no measurements to issue a reference
for. The envelope producer is public and alpha.

Source: <https://github.com/revenue7-eng/tactiq-attest>

## Independent rebuild

`not examined`. This is the next item for this page, and the only one of the
six that no publisher in this catalog has closed.

## Check history

| Date | What was checked | Result |
| --- | --- | --- |
| 2026-09-11 | Expected measurements | `not yet`, boot chain not closed on this platform |
| 2026-09-13 | Integrity, signature, SBOM, transparency log, against `v2.1.0-rc7` | All four `published`. Two defects recorded: no release is marked latest, and the certificate is published base64-encoded rather than as PEM |
