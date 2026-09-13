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

## Two different things happen on this site

**In the browser, you check what you bring.** A bundle collected on your own
device is compared against a profile, in the tab, and nothing leaves your
machine. That is level 1.

**In a terminal, you check what a publisher put out.** The catalog records what
each publisher issues for its own releases. Every verdict there comes with the
command that produced it and the output we got, so you can run it yourself and
compare. That needs `curl`, `sha256sum`, `openssl`, `gpg` and `python3`, which
are on most systems already.

The second one is not in the browser, and that is a decision rather than an
omission. A page with no backend cannot fetch a file from a publisher's server:
the browser refuses to let it read the response. The only way around it is to
route the download through a server of ours, which would put this project in
the middle of the reader and the publisher. A verification tool that makes
itself an intermediary has broken the thing it was for.

## Three levels of checkability

1. **Configuration as reported.** A bundle produced by `collect.sh` is
   compared against a profile. Available to any system, needs no published
   reference, and proves only what the system says about itself.
2. **Image against a published reference.** The image hash and the expected
   measurements, as issued by the publisher for a given (OS, platform) pair.
3. **Signed evidence against a set of references.**

Level 1 is live. Levels 2 and 3 depend on publishers issuing references, and
the catalog records which of them do.

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
