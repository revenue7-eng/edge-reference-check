---
title: Kairos
layout: default
parent: Catalog
nav_order: 8
platforms: bare metal (amd64, arm64)
l1: not yet
l2_identity: published
l2_measurements: none to publish
l3: none to publish
last_checked: 2026-10-25
---

# Kairos

Pairs covered by this page: Kairos on generic bare metal, amd64 and arm64,
installed from the ISO the publisher releases. The publisher builds its
official artefacts on one flavour, Hadron, and this page covers that flavour.
The two architectures share every verdict below, so they share a page.

The arm64 artefact is a generic ISO. Board-specific raw disk images are not
attached to releases: the publisher states that they exceed the 2 GiB per-file
limit for release assets and are to be exported from container images instead.
Those images have no release-level checksum or signature, so this page says
nothing about them.

Source: <https://kairos.io/docs/reference/image_matrix/>

Verdicts below were established against release `v4.3.0`. Each section carries
the command that reproduces it and the output we got. Run the command yourself:
if your output differs from ours, the publisher changed something after our
date, and that is exactly what these blocks exist to make visible.

None of the commands use `api.github.com`. The anonymous API limit is 60
requests per hour per address, and a reader who hits it gets an empty answer
that reads like absence.

## Integrity

`published`, established 2026-10-25. Every ISO has its own `.sha256` sidecar,
and every sidecar has its own `.sha256.bundle`.

```sh
curl -sL https://github.com/kairos-io/kairos/releases/expanded_assets/v4.3.0 \
  | grep -oE 'releases/download/v4\.3\.0/[^"]+' | sed 's|.*/||' | sort -u \
  | grep -E 'amd64|arm64' | head -n 40
```

Our output, 2026-10-25, first six of 40 lines:

```
kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso
kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256
kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256.bundle
kairos-hadron-v0.5.1-core-arm64-generic-v4.3.0.iso
kairos-hadron-v0.5.1-core-arm64-generic-v4.3.0.iso.sha256
kairos-hadron-v0.5.1-core-arm64-generic-v4.3.0.iso.sha256.bundle
```

Lines 7 to 33 repeat the same three-file pattern for the `standard` images,
which add k3s or k0s. The last seven lines are tool archives, which appear in
full in the listing below.

```sh
curl -sL https://github.com/kairos-io/kairos/releases/download/v4.3.0/kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256
```

Our output, 2026-10-25:

```
2d126227e6297682231984bfa0ee8d5084a621967f3c5afe8edeea77fcc46c3f  artifacts/kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso
```

The file name inside the sidecar carries the build directory `artifacts/`. A
reader who runs `sha256sum -c` next to a downloaded ISO gets a missing-file
error rather than a mismatch, and has to compare the digest by hand.

The release has 57 assets in total. 33 of them are ISOs with their `.sha256`
and `.sha256.bundle` files (eleven ISOs, three files each), all listed by the
command above. The other 24 are everything else in the release:

```sh
curl -sL https://github.com/kairos-io/kairos/releases/expanded_assets/v4.3.0 \
  | grep -oE 'releases/download/v4\.3\.0/[^"]+' | sed 's|.*/||' | sort -u | wc -l
curl -sL https://github.com/kairos-io/kairos/releases/expanded_assets/v4.3.0 \
  | grep -oE 'releases/download/v4\.3\.0/[^"]+' | sed 's|.*/||' | sort -u | grep -vE '\.iso'
```

Our output, 2026-10-25:

```
57
checksums.txt
kairos-init-v4.3.0-linux-amd64.tar.gz
kairos-init-v4.3.0-linux-arm64.tar.gz
kairos-init-v4.3.0-linux-riscv64.tar.gz
kairos-installer-v4.3.0-linux-amd64-fips.tar.gz
kairos-installer-v4.3.0-linux-amd64.tar.gz
kairos-installer-v4.3.0-linux-arm64-fips.tar.gz
kairos-installer-v4.3.0-linux-arm64.tar.gz
kairos-installer-v4.3.0-linux-riscv64.tar.gz
kairos-v4.3.0-linux-amd64-fips.tar.gz
kairos-v4.3.0-linux-amd64.tar.gz
kairos-v4.3.0-linux-arm64-fips.tar.gz
kairos-v4.3.0-linux-arm64.tar.gz
kairos-v4.3.0-linux-riscv64.tar.gz
kcrypt-challenger-v4.3.0-linux-amd64-fips.tar.gz
kcrypt-challenger-v4.3.0-linux-amd64.tar.gz
kcrypt-challenger-v4.3.0-linux-arm64-fips.tar.gz
kcrypt-challenger-v4.3.0-linux-arm64.tar.gz
kcrypt-challenger-v4.3.0-linux-riscv64.tar.gz
provider-kairos-v4.3.0-linux-amd64-fips.tar.gz
provider-kairos-v4.3.0-linux-amd64.tar.gz
provider-kairos-v4.3.0-linux-arm64-fips.tar.gz
provider-kairos-v4.3.0-linux-arm64.tar.gz
provider-kairos-v4.3.0-linux-riscv64.tar.gz
```

