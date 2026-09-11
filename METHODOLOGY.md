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
   reference is recorded as "not found at <URL> on <date>", not as
   "does not publish".
3. UNAVAILABLE is a result, not a failure. A device that does not expose
   `/proc/config.gz` has not failed a config check; the check could not
   run.
4. The built-in profile is editorial. It states what this project
   considers a reasonable hardened baseline for an unattended edge device
   and is marked as such. Publishers' profiles state what the publisher
   claims. The two are not confused.
5. No product is named on the page. The catalog is a table of facts
   about published references.
6. A number that was not measured is not stated.
