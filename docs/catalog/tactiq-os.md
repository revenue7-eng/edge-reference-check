---
title: TactiQ OS
layout: default
parent: Catalog
nav_order: 1
platforms: Radxa ROCK 5A (RK3588S)
l1: not yet
l2_identity: published
l2_measurements: published
l3: published
last_checked: 2026-09-28
---

# TactiQ OS

Pairs covered by this page: TactiQ OS on Radxa ROCK 5A (RK3588S).

This is the system maintained by this project. It appears here on the same
terms as any other, is described in the same words, and is not marked up for
being ours. Two of the sections below record defects found while running this
catalog's own procedure against our own release.

Verdicts refer to release `v2.1.0-rc13` and were last re-established against it
on 2026-09-28. The page was keyed to `v2.1.0-rc11` from 2026-09-22 until then, and to
`v2.1.0-rc10` before that. What changed with `v2.1.0-rc11` was the Expected
measurements column: the publisher now issues the boot measurements a
device of this platform is expected to produce, together with the inputs and
the program that recompute them. Published artefacts are never replaced after
the fact, so the assets of the earlier tags still behave as the earlier
versions of this page described.

## How to find the release at all

`/releases/latest` does not resolve to a release. Every release of this system
is marked as a pre-release, so the conventional entry point redirects to the
list and a reader following it gets nothing.

```sh
curl -sI https://github.com/revenue7-eng/tactiq-os/releases/latest | grep -i ^location
```

Our output, 2026-09-28:

```
location: https://github.com/revenue7-eng/tactiq-os/releases
```

The redirect goes to `/releases`, not to a tag. Tags have to be read from the
list instead, and the most recent is `v2.1.0-rc13`. This is a defect in how
this system publishes, recorded here rather than quietly worked around.

The publisher's README states that `latest` is not used while every release is
a candidate, that verification addresses a named tag, and that the rule is
lifted at general availability. That documents the behaviour; it does not
change it. A reader arriving at an empty `latest` can now find out why from the
publisher rather than from us. The empty redirect itself stands until a release
that is not a candidate is published, and it has now been observed against
four tags.

## Integrity

`published`, established 2026-09-13, re-established against `v2.1.0-rc13` on
2026-09-28. The release carries `SHA256SUMS` covering twenty-three artefacts,
including the image, the kernel, the device tree, the SBOM, the CVE reports, an
OTA bundle, a verity reference, a build-configuration snapshot, the coverage
manifest, the boot measurement reference with its inputs, and the signed
reference integrity manifest.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc13
curl -sL $B/SHA256SUMS -o SHA256SUMS
wc -l < SHA256SUMS
sha256sum SHA256SUMS
```

Our output, 2026-09-28:

```
23
0fed92ca1c49e992b3bab8622df1e3f7fabd931f7670088fe9a037c010bf7357
```

The checksum file does not list itself, its signature or its certificate, which
is correct: those are verified by the signature, not by the list.

Three artefacts are new against `v2.1.0-rc11`, which carried twenty.
`rim-rock5a.json` and `rim-rock5a.json.p7s` are the signed reference
integrity manifest described under L3 reference set below;
`tactiq-release-rock5a` is a short text file naming the version, the build
machine and the release tag. The coverage manifest is renamed with the tag.
`v2.1.0-rc11` in turn added seven artefacts to the thirteen of `v2.1.0-rc10`:
six belonging to the boot measurement reference, and `buildinfo-rock5a.json`,
a snapshot of the build configuration that produced the release.

`verity-rock5a.params` is still released. It carries the root hash of a
dm-verity tree over the image, which lets a consumer check blocks rather than
the whole file. This catalog holds no reference values of its own, so the file
is named and located here, not copied. It does not end with a newline: a copy
that acquires one hashes differently and looks like a mismatch when nothing is
wrong.

What that file is not is covered under Expected measurements below.

## Signature

`published`, established 2026-09-13, re-established against `v2.1.0-rc13` on
2026-09-28. `SHA256SUMS` is signed with a keyless Sigstore certificate issued
to the release workflow, and the signature verifies with nothing but `openssl`.

The certificate is served as PEM, as it has been since `v2.1.0-rc10`. The
signature asset is base64-encoded, so the two assets of the same signing event
need different handling: the commands below decode one and not the other.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc13
curl -sL $B/SHA256SUMS -o SHA256SUMS
curl -sL $B/SHA256SUMS.workflow.pem -o cert.pem
curl -sL $B/SHA256SUMS.workflow.sig | base64 -d > sig.der
openssl x509 -in cert.pem -noout -ext subjectAltName | tail -1
openssl x509 -in cert.pem -noout -issuer
openssl x509 -in cert.pem -noout -dates
openssl x509 -in cert.pem -pubkey -noout > pub.pem
openssl dgst -sha256 -verify pub.pem -signature sig.der SHA256SUMS
```