`checksums.txt` covers the tool archives, not the ISOs, and no `.bundle`,
`.sig` or `.pem` sits beside it, so it is not signed. No SPDX or SBOM file
appears anywhere in the release.

```sh
curl -sL https://github.com/kairos-io/kairos/releases/download/v4.3.0/checksums.txt | head -n 5
```

Our output, 2026-10-25:

```
0d7980da51876591694f809a8879f4ce3e6e46251fd0db842aaabf04c4ec95a3  kairos-installer-v4.3.0-linux-arm64.tar.gz
1f76f137c21d24d8a8110ac8eac6b2280a58310ef459efe43410666855fa65db  kcrypt-challenger-v4.3.0-linux-arm64-fips.tar.gz
24f2f749e113a751f996631ee847bb5c2b780e8f5e763e7c5451a366c7d6a246  provider-kairos-v4.3.0-linux-riscv64.tar.gz
2f79fee2689bc9a7ee1239fa3e20cecc8866707de9064c12751efcdb399bda25  provider-kairos-v4.3.0-linux-amd64-fips.tar.gz
38d24bc5e2a8c2ee368145b4a987e7c9fd5c148c49eca3325209e90a5e6ef041  kairos-v4.3.0-linux-riscv64.tar.gz
```

## Signature

`published`, established 2026-10-25. Each `.sha256.bundle` is a Sigstore
bundle whose signed digest is the sha256 of the sidecar itself, so the
signature is over the checksum, one artefact at a time.

```sh
curl -sL https://github.com/kairos-io/kairos/releases/download/v4.3.0/kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256 | sha256sum
curl -sL https://github.com/kairos-io/kairos/releases/download/v4.3.0/kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256.bundle \
  | python3 -c 'import sys,json,base64; b=json.load(sys.stdin); print(b.get("mediaType")); print(base64.b64decode(b["messageSignature"]["messageDigest"]["digest"]).hex())'
```

Our output, 2026-10-25: the first command and the second line of the second
print the same digest.

```
30caae4d75f914f2c096e00d3a0cb9bbb1858aedd47d115f5867c94cce3e92a7  -
application/vnd.dev.sigstore.bundle.v0.3+json
30caae4d75f914f2c096e00d3a0cb9bbb1858aedd47d115f5867c94cce3e92a7
```

The certificate in the bundle is keyless and bound to the release workflow:

```sh
curl -sL https://github.com/kairos-io/kairos/releases/download/v4.3.0/kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256.bundle \
  | python3 -c 'import sys,json,base64; v=json.load(sys.stdin)["verificationMaterial"]; c=v.get("certificate") or v["x509CertificateChain"]["certificates"][0]; sys.stdout.buffer.write(base64.b64decode(c["rawBytes"]))' \
  | openssl x509 -inform DER -noout -ext subjectAltName
```

Our output, 2026-10-25:

```
X509v3 Subject Alternative Name: critical
    URI:https://github.com/kairos-io/kairos/.github/workflows/reusable-factory.yaml@refs/tags/v4.3.0
```

Full verification with cosign, against that identity. With cosign v2.4.1 a
v0.3 bundle needs `--new-bundle-format`; without it cosign reports that the
bundle contains no certificate. cosign reads local files, so fetch the sidecar
and its bundle first:

```sh
curl -sLO https://github.com/kairos-io/kairos/releases/download/v4.3.0/kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256
curl -sLO https://github.com/kairos-io/kairos/releases/download/v4.3.0/kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256.bundle
cosign verify-blob --new-bundle-format \
  --bundle kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256.bundle \
  --certificate-identity https://github.com/kairos-io/kairos/.github/workflows/reusable-factory.yaml@refs/tags/v4.3.0 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256
```

Our output, 2026-10-25:

```
Verified OK
```

### The publisher's instructions describe a different release

The publisher's verification page tells the reader to fetch `.sha256.sig` and
`.sha256.pem` and to verify against the identity
`.github/workflows/reusable-release.yaml`. Neither matches `v4.3.0`. The
release carries no `.sig` and no `.pem` for its ISOs, only the bundles listed
above, and its certificate names `reusable-factory.yaml`. A reader who follows
the instructions exactly is refused, although the signature is valid:

```sh
cosign verify-blob --new-bundle-format \
  --bundle kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256.bundle \
  --certificate-identity https://github.com/kairos-io/kairos/.github/workflows/reusable-release.yaml@refs/tags/v4.3.0 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256
```

