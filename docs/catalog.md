---
title: Catalog
layout: default
nav_order: 3
---

# Catalog
Which (operating system, platform) pairs publish references, and at what
level. Every cell that says anything has a source URL and a date. A cell
that says "not found" names where we looked.

Columns:

- **L1 profile**: a publisher profile exists in `profiles/`.
- **L2 reference**: image hash and expected measurements published for
  this platform.
- **L3 reference set**: signed reference set plus documented format, and
  a way for the device to produce a signed attestation envelope.

The table has one row today, and it is this project's own. A row for another
platform is welcome: open an issue with the URLs you checked and the date you
checked them.

| Operating system | Platform | L1 profile | L2 reference | L3 reference set | Checked | Source |
| --- | --- | --- | --- | --- | --- | --- |
| TactiQ OS | Radxa ROCK 5A (RK3588S) | not yet | not yet published | not yet published: the measured boot chain is not closed on this platform (no device-mapper target in the boot chain as of 2026-09-11), so there are no measurements to issue a reference for yet; the envelope producer is public and alpha | 2026-09-11 | https://github.com/revenue7-eng/tactiq-attest |
| Talos Linux | bare metal (amd64, arm64) | not yet | published: release assets include `sha256sum.txt` covering ISO, raw and UKI images, and SPDX SBOMs; container images are signed with cosign. A signature over `sha256sum.txt` itself was not found at the release page on 2026-09-11 | not published, and not withheld: expected measurements are generated per UKI, signed with the PCR signing key held by the operator, and consumed only by the TPM unlock policy, so there is nothing for the publisher to publish in the SecureBoot flow | 2026-09-11 | https://github.com/siderolabs/talos/releases, https://docs.siderolabs.com/talos/v1.12/platform-specific-installations/bare-metal-platforms/secureboot |
| Fedora CoreOS | bare metal (x86_64, aarch64, ppc64le, s390x) | not yet | published: the stream metadata lists, for every `metal` artifact (raw.xz, 4k.raw.xz, live ISO, and PXE kernel, initramfs and rootfs), a sha256 and a detached GPG signature stored next to the artifact itself, plus a sha256 of the uncompressed image where the artifact is compressed, so identity is asserted per artifact and there is no checksum file to sign | not found: the publisher's TPM guidance binds the encrypted root through Clevis to PCR 7 (Secure Boot state) and explicitly does not support binding to PCR 8, because the kernel command line changes with every OS update, so the binding is to platform state rather than to the identity of a released image; no expected measurements for released images were found in the stream metadata or in the storage page of the documentation source on 2026-09-11 | 2026-09-11 | https://builds.coreos.fedoraproject.org/streams/stable.json, https://github.com/coreos/fedora-coreos-docs/blob/main/modules/ROOT/pages/storage.adoc |

Rows are added one at a time, each with its own commit, so that the
history of every claim is one `git log -p` away.
