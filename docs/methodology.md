---
title: Methodology
layout: default
nav_order: 2
---

# Methodology
## Purpose

Most claims about edge operating systems are made in slides. This project
exists so that a person can check a claim on their own hardware, without
the publisher's participation, and see exactly where their ability to
check runs out.

## The three levels

**Level 1: configuration as reported.** The device runs `collect.sh`,
which reads kernel config, boot parameters, LSM state, device-mapper
state, IMA state and a few sysctls, and writes them to one text file. The
page compares the bundle against a profile. Nothing in the bundle is
signed, so level 1 proves what the running system said about itself. A
compromised system can say anything. Level 1 is still useful: it catches
the ordinary case, a system that was never configured the way its
publisher claims.

**Level 2: image against published reference.** The publisher releases,
for a specific (operating system, platform) pair, at minimum the image
hash and the expected boot measurements. The person compares the image
they have, and the measurements their device produces, against that
reference. Level 2 proves that the artefact on disk is the one that was
published. It does not prove that the artefact is what booted.

**Level 3: attested state against reference set.** The device produces a
signed attestation envelope from a hardware root of trust. The page
verifies the signature with the device's public key and checks the
attested measurement against a reference set. Level 3 proves that the
measured boot state is one the reference set recognises.

What level 3 on this page does not do: adjudicate freshness. A
counter-based protocol decides freshness by comparing the counter with a
high-water mark persisted from the previous check. This page persists
nothing, by rule. It shows the counter value and says so.

## Two kinds of observability, and why hardening removes only one

A system can be observed in two quite different ways, and the difference
decides what a verification tool may conclude from silence.

The first is self-description: interfaces through which a running system tells
a local process about itself. `/proc/config.gz`, `/dev/mem`, a writable policy
node in securityfs, debug interfaces. Each of these is both a source of facts
for whoever is checking and a surface for whoever is attacking. A hardened
production image closes them, or makes them read-only, on purpose.

The second is produced evidence: what the system emits outward. A measurement
log, a tamper event, a signed attestation envelope. These are never closed,
because emitting them is the entire point of having them.

Hardening removes the first and keeps the second. A tool that treats a closed
interface as a missing answer therefore scores a hardened system as less
verifiable than a system that left everything open, which is exactly backwards.

This is why a check has three outcomes rather than two. OK and FAIL are
answers. UNAVAILABLE means the check could not run and nobody decided that in
advance. NOT APPLICABLE means the profile states that this interface is
expected to be closed on this kind of system, so its absence is a design
decision that has already been accounted for. A profile marks a check with
`na_when` to say so, and gives a reason that is shown to the reader.

The consequence for the levels above: a closed system does not become
unverifiable. It stops being verifiable by the first method and remains
verifiable by the third. Level 1 asks the system to describe itself and depends
on interfaces that hardening closes. Level 3 asks for a signed statement the
system produces anyway, and depends on a root of trust rather than on open
interfaces. A publisher who closes the first without offering the third has
made their system unverifiable; a publisher who closes the first and publishes
a reference for the third has not.

## Why (operating system, platform) and not operating system

Boot measurements depend on firmware and on the boot chain, and both are
platform-specific. On UEFI systems the Secure Boot state and the unified
kernel image land in fixed registers; on U-Boot chains the same registers
carry whatever the chain was built to extend into them. Firmware
measurements on many SoCs cannot be computed analytically and are obtained
by observation on reference hardware. A reference therefore belongs to a
pair, and the catalog is keyed by pairs.

## What counts as a published reference

For level 2: image hash and expected measurements, released by the
publisher at a stable URL, for a named platform. A hash in a release note
counts. A hash that must be requested by email does not.

The catalog records these two halves in separate columns, artifact identity
and expected measurements, because a publisher can assert which bytes were
released without issuing the measurements a device of that platform should
produce, and most publishers do exactly that. A pair reaches level 2 only when
both are present. Recording them in one cell hides which half is missing,
which is the thing a reader came to find out.

For level 3: a reference set, meaning the expected measurement selection
and the set of recognised measurement values, signed by the publisher or
by an authority the operator has chosen to trust, plus the format needed
to consume it. A reference set without a documented format does not
count.

Operators can also produce their own reference by observation on a
golden device. The catalog records publisher references only; the
methodology for operator-produced references is the same, and the page
accepts them.

## Rules this project holds itself to

1. No backend, no storage, no accounts, no history. Everything runs in
   the browser and is gone when the tab closes. Anything that requires
   state between checks is out of scope by definition.
2. Every catalog claim has a source URL and a date. Absence of a
   reference is recorded as "not found at `<URL>` on `<date>`", not as
   "does not publish". A claim nobody has checked yet is recorded as "not
   examined", which is a statement about this project rather than about the
   publisher, and is never written as absence.
3. UNAVAILABLE and NOT APPLICABLE are results, not failures. A device that
   does not expose `/proc/config.gz` has not failed a config check. If the
   profile expected that interface to be closed, the check is NOT APPLICABLE
   and says why; if nobody expected it either way, it is UNAVAILABLE.
4. The built-in profile is editorial. It states what this project
   considers a reasonable hardened baseline for an unattended edge device
   and is marked as such. Publishers' profiles state what the publisher
   claims. The two are not confused.
5. No product is named on the page. The catalog is a table of facts
   about published references.
6. A number that was not measured is not stated.
7. The list of systems exists in one place, the table on the catalog page.
   Any other list is derived from it or does not exist. A page in the
   repository that the table does not list is not part of the catalog.
8. This project's own system is recorded in the catalog on the same terms as
   any other, in the same words, and is not exempt from any rule above.

## What each system page records

A system page is organised around the release-verification procedure rather
than around the vendor. Six sections, each with a verdict, a source URL and a
date:

1. **Integrity.** Does the publisher assert which bytes were released.
2. **Signature.** Is that assertion signed, and over what.
3. **SBOM.** Is a bill of materials released with the artifacts.
4. **Transparency log.** Is the signing event recorded in a public log.
5. **Expected measurements.** Are boot measurements issued for the platform.
6. **Independent rebuild.** Can a third party rebuild the artifact and compare.

The first four are what a reader can check against a release today. The fifth
is what level 2 needs and most publishers do not provide. The sixth is a
separate layer: it does not check a release against a reference, it removes
the need to trust the build.
