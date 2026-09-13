---
title: Fedora CoreOS
layout: default
parent: Catalog
nav_order: 3
platforms: bare metal (x86_64, aarch64, ppc64le, s390x)
l1: not yet
l2_identity: published
l2_measurements: not found
l3: not found
last_checked: 2026-09-13
---

# Fedora CoreOS

Pairs covered by this page: Fedora CoreOS on bare metal, x86_64, aarch64,
ppc64le and s390x. The four architectures share every verdict below, so they
share a page.

Verdicts below were established against the `stable` stream at release
`44.20260817.3.2`. The stream moves, so a later reader will see a later
release: what the commands verify is the shape of what the publisher issues,
not one frozen build.

## Integrity

`published`, established 2026-09-13, confirming 2026-09-11. The stream
metadata lists, for every `metal` artefact, a sha256 of the artefact and a
detached signature stored next to it.

```sh
curl -s https://builds.coreos.fedoraproject.org/streams/stable.json \
  | python3 -c 'import sys,json; d=json.load(sys.stdin); a=d["architectures"]["x86_64"]["artifacts"]["metal"]; print("release:", a["release"]); [print(f, k, "sig" if v.get("signature") else "-", "sha256" if v.get("sha256") else "-") for f,i in a["formats"].items() for k,v in i.items()]'
```

Our output, 2026-09-13:

```
release: 44.20260817.3.2
4k.raw.xz disk sig sha256
iso disk sig sha256
pxe kernel sig sha256
pxe initramfs sig sha256
pxe rootfs sig sha256
raw.xz disk sig sha256
```

Architectures present in the same metadata: `aarch64`, `ppc64le`, `s390x`,
`x86_64`.

## Signature

`published`, established 2026-09-13, confirming 2026-09-11. Identity is
asserted per artefact, so there is no checksum file to sign and no gap of the
kind a signature over a checksum file would leave. The signature is a real
file, not just a field in the metadata.

```sh
curl -sI https://builds.coreos.fedoraproject.org/prod/streams/stable/builds/44.20260817.3.2/x86_64/fedora-coreos-44.20260817.3.2-metal.x86_64.raw.xz.sig | head -1
```

Our output, 2026-09-13: HTTP 200, 566 bytes.

## SBOM

`not found`, established 2026-09-13. Three places were examined: the stream
metadata, the build's own `meta.json`, and the publisher's GitHub
organisation.

```sh
B=https://builds.coreos.fedoraproject.org/prod/streams/stable/builds/44.20260817.3.2/x86_64
curl -s $B/meta.json | python3 -c 'import sys,json; d=json.load(sys.stdin); print(sorted(d["images"])); print(sorted(next(iter(d["images"].values()))))'
```

Our output, 2026-09-13: 28 image entries, and each one carries exactly four
fields, `path`, `sha256`, `size` and `skip-compression`. No SBOM key appears
anywhere in the build metadata.

The `coreos` organisation on GitHub does publish signed release assets, but for
its tools (`ignition`, `butane`) rather than for the operating system images.

## Transparency log

`not examined`.

## Expected measurements

`not found`, established 2026-09-11, not re-examined since. The publisher's TPM
guidance binds the encrypted root through Clevis to PCR 7, the Secure Boot
state, and explicitly does not support binding to PCR 8, because the kernel
command line changes with every OS update. The binding is therefore to platform
state rather than to the identity of a released image. No expected measurements
for released images were found in the stream metadata or in the storage page of
the documentation source on that date.

Source: <https://github.com/coreos/fedora-coreos-docs/blob/main/modules/ROOT/pages/storage.adoc>. The published documentation site blocked automated access, so the documentation source was read in the repository.

## Independent rebuild

`not examined`.

## Check history

| Date | What was checked | Result |
| --- | --- | --- |
| 2026-09-11 | Integrity, signature, expected measurements | First pass. Per-artefact signatures, no image-level measurements |
| 2026-09-13 | Integrity, signature, SBOM, against release `44.20260817.3.2` | Integrity and signature confirmed unchanged, detached signature fetched, 566 bytes. SBOM moved from `not examined` to `not found` after the build metadata and the publisher's GitHub organisation were examined |
