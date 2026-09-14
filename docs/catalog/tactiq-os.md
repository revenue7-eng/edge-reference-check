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
last_checked: 2026-09-14
---

# TactiQ OS

Pairs covered by this page: TactiQ OS on Radxa ROCK 5A (RK3588S).

This is the system maintained by this project. It appears here on the same
terms as any other, is described in the same words, and is not marked up for
being ours. Two of the sections below record defects found while running this
catalog's own procedure against our own release.

Verdicts were established against release `v2.1.0-rc10`. The page was keyed to
`v2.1.0-rc7` until 2026-09-14, and moving it forward changed two things a
reader has to know: one of the two recorded defects is gone in the newer
release, and the other stands. Published artefacts are never replaced after the
fact, so the `v2.1.0-rc7` assets still behave as the earlier version of this
page described.

## How to find the release at all

`/releases/latest` does not resolve to a release. Every release of this system
is marked as a pre-release, so the conventional entry point redirects to the
list and a reader following it gets nothing.

```sh
curl -sI https://github.com/revenue7-eng/tactiq-os/releases/latest | grep -i ^location
```

Our output, 2026-09-14:

```
location: https://github.com/revenue7-eng/tactiq-os/releases
```

The redirect goes to `/releases`, not to a tag. Tags have to be read from the
list instead, and the most recent is `v2.1.0-rc10`. This is a defect in how
this system publishes, recorded here rather than quietly worked around.

The publisher's README states that `latest` is not used while every release is
a candidate, that verification addresses a named tag, and that the rule is
lifted at general availability. That documents the behaviour; it does not
change it. A reader arriving at an empty `latest` can now find out why from the
publisher rather than from us. The empty redirect itself stands until a release
that is not a candidate is published, and it has now been observed against two
tags.

## Integrity

`published`, established 2026-09-13, re-established against `v2.1.0-rc10` on
2026-09-14. The release carries `SHA256SUMS` covering thirteen artefacts,
including the image, the kernel, the device tree, the SBOM, the CVE reports, an
OTA bundle and a verity reference.

```sh
curl -sL https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc10/SHA256SUMS | wc -l
curl -sL https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc10/SHA256SUMS | sha256sum
```

Our output, 2026-09-14:

```
13
9cd9a403f6508336a53e310f5ac62b970e98c52382cbcc6aca24d14f7612322b
```

The checksum file does not list itself, its signature or its certificate, which
is correct: those are verified by the signature, not by the list.

Two artefacts are new against `v2.1.0-rc7`, which carried eleven. One of them,
`verity-rock5a.params`, is an assertion about the bytes of the root filesystem
that goes further than a file digest: it carries the root hash of a dm-verity
tree over the image, which lets a consumer check blocks rather than the whole
file. This catalog holds no reference values of its own, so the file is named
and located here, not copied.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc10
curl -sL $B/verity-rock5a.params | sha256sum
grep verity-rock5a.params SHA256SUMS
```

Our output, 2026-09-14: the digest matches the line in `SHA256SUMS`.

```
d5c54a26431fe3f89b3fb0f0d5befc7574004ca364806b46007a4d099f84c395
```

One detail a reader comparing this file will need: it does not end with a
newline. A copy that acquires one hashes differently and looks like a mismatch
when nothing is wrong.

What this file is not is covered under Expected measurements below.

## Signature

`published`, established 2026-09-13, re-established against `v2.1.0-rc10` on
2026-09-14. `SHA256SUMS` is signed with a keyless Sigstore certificate issued
to the release workflow, and the signature verifies with nothing but `openssl`.

The defect recorded here against `v2.1.0-rc7` is fixed. The certificate was
published base64-encoded rather than as a PEM file, so a reader passing it
straight to a verification tool got a parse error and could conclude the
signature was broken. From `v2.1.0-rc10` the certificate is served as PEM and
needs no decode step.

The signature is a separate asset and is still base64-encoded. The two assets
of the same signing event therefore need different handling, which is easy to
get wrong in either direction: a reader who carries the old command forward
decodes a file that is already PEM, and a reader who assumes the fix covers
both feeds base64 to `openssl` as a DER signature. The commands below decode
one and not the other.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc10
curl -sL $B/SHA256SUMS -o SHA256SUMS
curl -sL $B/SHA256SUMS.workflow.pem -o cert.pem
curl -sL $B/SHA256SUMS.workflow.sig | base64 -d > sig.der
openssl x509 -in cert.pem -noout -ext subjectAltName | tail -1
openssl x509 -in cert.pem -noout -issuer
openssl x509 -in cert.pem -noout -dates
openssl x509 -in cert.pem -pubkey -noout > pub.pem
openssl dgst -sha256 -verify pub.pem -signature sig.der SHA256SUMS
```

Our output, 2026-09-14:

```
URI:https://github.com/revenue7-eng/tactiq-os/.github/workflows/release-sign.yml@refs/tags/v2.1.0-rc10
issuer=O = sigstore.dev, CN = sigstore-intermediate
notBefore=Sep 14 14:10:35 2026 GMT
notAfter=Sep 14 14:20:35 2026 GMT
Verified OK
```

