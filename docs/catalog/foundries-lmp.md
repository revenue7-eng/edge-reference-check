---
title: Foundries.io LmP
layout: default
parent: Catalog
nav_order: 6
platforms: per-Factory builds, no public release
l2_identity: not found
l2_signed: not found
l2_measurements: not found
l3: not found
last_checked: 2026-09-13
---

# Foundries.io LmP

Pairs covered by this page: none, and that is the finding. The Linux
microPlatform is released per customer Factory rather than as a public
artefact, so there is no (operating system, platform) pair a person outside a
Factory can check.

This row exists because "no reference at all" is a real and common shape in
this market, and a catalog that only listed publishers with something to show
would misrepresent it.

## Artifact identity

`not found`, established 2026-09-13. The publisher's documentation points at
reference builds in the releases of the `lmp-manifest` repository, and gives
direct image URLs of the form
`.../lmp-manifest/releases/download/<N>/lmp-gateway-image-raspberrypi3-64.wic.gz`.

```sh
for T in 97 95 90 85 80 70; do
  printf 'tag %s assets: ' "$T"
  curl -sL https://github.com/foundriesio/lmp-manifest/releases/expanded_assets/$T \
    | grep -oE '/foundriesio/lmp-manifest/releases/download/[^"]+' | wc -l
done
curl -s -o /dev/null -w '%{http_code}\n' -L https://github.com/foundriesio/lmp-manifest/releases/download/70/lmp-gateway-image-raspberrypi3-64.wic.gz
```

Our output, 2026-09-13: zero downloadable assets in all six releases examined,
and the documented image URL returns 404. The releases carry the automatic
source archives and a `manifest.json`, nothing else.

The documentation has not caught up with the change. A reader following it
lands on a dead link, which is a different failure from a publisher who states
plainly that it publishes nothing.

## Signature

`not found`, established 2026-09-13. There is no public artefact to sign.
Signing in this model happens inside a Factory with the customer's own keys, so
whatever exists is a statement to that customer rather than a published
reference.

## SBOM

`not found`, established 2026-09-13. None found in the releases examined.

## Transparency log

`not examined`.

## Expected measurements

`not found`, established 2026-09-13. No public release exists to issue
measurements for.

## Where the artefacts actually are

Inside a Factory, reached through the publisher's API and CI, both of which
refuse anonymous access.

```sh
curl -s -o /dev/null -w 'ci.foundries.io  %{http_code}\n'  https://ci.foundries.io/
curl -s -o /dev/null -w 'api.foundries.io %{http_code}\n'  https://api.foundries.io/ota/factories/lmp/
```

Our output, 2026-09-13: `403` and `401`.

This page does not claim that a Factory customer gets nothing. It claims that a
person outside a Factory can check nothing, which is what the catalog measures.
What a customer receives was not examined, and would need a customer to
examine it.

## Independent rebuild

`not examined`. The layers are public, so a rebuild is conceivable; there is no
published artefact to compare a rebuild against.

## Check history

| Date | What was checked | Result |
| --- | --- | --- |
| 2026-09-13 | Release assets of `lmp-manifest` tags 70 to 97, the image URLs cited in the documentation, and anonymous access to the publisher's API and CI | First pass. No public artefact found; documented image URLs return 404; API and CI refuse anonymous access |
