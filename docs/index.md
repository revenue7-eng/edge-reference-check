---
title: Home
layout: default
nav_order: 1
---

# edge-reference-check

Check what an edge Linux system reports about itself against a profile.
The check runs in the browser tab. There is no backend, no storage, no
account, and no history. Nothing is uploaded, and everything is gone when
the tab is closed.

[Run a check](check.html){: .btn }

## Three levels of checkability

1. **Configuration as reported.** A bundle produced by `collect.sh` is
   compared against a profile. Available to any system, needs no published
   reference, and proves only what the system says about itself.
2. **Image against a published reference.** The image hash and the expected
   measurements, as issued by the publisher for a given (OS, platform) pair.
3. **Signed evidence against a set of references.**

Level 1 is live. Levels 2 and 3 depend on publishers issuing references.

## Four outcomes, not two

`OK`, `FAIL`, `UNAVAILABLE` (the check could not run), and
`NOT APPLICABLE` (the profile expects this interface to be closed on systems
of this type). Neither of the last two is a failure.

## Two kinds of observability

Self-description interfaces (`/proc/config.gz`, `/dev/mem`, reading policy
out of securityfs) are closed by hardening, and closing them is correct.
Produced evidence (a measurement log, a tamper event, a signed envelope) is
never closed. A hardened system does not become unverifiable: it stops being
verifiable the first way and stays verifiable the third.
