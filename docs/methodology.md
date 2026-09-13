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
2. Every catalog claim has a source URL and the date it was established.
   Absence of a reference is recorded as "not found at `<URL>` on `<date>`",
   not as "does not publish". A claim nobody has checked yet is recorded as
   "not examined", which is a statement about this project rather than about
   the publisher, and is never written as absence.
3. UNAVAILABLE and NOT APPLICABLE are results, not failures. A device that
   does not expose `/proc/config.gz` has not failed a config check. If the
   profile expected that interface to be closed, the check is NOT APPLICABLE
   and says why; if nobody expected it either way, it is UNAVAILABLE.
4. The built-in profile is editorial. It states what this project
   considers a reasonable hardened baseline for an unattended edge device
   and is marked as such. Publishers' profiles state what the publisher
   claims. The two are not confused.
5. No product is promoted on the page. The catalog is a table of facts
   about published references, and this project's own system is one row in
   it, described in the same words as the rest.
6. A number that was not measured is not stated.
7. The list of systems exists in one place, the table on the catalog page.
   Any other list is derived from it or does not exist. A page in the
   repository that the table does not list is not part of the catalog.
8. This project's own system is recorded in the catalog on the same terms as
   any other, in the same words, and is not exempt from any rule above.

## Two subjects, and why they never share a table

This project answers two questions that look similar and are not.

The first is about a device: is this running system configured the way its
publisher says it should be. The subject is the reader's own hardware, the
evidence is a bundle the reader collected, and the check runs in the browser.
That is level 1.

The second is about a publisher: does this publisher issue, at a stable URL,
the things a person would need in order to check a device at all. The subject
is a release, the evidence is what the publisher serves, and the check runs in
a terminal. That is what the catalog records.

Mixing them produces sentences that cannot be true. A column saying whether
this project has written a profile is a fact about this project, and it has no
business standing in a row about Canonical or Sidero. So the catalog table
carries publisher verdicts only, and anything about profiles or about a
particular device lives elsewhere.

The catalog also holds no reference values of its own. It records that a
publisher issues them and where; it does not copy them here. A catalog that
redistributed other people's expected measurements would ask the reader to
trust it as an intermediary, which is the opposite of what it is for.

## What each system page records

A system page is organised around the release-verification procedure rather
than around the vendor. Six sections, each with a verdict, a source URL and the
date the verdict was established:

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

## Publishing the check itself, not only its result

A verdict a reader has to take on trust is worth little on a page whose whole
subject is not taking things on trust. So each verdict carries the command that
produces it and the output we got, with the date.

Three rules keep those blocks honest.

1. **The command is pinned to a version.** A release tag, a stream and a build
   number. Without a pin, a reader running the command later compares their
   output against ours across two different releases and reads an ordinary
   publisher update as a discrepancy.
2. **The command does not depend on a rate-limited or authenticated API.** An
   anonymous caller of a public code-hosting API is typically limited to a few
   dozen requests an hour; past that limit the command returns an error body
   that a reader can easily mistake for absence. Plain download URLs have no
   such failure mode, so the check is built from those.
3. **The command is run before it is committed.** A command that was reasoned
   about but never executed is a guess, and a guess that prints nothing looks
   exactly like a finding. Only commands that produced the output shown next to
   them are published.

What is published is our output, not the publisher's files. A copy of someone
else's release artefact in this repository would be their content under their
terms, stale within a release cycle, and no more convincing than the URL it
came from.

## Looking for the wrong shape is a finding about us

A check that looks for one encoding of a property and concludes the property is
absent has measured this project, not the publisher. The catalog has already
recorded one such case: a signature over a checksum file was recorded as not
found, because the check looked for `.sig`, `.asc` and `.pem`, and the
publisher had signed with a Sigstore bundle instead.

When a re-check overturns a verdict this way, the history row says what was
looked for and what was actually there. The reader learns two things: what the
publisher does, and how carefully this catalog looks.

## Dates, re-checks, and the history of a verdict

A verdict is true as of its date and not after it. Publishers move URLs, add
signatures, drop formats and change flows, so a catalog that states verdicts
without dates states things it cannot support.

Dates are therefore recorded per section, not per system. A signature can be
re-examined without touching the SBOM, and when that happens only that section
moves. One date for a whole system would be wrong from the second check
onward, which is why the catalog table carries no date column at all and
points at the pages instead.

Every system page ends with a check history: one row per pass, with the date,
the sections examined, and what came out. Two rules hold it together:

1. A re-check that changes a verdict adds a history row. The previous verdict
   and the date it held are never deleted, because a reader needs to see that
   the publisher changed, or that this catalog was wrong, rather than being
   told the new state was always the state.
2. A re-check that confirms a verdict also adds a history row. Confirmation is
   work performed and is worth as much to a reader as change; without it there
   is no way to tell a verdict that was re-examined last month from one that
   nobody has looked at since it was written.

A section that was not re-examined in a pass keeps its own older date and says
so. Re-checking one section does not refresh the others.
