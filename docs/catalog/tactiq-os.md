---
title: TactiQ OS
layout: default
parent: Catalog
nav_order: 1
platforms: Radxa ROCK 5A (RK3588S)
l1: not yet
l2_identity: published
l2_measurements: published
l3: not yet
last_checked: 2026-09-22
---

# TactiQ OS

Pairs covered by this page: TactiQ OS on Radxa ROCK 5A (RK3588S).

This is the system maintained by this project. It appears here on the same
terms as any other, is described in the same words, and is not marked up for
being ours. Two of the sections below record defects found while running this
catalog's own procedure against our own release.

Verdicts were established against release `v2.1.0-rc11`. The page was keyed to
`v2.1.0-rc10` until 2026-09-22. What changed with the newer release is the
Expected measurements column: the publisher now issues the boot measurements a
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

Our output, 2026-09-22:

```
location: https://github.com/revenue7-eng/tactiq-os/releases
```

The redirect goes to `/releases`, not to a tag. Tags have to be read from the
list instead, and the most recent is `v2.1.0-rc11`. This is a defect in how
this system publishes, recorded here rather than quietly worked around.

The publisher's README states that `latest` is not used while every release is
a candidate, that verification addresses a named tag, and that the rule is
lifted at general availability. That documents the behaviour; it does not
change it. A reader arriving at an empty `latest` can now find out why from the
publisher rather than from us. The empty redirect itself stands until a release
that is not a candidate is published, and it has now been observed against
three tags.

## Integrity

`published`, established 2026-09-13, re-established against `v2.1.0-rc11` on
2026-09-22. The release carries `SHA256SUMS` covering twenty artefacts,
including the image, the kernel, the device tree, the SBOM, the CVE reports, an
OTA bundle, a verity reference, a build-configuration snapshot, the coverage
manifest, and the boot measurement reference with its inputs.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc11
curl -sL $B/SHA256SUMS -o SHA256SUMS
wc -l < SHA256SUMS
sha256sum SHA256SUMS
```

Our output, 2026-09-22:

```
20
e7d3c8db149420ffb69f0a3b6d56db4d33cc408604b0db45c47f3b71bded4c7b
```

The checksum file does not list itself, its signature or its certificate, which
is correct: those are verified by the signature, not by the list.

Seven artefacts are new against `v2.1.0-rc10`, which carried thirteen. Six of
them belong to the boot measurement reference and are described under Expected
measurements below; the seventh is `buildinfo-rock5a.json`, a snapshot of the
build configuration that produced the release.

`verity-rock5a.params` is still released. It carries the root hash of a
dm-verity tree over the image, which lets a consumer check blocks rather than
the whole file. This catalog holds no reference values of its own, so the file
is named and located here, not copied. It does not end with a newline: a copy
that acquires one hashes differently and looks like a mismatch when nothing is
wrong.

What that file is not is covered under Expected measurements below.

## Signature

`published`, established 2026-09-13, re-established against `v2.1.0-rc11` on
2026-09-22. `SHA256SUMS` is signed with a keyless Sigstore certificate issued
to the release workflow, and the signature verifies with nothing but `openssl`.

The certificate is served as PEM, as it has been since `v2.1.0-rc10`. The
signature asset is base64-encoded, so the two assets of the same signing event
need different handling: the commands below decode one and not the other.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc11
curl -sL $B/SHA256SUMS -o SHA256SUMS
curl -sL $B/SHA256SUMS.workflow.pem -o cert.pem
curl -sL $B/SHA256SUMS.workflow.sig | base64 -d > sig.der
openssl x509 -in cert.pem -noout -ext subjectAltName | tail -1
openssl x509 -in cert.pem -noout -issuer
openssl x509 -in cert.pem -noout -dates
openssl x509 -in cert.pem -pubkey -noout > pub.pem
openssl dgst -sha256 -verify pub.pem -signature sig.der SHA256SUMS
```

Our output, 2026-09-22:

