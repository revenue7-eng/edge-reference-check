---
title: Wind River Linux
layout: default
parent: Catalog
nav_order: 7
platforms: no public release
l2_identity: not found
l2_signed: not found
l2_measurements: not found
l3: not found
last_checked: 2026-09-13
---

# Wind River Linux

Pairs covered by this page: none. No release artefact was found at any public
URL, so there is no (operating system, platform) pair an outside reader can
check.

This is the second row in the catalog with nothing in it, and the two got there
by different routes. One publisher moved its artefacts into per-customer
factories. This one used to serve prebuilt binaries from a public page, and
that page now forwards to marketing.

## Artifact identity

`not found`, established 2026-09-13. Three places were examined.

The public binaries page cited by the publisher's own tooling documentation,
`labs.windriver.com/downloads/wrlinux.html`, still answers with 200 but carries
no artefacts. Its only outbound product link goes to
`windriver.com/products/linux/download`.

```sh
curl -sL https://labs.windriver.com/downloads/wrlinux.html \
  | grep -oE 'href="[^"]+\.(tar\.bz2|tar\.gz|wic|iso|zip|sh)"' | wc -l
curl -sL https://labs.windriver.com/downloads/wrlinux.html \
  | grep -ociE 'sha256|checksum|signature'
```

Our output, 2026-09-13: zero artefacts, zero mentions of a checksum or a
signature.

The page it forwards to resolves to a product page of about 130 kB with no
artefact links and, again, no mention of a digest or a signature.

Both public code organisations were enumerated in full rather than sampled:
`WindRiver-Labs` holds 116 public repositories that are not forks, and
`Wind-River` holds 81. In the first, not one repository publishes a release
with downloadable assets; its contents are Yocto layers and kernel trees, that
is, source. In the second, four repositories do, and all four are tools:
`ccli`, `wr-conductor-blueprints`, `wr-conductor-plugins` and
`wr-linux-distro-sbom`.

Across 197 repositories there is no operating system image.

## Signature

`not found`, established 2026-09-13. There is no public artefact to sign.

The one tool release worth naming is `wr-linux-distro-sbom` v1.0: three
binaries and a `checksums.txt`, with nothing signing it. That is the same
construction Torizon OS uses for its operating system, digests served beside
the files they describe. Where this publisher does put a binary in public, it
publishes digests and no signature.

Older release notes of this product describe a checksum file for prebuilt
binaries, distributed together with a GPG key, and verified by a script inside
an existing installation. That is a mechanism for someone who already has the
product installed, not a reference a person outside can fetch and check, and
the catalog records only the latter.

## SBOM

`not examined`. The product is marketed with compliance artefacts, which are
delivered to customers; whether any of that is public was not established.

## Transparency log

`not examined`.

## Expected measurements

`not found`, established 2026-09-13. No public release exists to issue
measurements for.

## Independent rebuild

`not examined`.

## What this row does and does not say

It says that a person outside a commercial relationship cannot obtain a
reference for this system, which is what the catalog measures.

It does not say the product is unverifiable for its customers. Long-term
support, CVE monitoring and compliance artefacts are the substance of what is
sold here, and they are plausibly thorough. None of that was examined, because
none of it can be examined from outside, and a catalog entry that guessed at it
would be worse than an empty row.

## Check history

| Date | What was checked | Result |
| --- | --- | --- |
| 2026-09-13 | The public binaries page, the product download URL it forwards to, and all 197 non-fork repositories of the publisher's two public organisations | First pass. No public artefact, no published digest, no signature; the documented binaries page no longer serves binaries; the only public binaries are four tool repositories, one of which ships digests without a signature |
