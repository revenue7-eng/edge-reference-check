---
title: Catalog
layout: default
nav_order: 3
has_children: true
---

# Catalog

Which systems publish references, and at what level. One page per operating
system. Every claim on those pages carries a source URL, the command that
reproduces it, the output we got, and the date it was established. Every page
ends with the history of its checks.

A claim that says "not found" names where we looked; a claim that says "not
examined" means nobody has looked yet, and says so rather than implying
absence.

| System | Platforms | L1 | Artifact identity | Expected measurements | L3 |
| --- | --- | --- | --- | --- | --- |
| [TactiQ OS](tactiq-os) | Radxa ROCK 5A (RK3588S) | not yet | published | not yet | not yet |
| [Talos Linux](talos-linux) | bare metal (amd64, arm64) | not yet | published | none to publish | none to publish |
| [Fedora CoreOS](fedora-coreos) | bare metal (x86_64, aarch64, ppc64le, s390x) | not yet | published | not found | not found |
| [Ubuntu Core](ubuntu-core) | bare metal and VM images (amd64, arm64, arm64+raspi) | not yet | published | not found | not found |

This table carries no dates on purpose. A verdict is established per section,
not per system: a signature can be re-checked without touching the SBOM, so one
date per row would be wrong the moment the second check happens. Dates live
next to the verdicts they belong to, on the system pages.

## What the table says so far

Four publishers, four different ways of asserting which bytes were released. A
Sigstore bundle over the checksum file, a detached signature per artefact, a
detached OpenPGP signature over the checksum file, and a keyless certificate
bound to a release workflow. All four work. None of them is interchangeable
with another, and a reader has to learn a different tool for each.

On the second half of level 2 the four agree completely: not one of them issues
the boot measurements a device of that platform should produce. Where the
mechanism is documented, it computes the sealing target on the device at
installation, or generates it per image under a key the operator holds.

So the column that decides whether a person can check a running system against
its publisher is empty across the entire catalog. That is the finding, and it
is the reason this catalog exists in the form it does.

## The columns

- **L1 profile**: a publisher profile exists in `profiles/`.
- **Artifact identity**: the publisher asserts, at a stable URL, which bytes
  were released. This is the first half of level 2.
- **Expected measurements**: the publisher issues the boot measurements a
  device of this platform should produce. This is the second half of level 2,
  and it is recorded separately because a publisher can do the first without
  the second, and all four here do exactly that.
- **L3 reference set**: a signed reference set with a documented format, plus
  a way for the device to produce a signed attestation envelope.

## The verdicts

| Verdict | Means |
| --- | --- |
| `published` | Found at a stable URL of the publisher, on the date recorded with the verdict. |
| `not found` | Looked at named URLs on that date, did not find it. |
| `not examined` | Nobody has looked yet. Not a statement about the publisher. |
| `none to publish` | The mechanism leaves the publisher nothing to issue. This is a classification made by this project; the observation it rests on is in the section. |
| `not yet` | This project's own system, work not done. |

A verdict is true as of its date and not after it. Publishers change what they
release, so a verdict without a date is a claim this project cannot support.

## Keying

References are keyed by (operating system, platform) pairs, because boot
measurements depend on firmware and on the boot chain. A page covers one
operating system and lists its pairs. A pair gets its own page only when its
verdicts diverge from the others on that page.

The list of systems exists in one place: the table above. A system that is not
in it does not exist for this catalog, whatever pages happen to be in the
repository.

## Adding a system

Open an issue with the URLs you checked and the date you checked them. Systems
are added one at a time, each with its own commit, so that the history of every
claim is one `git log -p` away.