```
URI:https://github.com/revenue7-eng/tactiq-os/.github/workflows/release-sign.yml@refs/tags/v2.1.0-rc11
issuer=O = sigstore.dev, CN = sigstore-intermediate
notBefore=Sep 22 17:14:22 2026 GMT
notAfter=Sep 22 17:24:22 2026 GMT
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
above names `v2.1.0-rc11` and a check against another release will name that
release instead.

## SBOM

`published`, established 2026-09-13, re-established against `v2.1.0-rc11` on
2026-09-22. `sbom-rock5a.spdx.json` is released alongside the image and is
covered by `SHA256SUMS`, so it is inside the signed set rather than sitting
next to it.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc11
curl -sL $B/sbom-rock5a.spdx.json -o sbom.json
sha256sum sbom.json
grep sbom-rock5a.spdx.json SHA256SUMS
```

Our output, 2026-09-22: the digest matches the line in `SHA256SUMS`.

```
7601469a787fd45395e8c110e77a6ec252876c293cf0c24c52883d194bd592ab  sbom.json
7601469a787fd45395e8c110e77a6ec252876c293cf0c24c52883d194bd592ab  sbom-rock5a.spdx.json
```

## Transparency log

`published`, established 2026-09-13, re-established against `v2.1.0-rc11` on
2026-09-22. The signing event is recorded in the public Rekor log and can be
looked up from the digest alone, without the release page and without this
project.

```sh
H=$(curl -sL https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc11/SHA256SUMS | sha256sum | cut -d' ' -f1)
curl -s -X POST -H 'Content-Type: application/json' -d "{\"hash\":\"sha256:$H\"}" https://rekor.sigstore.dev/api/v1/index/retrieve
```

Our output, 2026-09-22: one entry, UUID
`108e9186e8c5677af2389cba1d15f0ed59f97f456f81a60a4661165951ad94b942756d9746dc08c8`.
Fetching that entry gives log index `2910068424`, integrated 2026-09-22
17:14:23 UTC, over the same digest as above.

The integration time falls at the start of the ten-minute certificate window,
which is what ties the two together.

## Expected measurements

`published`, established 2026-09-22, against `v2.1.0-rc11`. The release carries
`pcr-reference-rock5a.json`: the SHA-256 values a device of this platform is
expected to report in TPM PCRs 0, 1, 4, 6, 8 and 9 after booting this release.
PCR 1 carries one value per A/B slot, because the kernel command line differs
between them.

The verdict of this column is about what the publisher issues, and this is the
first release of this system where anything exists to issue: the platform now
measures its boot chain into a discrete TPM. The earlier `not yet` rested on
the absence of measurements, not on the absence of a document.

The reference is not asserted. The release also carries the five inputs it is
derived from and the program that derives them, so a reader recomputes it
rather than trusting it, and the recomputation runs offline once the files are
downloaded.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc11
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

Our output, 2026-09-22: every downloaded file matches its line in
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
`coverage-rock5a.v2.1.0-rc11.yaml` in the same release rather than found by us:
the first-stage bootloader is the unmeasured root of the chain and the SoC
fuses are not burned, so nothing authenticates that stage; and the final values
of the release chain were computed and only partly observed on hardware,
because the production image has no console. What this column records is that
the publisher issues the values and the means to recompute them, which is now
the case.

Source: <https://github.com/revenue7-eng/tactiq-os/releases/tag/v2.1.0-rc11>

## L3 reference set

`not yet`, established 2026-09-22. Level 3 asks for two things: a signed
reference set in a documented format, and a way for the device to produce a
signed attestation envelope that a reader can check against it. The first half
now exists in substance, since the reference ships inside the set covered by
`SHA256SUMS` and therefore by the release signature, and its format is carried
in the file itself and in the program that writes it. The second half does not:
no device of this platform produces a signed quote yet. The publisher's own
coverage manifest for this release says the same, and keeps the corresponding
row at `planned`.

This verdict moves when a device produces an envelope and a reader can check it
against the published reference without going through us.

Source: <https://github.com/revenue7-eng/tactiq-attest>

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
