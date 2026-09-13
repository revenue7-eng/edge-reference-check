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

| System and platform | L1 | Artifact identity | Signed | Expected measurements | L3 |
| --- | --- | --- | --- | --- | --- |
| [TactiQ OS on ROCK 5A](tactiq-os) | not yet | published | published | not yet | not yet |
| [Talos Linux on bare metal](talos-linux) | not yet | published | published | none to publish | none to publish |
| [Fedora CoreOS on bare metal](fedora-coreos) | not yet | published | published | not found | not found |
| [Ubuntu Core on bare metal and VMs](ubuntu-core) | not yet | published | published | not found | not found |
| [Torizon OS on SL1680](torizon-os) | not yet | published | not found | not found | not found |

The platform is in the name of the row because a reference belongs to an
(operating system, platform) pair, not to an operating system. Boot
measurements depend on firmware and on the boot chain, and both are
platform-specific, so a verdict about one platform says nothing about another.
Torizon OS is released for six platform families and one of them is checked
here; that limit is in the row rather than in a footnote.

The architectures each row covers are named at the top of that system's page.
They are not in the table because they do not change a verdict: when they do,
the row splits and the difference shows up in the row name itself.

This table carries no dates. A verdict is established per section, not per
system: a signature can be re-checked without touching the SBOM, so one date
per row would be wrong the moment the second check happens. Dates live next to
the verdicts they belong to.

## What the table says so far

Five publishers, five different ways of asserting which bytes were released: a
Sigstore bundle over the checksum file, a detached signature per artefact, a
detached OpenPGP signature over the checksum file, a keyless certificate bound
to a release workflow, and digest sidecars with no signature at all. Four of
the five sign the assertion. One does not, and a reader who sees a directory
full of digests can easily miss that, which is why the table separates the two.

On the second half of level 2 the five agree completely: not one of them issues
the boot measurements a device of that platform should produce. Where the
mechanism is documented, it computes the sealing target on the device at
installation, or generates it per image under a key the operator or the
customer holds.

So the column that decides whether a person can check a running system against
its publisher is empty across the entire catalog. That is the finding, and it
is the reason this catalog exists in the form it does.

## The columns

- **L1 profile**: a publisher profile exists in `profiles/`.
- **Artifact identity**: the publisher asserts, at a stable URL, which bytes
  were released.
- **Signed**: that assertion is signed, so it proves who produced the artefact
  and not only that the download was intact. Identity and signature together
  are the first half of level 2.
- **Expected measurements**: the publisher issues the boot measurements a
  device of this platform should produce. This is the second half of level 2,
  and it is recorded separately because a publisher can do the first without
  the second, and all five here do exactly that.
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

## Adding a system

Open an issue with the URLs you checked and the date you checked them. Systems
are added one at a time, each with its own commit, so that the history of every
claim is one `git log -p` away.
