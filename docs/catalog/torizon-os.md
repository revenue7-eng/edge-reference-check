---
title: Torizon OS
layout: default
parent: Catalog
nav_order: 5
platforms: Synaptics SL1680 (other platforms not examined)
l1: not yet
l2_identity: published
l2_measurements: not found
l3: not found
last_checked: 2026-09-13
---

# Torizon OS

Pairs covered by this page: Torizon OS on Synaptics SL1680. The publisher also
releases for i.MX8, i.MX93, i.MX95, AM6x and Jetson platforms; those were not
examined, and this page says nothing about them.

Verdicts were established against `7.6.2+build.2` in the production release
feed.

This row is the reason the catalog separates integrity from signature. The
publisher asserts which bytes were released, thoroughly and per artefact, and
nothing signs those assertions.

## Integrity

`published`, established 2026-09-13. Every artefact in the release directory
has `.md5`, `.sha1` and `.sha256` siblings. In the directory we examined there
were 101 artefacts and 404 entries in total.

```sh
D=https://artifacts.toradex.com/artifactory/common-torizon-syn-oe-prod-frankfurt/scarthgap-7.x.y/release/2/sl1680/common-torizon/torizon-minimal/oedeploy
curl -sL $D/ | grep -oE 'href="[^"]+"' | sed 's|href="||;s|"||' | grep -c 'sha256$'
curl -sL $D/torizon-minimal-sl1680.ota-ext4.sha256
```

Our output, 2026-09-13: 101 `.sha256` files, one per artefact, each containing
the digest of the file next to it.

No account, no registration and no agreement is needed to read any of this.
That was worth checking, because the catalog's rule is that a digest which has
to be requested does not count as published, and this one does not have to be
requested.

## Signature

`not found`, established 2026-09-13. The release directory contains no `.sig`,
`.asc`, `.pem` or Sigstore bundle, and no signature over any of the digest
files.

```sh
D=https://artifacts.toradex.com/artifactory/common-torizon-syn-oe-prod-frankfurt/scarthgap-7.x.y/release/2/sl1680/common-torizon/torizon-minimal/oedeploy
curl -sL $D/ | grep -oE 'href="[^"]+"' | sed 's|href="||;s|"||' | grep -E '\.(sig|asc|pem|bundle)$'
```

Our output, 2026-09-13: nothing.

The consequence is worth stating plainly, because a reader who sees a wall of
`.sha256` files may take them for a chain of trust. A digest served from the
same directory as the file it describes proves that the download was not
corrupted in transit. It does not prove who produced the file: whoever can
change the artefact can change the digest beside it. Every other publisher in
this catalog closes that gap with a signature, by four different mechanisms.
This one does not close it at all.

## SBOM

`published`, established 2026-09-13. SPDX documents are released per image,
compressed, with their own digests.

```sh
D=https://artifacts.toradex.com/artifactory/common-torizon-syn-oe-prod-frankfurt/scarthgap-7.x.y/release/2/sl1680/common-torizon/torizon-minimal/oedeploy
curl -sL $D/ | grep -oE 'href="[^"]+"' | sed 's|href="||;s|"||' | grep 'spdx' | grep -v -E '\.(md5|sha1|sha256)$'
```

Our output, 2026-09-13, includes `torizon-minimal-sl1680-7.6.2+build.2.spdx.tar.zst`
alongside SPDX documents for the initramfs images, plus per-image `.manifest`,
`.cve` and `.testdata.json` files.

The CVE reports being released next to the image is unusual in this catalog and
is worth noting: it is the publisher stating known vulnerabilities at release
time rather than leaving that to the reader.

## Transparency log

`not examined`.

## Expected measurements

`not found`, established 2026-09-13. The publisher's secure boot flow signs the
kernel and bootloader on the customer's side: the customer supplies their own
keys to the vendor's build tool, which re-signs a pre-signed image. The
measurements a device produces therefore depend on the customer's keys, and the
publisher does not issue expected values for a released image.

We looked in the release directory and in the secure boot documentation. We did
not examine the update metadata served to devices, so this is `not found`
rather than `none to publish`.

Source: <https://developer.toradex.com/torizon/os-customization/use-cases/signing-secure-boot-image-components-on-torizon-os>

## Independent rebuild

`not examined`.

## Check history

| Date | What was checked | Result |
| --- | --- | --- |
| 2026-09-13 | Integrity, signature, SBOM, expected measurements, against `7.6.2+build.2` on SL1680 | First pass. Per-artefact digests and SPDX published openly; no signature of any kind found |