Our output, 2026-09-28:

```
URI:https://github.com/revenue7-eng/tactiq-os/.github/workflows/release-sign.yml@refs/tags/v2.1.0-rc13
issuer=O = sigstore.dev, CN = sigstore-intermediate
notBefore=Sep 28 08:36:58 2026 GMT
notAfter=Sep 28 08:46:58 2026 GMT
Verified OK
```

The certificate is valid for ten minutes. That is the point of keyless signing:
there is no long-lived private key to steal, and the evidence that the
signature was made inside that window lives in the transparency log rather than
in the certificate.

The identity in the certificate is the release workflow at the tag, not a
person. A reader checking this system should pin that identity: a signature
made by any other workflow, or from a branch instead of a tag, is a different
claim even though it verifies. The identity moves with the tag, so the URI
above names `v2.1.0-rc13` and a check against another release will name that
release instead.

## SBOM

`published`, established 2026-09-13, re-established against `v2.1.0-rc13` on
2026-09-28. `sbom-rock5a.spdx.json` is released alongside the image and is
covered by `SHA256SUMS`, so it is inside the signed set rather than sitting
next to it.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc13
curl -sL $B/sbom-rock5a.spdx.json -o sbom.json
sha256sum sbom.json
grep sbom-rock5a.spdx.json SHA256SUMS
```

Our output, 2026-09-28: the digest matches the line in `SHA256SUMS`.

```
a52a54c20b02fc930b072054c6d1c2603dbd6082c14d9d39ff37d4d2d51c0033  sbom.json
a52a54c20b02fc930b072054c6d1c2603dbd6082c14d9d39ff37d4d2d51c0033  sbom-rock5a.spdx.json
```

## Transparency log

`published`, established 2026-09-13, re-established against `v2.1.0-rc13` on
2026-09-28. The signing event is recorded in the public Rekor log and can be
looked up from the digest alone, without the release page and without this
project.

```sh
H=$(curl -sL https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc13/SHA256SUMS | sha256sum | cut -d' ' -f1)
curl -s -X POST -H 'Content-Type: application/json' -d "{\"hash\":\"sha256:$H\"}" https://rekor.sigstore.dev/api/v1/index/retrieve
```

Our output, 2026-09-28: one entry, UUID
`108e9186e8c5677a53d6ac9fffaeb976c58ce9486082fabf8d2a1172201fc2e12bb92e2fbd77c25e`.
Fetching that entry gives log index `2981654055`, integrated 2026-09-28
08:36:59 UTC, over the same digest as above.

The integration time falls at the start of the ten-minute certificate window,
which is what ties the two together.

## Expected measurements

`published`, established 2026-09-22 against `v2.1.0-rc11`, re-established
against `v2.1.0-rc13` on 2026-09-28. The release carries
`pcr-reference-rock5a.json`: the SHA-256 values a device of this platform is
expected to report in TPM PCRs 0, 1, 4, 6, 8 and 9 after booting this release.
PCR 1 carries one value per A/B slot, because the kernel command line differs
between them.

The verdict of this column is about what the publisher issues, and
`v2.1.0-rc11` was the first release of this system where anything existed to
issue: the platform now
measures its boot chain into a discrete TPM. The earlier `not yet` rested on
the absence of measurements, not on the absence of a document.

The reference is not asserted. The release also carries the five inputs it is
derived from and the program that derives them, so a reader recomputes it
rather than trusting it, and the recomputation runs offline once the files are
downloaded.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc13
for f in SHA256SUMS pcr-reference-rock5a.json mk-pcr-reference.py fitImage-rock5a \
         extlinux-rock5a.conf u-boot-rock5a.itb idbloader-rock5a.img \
         tactiq-boot-rock5a.env kernel-rock5a.bin rk3588s-rock-5a.dtb; do
  curl -sL $B/$f -o $f
done
sha256sum -c --quiet --ignore-missing SHA256SUMS; echo exit=$?
python3 mk-pcr-reference.py --fit fitImage-rock5a --extlinux extlinux-rock5a.conf \
  --uboot u-boot-rock5a.itb --idbloader idbloader-rock5a.img \
  --boot-env tactiq-boot-rock5a.env --image kernel-rock5a.bin \
  --dtb rk3588s-rock-5a.dtb --out recomputed.json
cmp recomputed.json pcr-reference-rock5a.json; echo cmp-exit=$?
```