The certificate is valid for ten minutes. That is the point of keyless signing:
there is no long-lived private key to steal, and the evidence that the
signature was made inside that window lives in the transparency log rather than
in the certificate.

The identity in the certificate is the release workflow at the tag, not a
person. A reader checking this system should pin that identity: a signature
made by any other workflow, or from a branch instead of a tag, is a different
claim even though it verifies. The identity moves with the tag, so the URI
above names `v2.1.0-rc10` and a check against another release will name that
release instead.

## SBOM

`published`, established 2026-09-13, re-established against `v2.1.0-rc10` on
2026-09-14. `sbom-rock5a.spdx.json` is released alongside the image and is
covered by `SHA256SUMS`, so it is inside the signed set rather than sitting
next to it.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc10
curl -sL $B/sbom-rock5a.spdx.json -o sbom.json
sha256sum sbom.json
grep sbom-rock5a.spdx.json SHA256SUMS
python3 -c 'import json,collections,os; g=json.load(open("sbom.json"))["@graph"]; c=collections.Counter(n.get("type") for n in g); print(os.path.getsize("sbom.json"), "bytes"); print(len(g), "nodes"); [print(" ", k, v) for k,v in c.most_common(5)]'
```

Our output, 2026-09-14: the digest matches the line in `SHA256SUMS`, and the
document is SPDX 3.0.1 JSON-LD.

```
a10bba599dd6ec90d7ae321d29e914759f0383bbdb9b98276ef3756a9ab527ff
49103293 bytes
77929 nodes
  software_File 38830
  Relationship 36359
  LifecycleScopedRelationship 1371
  software_Package 695
  build_Build 200
```

## Transparency log

`published`, established 2026-09-13, re-established against `v2.1.0-rc10` on
2026-09-14. The signing event is recorded in the public Rekor log and can be
looked up from the digest alone, without the release page and without this
project.

```sh
H=$(curl -sL https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc10/SHA256SUMS | sha256sum | cut -d' ' -f1)
curl -s -X POST -H 'Content-Type: application/json' -d "{\"hash\":\"sha256:$H\"}" https://rekor.sigstore.dev/api/v1/index/retrieve
```

Our output, 2026-09-14: one entry, UUID
`108e9186e8c5677aef90f54751f167a02861783416f9e57ea7d42454a0b35fdb451b8f59878ee581`.
Fetching that entry gives log index `2831682380`, integrated 2026-09-14
14:10:35 UTC, over the same digest as above.

The integration time falls at the start of the ten-minute certificate window,
which is what ties the two together.

## Expected measurements

`not yet`, established 2026-09-11, not re-examined on hardware since. The
measured boot chain is not closed on this platform: on that date there was no
device-mapper target in the boot chain, so there are no boot measurements to
issue a reference for. The envelope producer is public and alpha.

From 2026-09-14 the publisher releases `verity-rock5a.params`, recorded under
Integrity above. That does not move this verdict, and the distinction is the
whole point of the column. A verity root hash is a property of an artefact: it
says what the published root filesystem contains, and any reader with the same
file can recompute it. Expected measurements are a property of a device: the
values a machine of this platform should produce as it boots, which is what a
reader needs in order to compare a running system against its publisher. The
first is now issued. The second is not, and cannot be until the platform
produces boot measurements at all.

Source: <https://github.com/revenue7-eng/tactiq-attest>

## Independent rebuild

`not examined`. This is the next item for this page, and the only one of the
six that no publisher in this catalog has closed.

## Check history

| Date | What was checked | Result |
| --- | --- | --- |
| 2026-09-11 | Expected measurements | `not yet`, boot chain not closed on this platform |
| 2026-09-13 | Integrity, signature, SBOM, transparency log, against `v2.1.0-rc7` | All four `published`. Two defects recorded: no release is marked latest, and the certificate is published base64-encoded rather than as PEM |
| 2026-09-14 | Both defects, in the publisher's tree | Both addressed in source. The certificate is normalised to PEM from the next tag onwards; the empty `latest` is declared in the publisher's README instead of being undocumented |
| 2026-09-14 | Integrity, signature, SBOM, transparency log, re-run against `v2.1.0-rc10`, and the page re-keyed to that tag | All four `published`, verdicts unchanged. The certificate defect is confirmed gone: the asset is served as PEM and the decode step is dropped from the commands. The signature asset is still base64, so the two now need different handling and the commands say so. `latest` still redirects to the release list, observed against a second tag. Thirteen artefacts against eleven in `v2.1.0-rc7`, the new ones being an OTA bundle and a verity reference |
| 2026-09-14 | Expected measurements, against the release only | `not yet` holds. The publisher now issues a verity root hash for the artefact, which is not a boot measurement for the platform. The hardware state behind the 2026-09-11 verdict was not re-examined |
