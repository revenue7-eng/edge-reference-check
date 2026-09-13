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
checked: 2026-09-11
---

# Talos Linux

Pairs covered by this page: Talos Linux on bare metal, amd64 and arm64. The
two architectures share every verdict below, so they share a page.

## Integrity

`published`. Release assets include `sha256sum.txt`, covering the ISO, the raw
images and the unified kernel images.

## Signature

`not found`. A signature over `sha256sum.txt` itself was not found at the
release page on 2026-09-11. Container images are signed with cosign, which
covers a different set of artifacts than the ones a bare-metal installer
consumes.

## SBOM

`published`. SPDX SBOMs are included in the release assets.

## Transparency log

`not examined`.

## Expected measurements

`none to publish`. Expected measurements are generated per unified kernel
image, signed with a PCR signing key held by the operator, and consumed only by
the TPM unlock policy. In the SecureBoot flow there is therefore nothing for
the publisher to issue: the values exist, but they are produced on the
operator's side and bound to the operator's key.

This is not the same as withholding. It is a design in which the reference is
operator-produced by construction, which the methodology explicitly allows and
which this catalog does not record, because this catalog records publisher
references.

## Independent rebuild

`not examined`.

## Sources

- <https://github.com/siderolabs/talos/releases>, checked 2026-09-11.
- <https://docs.siderolabs.com/talos/v1.12/platform-specific-installations/bare-metal-platforms/secureboot>, checked 2026-09-11.
