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
checked: 2026-09-11
---

# Fedora CoreOS

Pairs covered by this page: Fedora CoreOS on bare metal, x86_64, aarch64,
ppc64le and s390x. The four architectures share every verdict below, so they
share a page.

## Integrity

`published`. The stream metadata lists, for every `metal` artifact (`raw.xz`,
`4k.raw.xz`, the live ISO, and the PXE kernel, initramfs and rootfs), a sha256
of the artifact, plus a sha256 of the uncompressed image where the artifact is
compressed.

## Signature

`published`. Each artifact carries a detached GPG signature stored next to the
artifact itself. Identity is asserted per artifact, so there is no checksum
file to sign and no gap of the kind a signature over a checksum file would
leave.

## SBOM

`not examined`.

## Transparency log

`not examined`.

## Expected measurements

`not found`. The publisher's TPM guidance binds the encrypted root through
Clevis to PCR 7, the Secure Boot state, and explicitly does not support binding
to PCR 8, because the kernel command line changes with every OS update. The
binding is therefore to platform state rather than to the identity of a
released image. No expected measurements for released images were found in the
stream metadata or in the storage page of the documentation source on
2026-09-11.

## Independent rebuild

`not examined`.

## Sources

- <https://builds.coreos.fedoraproject.org/streams/stable.json>, checked 2026-09-11.
- <https://github.com/coreos/fedora-coreos-docs/blob/main/modules/ROOT/pages/storage.adoc>, checked 2026-09-11. The published documentation site blocked automated access, so the documentation source was read in the repository.
