---
title: Catalog
layout: default
nav_order: 3
has_children: true
---

# Catalog

Which systems publish references, and at what level. One page per operating
system. Every claim on those pages has a source URL and a date. A claim that
says "not found" names where we looked; a claim that says "not examined" means
nobody has looked yet, and says so rather than implying absence.

| System | Platforms | L1 | Artifact identity | Expected measurements | L3 | Checked |
| --- | --- | --- | --- | --- | --- | --- |
| [TactiQ OS](tactiq-os) | Radxa ROCK 5A (RK3588S) | not yet | not examined | not yet | not yet | 2026-09-11 |
| [Talos Linux](talos-linux) | bare metal (amd64, arm64) | not yet | published | none to publish | none to publish | 2026-09-11 |
| [Fedora CoreOS](fedora-coreos) | bare metal (x86_64, aarch64, ppc64le, s390x) | not yet | published | not found | not found | 2026-09-11 |

## The columns

- **L1 profile**: a publisher profile exists in `profiles/`.
- **Artifact identity**: the publisher asserts, at a stable URL, which bytes
  were released. This is the first half of level 2.
- **Expected measurements**: the publisher issues the boot measurements a
  device of this platform should produce. This is the second half of level 2,
  and it is recorded separately because a publisher can do the first without
  the second, and most do.
- **L3 reference set**: a signed reference set with a documented format, plus
  a way for the device to produce a signed attestation envelope.

## The verdicts

| Verdict | Means |
| --- | --- |
| `published` | Found at a stable URL of the publisher, on the date in the row. |
| `not found` | Looked at named URLs on the date in the row, did not find it. |
| `not examined` | Nobody has looked yet. Not a statement about the publisher. |
| `none to publish` | The mechanism leaves the publisher nothing to issue. This is a classification made by this project; the observation it rests on is on the system's page. |
| `not yet` | This project's own system, work not done. |

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