Our output, 2026-09-28: every downloaded file matches its line in
`SHA256SUMS`, and the recomputed reference is byte-identical to the published
one.

```
exit=0
cmp-exit=0
```

What the reference covers, in the publisher's own words and confirmed by
reading it: the chain from the first stage bootloader to the kernel, its
command line and its device tree. The root filesystem is outside it.
That is the distinction this column exists for, and it is the reason
`verity-rock5a.params` under Integrity is a different kind of claim. A verity
root hash is a property of an artefact, recomputable by anyone holding the
file. Expected measurements are a property of a device.

Two limits a reader should carry, both stated by the publisher in
`coverage-rock5a.v2.1.0-rc13.yaml` in the same release rather than found by us:
the first-stage bootloader is the unmeasured root of the chain and the SoC
fuses are not burned, so nothing authenticates that stage; and the final values
of the release chain were computed and only partly observed on hardware,
because the production image has no console. What this column records is that
the publisher issues the values and the means to recompute them, which is now
the case.

The second limit is narrower than the coverage manifest of `v2.1.0-rc13`
states, because that manifest was signed before the device evidence under L3
reference set below existed. Two quotes from one board running this release
report a digest of PCR 0 to 9 equal to the one recomputed from the signed
reference for slot A. That is an observation of the slot A values on one
board, read through the TPM rather than through a console. The slot B values
remain computed only.

Source: <https://github.com/revenue7-eng/tactiq-os/releases/tag/v2.1.0-rc13>

## L3 reference set

`published`, established 2026-09-28 against release `v2.1.0-rc13`. Both halves
now exist. The reference set is the signed reference integrity manifest of the
release (`rim-rock5a.json` with `rim-rock5a.json.p7s`), which verifies to the
publisher's release root. The device half is attached to the same release as
`l3-evidence-rc13.tar.gz`: two TPM quotes from one board running the release,
the public part of the attestation key that signed them, the endorsement key
certificate of the board's TPM, and a registration record, signed by a separate
leaf under the same root, that binds the attestation key to that endorsement
key. The release also carries `VERIFY-L3-rc13.md`, a procedure that uses
OpenSSL, tpm2-tools and Python and no software of the publisher.

We ran that procedure on 2026-09-28 in a clean directory, from the release
assets and the archive. Every check passed. The endorsement key certificate
chains to Infineon's root; the attestation key in the archive is the one named
in the signed record; both quotes verify under it; and the attested digest of
PCR 0 to 9 equals the one recomputed from the signed reference set for slot A.
A record with one byte changed was rejected. Infineon's server could not be
reached from our network during the run, so the copies of Infineon's CA
certificates in the archive were used and pinned by fingerprint.

What this verdict does not cover, taken from the publisher's own procedure. The
attestation key was registered by the publisher on its own bench, under a
development image, and a reader cannot replay that registration. The quotes
carry no challenge of the reader's, so freshness is not shown, which this page
does not adjudicate in any case. Revocation of the endorsement key certificate
was not checked. The evidence covers one board. The coverage manifest of
`v2.1.0-rc13` still lists the corresponding row as `planned`, because it was
signed before the evidence existed; the release notes say so.

