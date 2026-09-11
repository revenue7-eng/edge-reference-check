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

| Operating system | Platform | L1 profile | L2 reference | L3 reference set | Checked | Source |
| --- | --- | --- | --- | --- | --- | --- |
| TactiQ OS | Radxa ROCK 5A (RK3588S) | not yet | not yet published | not yet published; envelope producer is public and alpha | 2026-09-11 | https://github.com/revenue7-eng/tactiq-attest |

Rows are added one at a time, each with its own commit, so that the
history of every claim is one `git log -p` away.
