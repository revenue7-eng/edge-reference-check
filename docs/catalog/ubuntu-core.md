---
title: Ubuntu Core
layout: default
parent: Catalog
nav_order: 4
platforms: bare metal and VM images (amd64, arm64, arm64+raspi)
l1: not yet
l2_identity: published
l2_measurements: not found
l3: not found
last_checked: 2026-09-13
---

# Ubuntu Core

Pairs covered by this page: Ubuntu Core on amd64, arm64 and arm64+raspi. The
three share every verdict below, so they share a page.

Verdicts were established against series `26`, `stable` channel, the build
served as `current` on 2026-09-13. The `current` path moves, so a later reader
will see a later build; what the commands verify is the shape of what the
publisher issues.

This is the third identity mechanism in the catalog. Talos signs the checksum
file with a Sigstore bundle, Fedora CoreOS signs each artefact separately, and
Canonical signs the checksum file with a detached OpenPGP signature.

## Integrity

`published`, established 2026-09-13. `SHA256SUMS` covers the released images
for all three platforms, in both disk-image and virtual-machine forms.

```sh
curl -s https://cdimage.ubuntu.com/ubuntu-core/26/stable/current/SHA256SUMS
```

Our output, 2026-09-13, eight lines:

```
be0e82c272fe12609e5db7d18f5e93cba76c5b725529b243c71833180b0c6780 *ubuntu-core-26-amd64.img.xz
c3c6b354959f0a35246adf5a1f9b6083baebb767f934877da439870bccd79158 *ubuntu-core-26-amd64.lxd.tar.xz
0c7a17b54f2443490faf2f91ce48284bc9b76cf67fc664b90a9748962bb4c74b *ubuntu-core-26-amd64.qcow2
c01f4817e034bf973c9aa99cb638cc3aef4b668c942da1fa2de79a28559aefbe *ubuntu-core-26-arm64+raspi.img.xz
5a86d66af017cc75c754c3b3d20ec4e281c97810b08199fc6a09e19153268935 *ubuntu-core-26-arm64+raspi.lxd.tar.xz
136104f74e51672e66c15326737a8d4ae8a7060e0cd252a61f612fffae23bdb2 *ubuntu-core-26-arm64.img.xz
fa2571520af7fa4d8867ae618ccfba8ca5831c6d0a1f96009a324abd4f839dc2 *ubuntu-core-26-arm64.lxd.tar.xz
43ba1ab5ffbd4685b6370863531df99c7b4e6172bff36a70d8ba62e8f5395d03 *ubuntu-core-26-arm64.qcow2
```

## Signature

`published`, established 2026-09-13. `SHA256SUMS.gpg` is a detached OpenPGP
signature over the checksum file, and it verifies against a key the publisher
serves itself.

```sh
U=https://cdimage.ubuntu.com/ubuntu-core/26/stable/current
curl -s $U/SHA256SUMS -o SHA256SUMS
curl -s $U/SHA256SUMS.gpg -o SHA256SUMS.gpg
gpg --verify SHA256SUMS.gpg SHA256SUMS
```

Our output, 2026-09-13, before importing anything: the signature was made on
2026-05-07 10:40:24 UTC with RSA key
`843938DF228D22F7B3742BC0D94AA3F0EFE21092`, and cannot be checked without that
key. Fetching the key and repeating gives:

```
gpg: Good signature from "Ubuntu CD Image Automatic Signing Key (2012) <cdimage@ubuntu.com>"
```

```sh
curl -s "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x843938DF228D22F7B3742BC0D94AA3F0EFE21092&options=mr" | gpg --import
```

The key is not certified by any trust path in a fresh keyring, so `gpg` also
warns that nothing ties the key to its stated owner. That warning is correct
and is the reader's job to resolve: the fingerprint above has to be confirmed
against a source the reader already trusts, not against the file it just
verified.

Alongside each image the publisher also serves a model assertion, a signed
statement naming the brand, the model, the architecture and the pinned snaps.

```sh
curl -s https://cdimage.ubuntu.com/ubuntu-core/26/stable/current/ubuntu-core-26-arm64.model-assertion | head -9
```

Our output, 2026-09-13: `type: model`, `authority-id: canonical`,
`brand-id: canonical`, `model: ubuntu-core-26-arm64`, `grade: signed`.

## SBOM

`not found`, established 2026-09-13. No SPDX or CycloneDX document is served
next to the images. A `.manifest` file is published per image, listing snap
names and revisions:

```sh
curl -s https://cdimage.ubuntu.com/ubuntu-core/26/stable/current/ubuntu-core-26-arm64.manifest
```

Our output, 2026-09-13:

```
console-conf 90
core26 383
pc 228
pc-kernel 3420
snapd 26869
```

That is a bill of materials at snap granularity, which is the granularity the
system is assembled at. It is not a standard-format SBOM, so it does not close
this section, but it is not nothing either, and a reader should know it exists.

## Transparency log

`not examined`.

## Expected measurements

`not found`, established 2026-09-13. The publisher's own documentation
describes the mechanism: at installation, TPM-backed full disk encryption seals
the key to an expected chain of boot assets, part of the EFI state, the device
model and the kernel command line. The sealing target is therefore computed on
the device during installation, not issued with the image.

We looked in the image directory and in the full disk encryption documentation
and found no expected measurement values for released images. We did not
examine the gadget and kernel snaps, so this is recorded as `not found` rather
than as `none to publish`.

Source: <https://documentation.ubuntu.com/core/explanation/full-disk-encryption/>

## Independent rebuild

`not examined`.

## Check history

| Date | What was checked | Result |
| --- | --- | --- |
| 2026-09-13 | Integrity, signature, SBOM, expected measurements, against series `26` stable `current` | First pass. Detached OpenPGP signature over the checksum file verifies; no standard-format SBOM; no expected measurements found |