Our output, 2026-10-25:

```
Error: failed to verify certificate identity: no matching CertificateIdentity found, last error: expected SAN value "https://github.com/kairos-io/kairos/.github/workflows/reusable-release.yaml@refs/tags/v4.3.0", got "https://github.com/kairos-io/kairos/.github/workflows/reusable-factory.yaml@refs/tags/v4.3.0"
```

This does not change the verdict: the signature is published and verifies.
It is recorded because a verification path that only works for someone who
already knows to read the certificate is weaker than the one the publisher
describes, and because looking for the documented format is how a reader
would conclude, wrongly, that the signature is missing. This catalog made the
same mistake with Talos Linux on 2026-09-11.

Source: <https://kairos.io/docs/installation/check-the-signatures/>, read
2026-10-25.

## SBOM

`not found` as a release asset, established 2026-10-25. The publisher states
that SBOM lists are pushed as release assets and gives an example for
`v4.1.2`. Neither `v4.3.0` nor `v4.1.2` carries an SPDX or SBOM file among its
assets. The full asset listing for `v4.3.0` is in the Integrity section; for
`v4.1.2`:

```sh
curl -sL https://github.com/kairos-io/kairos/releases/expanded_assets/v4.1.2 \
  | grep -oE 'releases/download/v4\.1\.2/[^"]+' | sed 's|.*/||' | sort -u | grep -E 'spdx|sbom'
```

Our output, 2026-10-25: empty.

```sh
curl -sIo /dev/null -w '%{http_code}\n' -L https://github.com/kairos-io/kairos/releases/download/v4.1.2/kairos-hadron-v0.4.0-core-amd64-generic-v4.1.2-sbom.spdx.json
```

Our output, 2026-10-25:

```
404
```

The same page describes SBOM attestations attached to the container images and
verified with `cosign verify-attestation`. Those are `not examined`: this page
checks what is released next to the installable artefacts.

Source: <https://kairos.io/docs/reference/image_matrix/>, read 2026-10-25.

## Transparency log

`published`, established 2026-10-25. The bundle over the sidecar contains a
Rekor log entry, and the cosign verification above checks it.

```sh
curl -sL https://github.com/kairos-io/kairos/releases/download/v4.3.0/kairos-hadron-v0.5.1-core-amd64-generic-v4.3.0.iso.sha256.bundle \
  | python3 -c 'import sys,json; e=json.load(sys.stdin)["verificationMaterial"]["tlogEntries"][0]; print(e["logIndex"], e["kindVersion"])'
```

Our output, 2026-10-25:

```
2755351328 {'kind': 'hashedrekord', 'version': '0.0.1'}
```

## Expected measurements

`none to publish`, established 2026-10-25. Measured boot in Kairos is part of
an optional Trusted Boot mode built on unified kernel images. The UKI is
signed with Secure Boot keys and user data is encrypted under PCR policies.
The keys, including the private key that signs the PCR policy, are generated
by the operator, and the operator builds the UKI installation medium. The
released ISOs are not UKI images: no `-uki` artefact appears in the `v4.3.0`
listing.

As with Talos Linux, the expected values exist but are produced on the
operator's side and bound to the operator's key, and they are consumed by the
disk unlock policy. There is nothing for the publisher to issue. This is a
design in which the reference is operator-produced by construction, not a
case of withholding.

Sources: <https://kairos.io/docs/architecture/trustedboot/>,
<https://kairos.io/quickstart/trusted-boot/>, read 2026-10-25.

## L3 reference set

`none to publish`, established 2026-10-25. The release carries
`kcrypt-challenger`, a server that releases a disk encryption key to a
TPM-equipped node. Remote attestation for it, a TPM quote over a selectable
set of PCRs, is under development in the publisher's tracker: issue
`kairos-io/kairos#2988` and a draft pull request in `kairos-io/tpm-helpers`,
as seen on 2026-10-25. Wherever it lands, the verifier and the reference
values it compares against are run by the operator, so the publisher again has
nothing to issue. The challenger code shipped in `v4.3.0` is `not examined`.

Source: <https://github.com/kairos-io/tpm-helpers/pull/7>, read 2026-10-25.

## Independent rebuild

`not examined`.

## Check history

| Date | What was checked | Result |
| --- | --- | --- |
| 2026-10-25 | Integrity, signature, SBOM, transparency log, expected measurements, L3, against `v4.3.0` | First pass. Integrity and signature published per artefact; the publisher's verification instructions name a format and a workflow identity that `v4.3.0` does not use. SBOM not found as a release asset in `v4.3.0` or in `v4.1.2`, the release the documentation cites. Expected measurements and L3: operator-produced by construction |
