---
title: Talos Linux
layout: default
parent: Catalog
nav_order: 2
platforms: bare metal (amd64, arm64)
l1: not yet
l2_identity: published
l2_measurements: none to publish
l3: none to publish
last_checked: 2026-09-13
---

# Talos Linux

Pairs covered by this page: Talos Linux on bare metal, amd64 and arm64. The
two architectures share every verdict below, so they share a page.

Verdicts below were established against release `v1.14.0`. Each section carries
the command that reproduces it and the output we got. Run the command yourself:
if your output differs from ours, the publisher changed something after our
date, and that is exactly what these blocks exist to make visible.

None of the commands use `api.github.com`. The anonymous API limit is 60
requests per hour per address, and a reader who hits it gets an empty answer
that reads like absence.

## Integrity

`published`, established 2026-09-13. The release carries `sha256sum.txt`
covering the bare-metal artefacts, and `sha512sum.txt` alongside it.

```sh
curl -sL https://github.com/siderolabs/talos/releases/download/v1.14.0/sha256sum.txt | head -5
```

Our output, 2026-09-13 (26 lines in total):

```
2e2658e6cfb1eb5c642b3753062040dbec168dad2728ea9665c90fed0655cca6  initramfs-amd64.xz
e47bc13e2dda3af341019ae2bdb75f13f6812b07d1fa91ac94c4d7d4ef8060b7  initramfs-arm64.xz
630b8a0fd3461b83189c04c42c208aaeabdb30b2b701868e48704de69d620c86  metal-amd64.iso
f939e697dbca881f5075192763e63e432a2ef4e8bf4bb94e3542ea681a7f97c2  metal-arm64.iso
745efa7ae28d3db2cdc5b63cfa094edcd81354a97b410104a654e600827950a3  metal-amd64-uki.efi
```

## Signature

`published`, established 2026-09-13. This corrects the verdict of 2026-09-11,
which said the signature was not found. It was not found because we looked for
`.sig`, `.asc` and `.pem`, and all three return 404. The signature is there in
a different form: every release asset has a `.bundle` sibling, and
`sha256sum.txt.bundle` is a Sigstore bundle whose signed digest is the sha256
of `sha256sum.txt` itself.

```sh
curl -sL https://github.com/siderolabs/talos/releases/download/v1.14.0/sha256sum.txt | sha256sum
curl -sL https://github.com/siderolabs/talos/releases/download/v1.14.0/sha256sum.txt.bundle \
  | python3 -c 'import sys,json,base64; b=json.load(sys.stdin); print(base64.b64decode(b["messageSignature"]["messageDigest"]["digest"]).hex())'
```

Our output, 2026-09-13: both lines print the same digest.

```
f5c15586d42c8eb6e2636142be161241debdbab4bb072a60e07dd942ef1d957b
```

The bundle is `application/vnd.dev.sigstore.bundle.v0.3+json` and carries an
x509 certificate. This is a signature over the checksum file, which is the
thing that was missing in the earlier verdict.

The pattern is not limited to one file. `sha512sum.txt` is released with its
own bundle, and so is every other asset, including each SPDX document. A full
listing of the publisher's organisation on 2026-09-13 showed the same
construction across its projects: a `sha256sum.txt` in each, and bundles beside
the artefacts.

## SBOM

`published` and signed, established 2026-09-13. The release includes SPDX
documents for the system and for the container image, per architecture, and
each has its own Sigstore bundle, so the bill of materials is inside the signed
set rather than beside it:
`talos-amd64.spdx.json`, `talos-arm64.spdx.json`,
`talos-container-amd64.spdx.json`, `talos-container-arm64.spdx.json`. Each has
its own `.bundle`.

```sh
curl -sL https://github.com/siderolabs/talos/releases/expanded_assets/v1.14.0 \
  | grep -oE 'releases/download/v1\.14\.0/[^"]+' | sed 's|.*/||' | sort -u | grep spdx
```

Our output, 2026-09-13:

```
talos-amd64.spdx.json
talos-amd64.spdx.json.bundle
talos-arm64.spdx.json
talos-arm64.spdx.json.bundle
talos-container-amd64.spdx.json
talos-container-amd64.spdx.json.bundle
talos-container-arm64.spdx.json
talos-container-arm64.spdx.json.bundle
```

## Transparency log

`published`, established 2026-09-13. This section was `not examined` on
2026-09-11. The bundle over `sha256sum.txt` contains a Rekor log entry, so the
signing event is recorded publicly and can be looked up independently of the
publisher.

```sh
curl -sL https://github.com/siderolabs/talos/releases/download/v1.14.0/sha256sum.txt.bundle \
  | python3 -c 'import sys,json; e=json.load(sys.stdin)["verificationMaterial"]["tlogEntries"][0]; print(e["logIndex"], e["kindVersion"])'
```

Our output, 2026-09-13:

```
2696516074 {'kind': 'hashedrekord', 'version': '0.0.1'}
```

## Expected measurements

`none to publish`, established 2026-09-11, not re-examined since. Expected
measurements are generated per unified kernel image, signed with a PCR signing
key held by the operator, and consumed only by the TPM unlock policy. In the
SecureBoot flow there is therefore nothing for the publisher to issue: the
values exist, but they are produced on the operator's side and bound to the
operator's key.

This is not the same as withholding. It is a design in which the reference is
operator-produced by construction, which the methodology explicitly allows and
which this catalog does not record, because this catalog records publisher
references.

Source: <https://docs.siderolabs.com/talos/v1.12/platform-specific-installations/bare-metal-platforms/secureboot>

## Independent rebuild

`not examined`.

## Check history

| Date | What was checked | Result |
| --- | --- | --- |
| 2026-09-11 | Integrity, signature, SBOM, expected measurements | First pass. Signature recorded as `not found`: `.sig`, `.asc` and `.pem` are absent |
| 2026-09-13 | Integrity, signature, SBOM, transparency log, against `v1.14.0` | Integrity confirmed. SBOM confirmed and found to be signed by its own bundle. Signature corrected to `published`: the signature is a Sigstore bundle, `sha256sum.txt.bundle`, not a `.sig` file. Transparency log moved from `not examined` to `published` on the Rekor entry inside that bundle |