The in-browser check on this site was first built for an earlier envelope
format and could not read this one: it took a software key and had no input for
the quote. It now follows the publisher's crate at commit `8893034`, accepts
only quoted envelopes, and was run against this evidence on 2026-09-28: with
the release root pinned, both quotes are accepted, and the attestation key name
it reports equals `ak_name` in the signed record. A quote paired with the other
envelope is rejected at the quote signature. The page does not verify the
registration record itself; the procedure above does.

Source: <https://github.com/revenue7-eng/tactiq-os/releases/tag/v2.1.0-rc13>

## Independent rebuild

`not examined`. This is the next item for this page, and the only one of the
six that no publisher in this catalog has closed.

## Check history

| Date | What was checked | Result |
| --- | --- | --- |
| 2026-09-11 | Expected measurements | `not yet`, boot chain not closed on this platform |
| 2026-09-13 | Integrity, signature, SBOM, transparency log, against `v2.1.0-rc7` | All four `published`. Two defects recorded: no release is marked latest, and the certificate is published base64-encoded rather than as PEM |
| 2026-09-14 | Both defects, in the publisher's tree | Both addressed in source. The certificate is normalised to PEM from the next tag onwards; the empty `latest` is declared in the publisher's README instead of being undocumented |
| 2026-09-14 | Integrity, signature, SBOM, transparency log, re-run against `v2.1.0-rc10`, and the page re-keyed to that tag | All four `published`, verdicts unchanged. The certificate defect is confirmed gone: the asset is served as PEM and the decode step is dropped from the commands. The signature asset is still base64, so the two now need different handling and the commands say so. `latest` still redirects to the release list, observed against a second tag. Thirteen artefacts against eleven in `v2.1.0-rc7`, the new ones being an OTA bundle and a verity reference |
| 2026-09-14 | Expected measurements, against the release only | `not yet` holds. The publisher now issues a verity root hash for the artefact, which is not a boot measurement for the platform. The hardware state behind the 2026-09-11 verdict was not re-examined |
| 2026-09-22 | Integrity, signature, SBOM, transparency log, re-run against `v2.1.0-rc11`, and the page re-keyed to that tag | All four `published`, verdicts unchanged. Twenty artefacts against thirteen in `v2.1.0-rc10`. `latest` still redirects to the release list, observed against a third tag |
| 2026-09-22 | Expected measurements, against the release only | `published`. The release carries `pcr-reference-rock5a.json` with the five inputs and the program that derive it; recomputed from the downloaded files, byte-identical to the published reference |
| 2026-09-22 | L3 reference set | `not yet`. The reference set is published and signed, but no device produces a signed attestation envelope to check against it |
| 2026-09-28 | Integrity, signature, SBOM, transparency log, expected measurements, re-run against `v2.1.0-rc13`, and the page re-keyed to that tag | All five `published`, verdicts unchanged. Twenty-three artefacts against twenty in `v2.1.0-rc11`, the new ones being the signed reference integrity manifest with its signature and a release identification file. The reference recomputed from the downloaded inputs is byte-identical to the published one. `latest` still redirects to the release list, observed against a fourth tag |
| 2026-09-28 | L3 reference set, against `v2.1.0-rc13` | `published`. The publisher's procedure `VERIFY-L3-rc13.md` run in a clean directory from the release assets and `l3-evidence-rc13.tar.gz`: every check passed, a tampered record was rejected. Infineon's server was unreachable from our network, so the archive copies of its CA certificates were used, pinned by fingerprint. The in-browser check was not run |
| 2026-09-28 | In-browser L3 check, against `v2.1.0-rc13` | The check was rebuilt against the publisher's crate at `8893034` and now reads envelope v2 (quote, attestation key public area); envelope v1 is refused. Both quotes in `l3-evidence-rc13.tar.gz` accepted under the pinned release root; the reported attestation key name equals `ak_name` in the signed record. Verdict unchanged |
