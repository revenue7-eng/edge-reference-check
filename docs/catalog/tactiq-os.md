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
last_checked: 2026-10-13
---

# TactiQ OS

Pairs covered by this page: TactiQ OS on Radxa ROCK 5A (RK3588S).

This is the system maintained by this project. It appears here on the same
terms as any other, is described in the same words, and is not marked up for
being ours. Two of the sections below record defects found while running this
catalog's own procedure against our own release.

Verdicts refer to release `v2.1.0-rc14` and were last re-established against it
on 2026-10-13. The page was keyed to `v2.1.0-rc13` from 2026-09-28 until then, to
`v2.1.0-rc11` from 2026-09-22, and to `v2.1.0-rc10` before that. What changed with `v2.1.0-rc11` was the Expected
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

Our output, 2026-10-13:

```
location: https://github.com/revenue7-eng/tactiq-os/releases
```

The redirect goes to `/releases`, not to a tag. Tags have to be read from the
list instead, and the most recent is `v2.1.0-rc14`. This is a defect in how
this system publishes, recorded here rather than quietly worked around.

The publisher's README states that `latest` is not used while every release is
a candidate, that verification addresses a named tag, and that the rule is
lifted at general availability. That documents the behaviour; it does not
change it. A reader arriving at an empty `latest` can now find out why from the
publisher rather than from us. The empty redirect itself stands until a release
that is not a candidate is published, and it has now been observed against
five tags.

## Integrity

`published`, established 2026-09-13, re-established against `v2.1.0-rc14` on
2026-10-13. The release carries `SHA256SUMS` covering twenty-eight artefacts,
including the image, the kernel, the device tree, the SBOM, the CVE reports of
the image and of the bootloader, an OTA bundle, a verity reference, a
build-configuration snapshot, the coverage manifest, the boot measurement
reference with its inputs, the signed reference integrity manifest, and the L3
evidence archive with its procedure and script.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc14
curl -sL $B/SHA256SUMS -o SHA256SUMS
wc -l < SHA256SUMS
sha256sum SHA256SUMS
```

Our output, 2026-10-13:

```
28
1e73d8209e2c402506a4e4b2cbbd5946d918251478bddf4ae4dd46408044bb2e
```

The checksum file does not list itself, its signature or its certificate, which
is correct: those are verified by the signature, not by the list.

Five artefacts are new against `v2.1.0-rc13`, which carried twenty-three.
`l3-evidence-rc14.tar.gz`, `VERIFY-L3-rc14.md` and `verify-l3-rc14.sh` are the
device evidence and the procedure that checks it, described under L3 reference
set below; in `v2.1.0-rc13` they were attached to the release outside the
signed list. `cve-loader-rock5a.sbom-cve-check.yocto.json` is a CVE report for
the bootloader, which the image report does not cover. `check-layers-rc14.txt`
is the publisher's check of the layer set the build used against its lock file.
`v2.1.0-rc13` in turn added three artefacts to the twenty of `v2.1.0-rc11`.
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

`published`, established 2026-09-13, re-established against `v2.1.0-rc14` on
2026-10-13. `SHA256SUMS` is signed with a keyless Sigstore certificate issued
to the release workflow, and the signature verifies with nothing but `openssl`.

The certificate is served as PEM, as it has been since `v2.1.0-rc10`. The
signature asset is base64-encoded, so the two assets of the same signing event
need different handling: the commands below decode one and not the other.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc14
curl -sL $B/SHA256SUMS -o SHA256SUMS
curl -sL $B/SHA256SUMS.workflow.pem -o cert.pem
curl -sL $B/SHA256SUMS.workflow.sig | base64 -d > sig.der
openssl x509 -in cert.pem -noout -ext subjectAltName | tail -1
openssl x509 -in cert.pem -noout -issuer
openssl x509 -in cert.pem -noout -dates
openssl x509 -in cert.pem -pubkey -noout > pub.pem
openssl dgst -sha256 -verify pub.pem -signature sig.der SHA256SUMS
```

Our output, 2026-10-13:

```
URI:https://github.com/revenue7-eng/tactiq-os/.github/workflows/release-sign.yml@refs/tags/v2.1.0-rc14
issuer=O = sigstore.dev, CN = sigstore-intermediate
notBefore=Oct 13 07:04:45 2026 GMT
notAfter=Oct 13 07:14:45 2026 GMT
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
above names `v2.1.0-rc14` and a check against another release will name that
release instead.

## SBOM

`published`, established 2026-09-13, re-established against `v2.1.0-rc14` on
2026-10-13. `sbom-rock5a.spdx.json` is released alongside the image and is
covered by `SHA256SUMS`, so it is inside the signed set rather than sitting
next to it.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc14
curl -sL $B/sbom-rock5a.spdx.json -o sbom.json
sha256sum sbom.json
grep sbom-rock5a.spdx.json SHA256SUMS
```

Our output, 2026-10-13: the digest matches the line in `SHA256SUMS`.

```
53c965aafc49185a8f71a19f89eb321f3441f1d9946930e531ccf198cdf9839b  sbom.json
53c965aafc49185a8f71a19f89eb321f3441f1d9946930e531ccf198cdf9839b  sbom-rock5a.spdx.json
```

## Transparency log

`published`, established 2026-09-13, re-established against `v2.1.0-rc14` on
2026-10-13. The signing event is recorded in the public Rekor log and can be
looked up from the digest alone, without the release page and without this
project.

```sh
H=$(curl -sL https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc14/SHA256SUMS | sha256sum | cut -d' ' -f1)
curl -s -X POST -H 'Content-Type: application/json' -d "{\"hash\":\"sha256:$H\"}" https://rekor.sigstore.dev/api/v1/index/retrieve
```

Our output, 2026-10-13: one entry, UUID
`108e9186e8c5677a3a103d36919b6d5663694d12b085e359e1bb6d63026421d7229970b6e7472d7d`.
Fetching that entry gives log index `3242289473`, integrated 2026-10-13
07:04:46 UTC, over the same digest as above.

The integration time falls at the start of the ten-minute certificate window,
which is what ties the two together.

## Expected measurements

`published`, established 2026-09-22 against `v2.1.0-rc11`, re-established
against `v2.1.0-rc14` on 2026-10-13. The release carries
`pcr-reference-rock5a.json`: the SHA-256 values a device of this platform is
expected to report in TPM PCRs 0 to 9 after booting this release. PCRs 2, 3, 5
and 7 hold only a separator, so the layers that record something are 0, 1, 4,
6, 8 and 9. PCR 1 carries one value per A/B slot: from `v2.1.0-rc14` the
bootloader boots each slot with its own signed configuration, and the slot's
kernel command line sits in the device tree that is measured into PCR 1.

The verdict of this column is about what the publisher issues, and
`v2.1.0-rc11` was the first release of this system where anything existed to
issue: the platform now
measures its boot chain into a discrete TPM. The earlier `not yet` rested on
the absence of measurements, not on the absence of a document.

The reference is not asserted. The release also carries the inputs it is
derived from and the program that derives them, so a reader recomputes it
rather than trusting it, and the recomputation runs offline once the files are
downloaded. The bootloader of `v2.1.0-rc14` changed, and the command changed
with it: `extlinux-rock5a.conf` and `tactiq-boot-rock5a.env` are still released,
as found on the boot partition, but they take no part in the boot this
reference describes and are no longer inputs. The reference file says which
boot path it models.

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc14
for f in SHA256SUMS pcr-reference-rock5a.json mk-pcr-reference.py fitImage-rock5a \
         extlinux-rock5a.conf u-boot-rock5a.itb idbloader-rock5a.img \
         tactiq-boot-rock5a.env kernel-rock5a.bin rk3588s-rock-5a.dtb; do
  curl -sL $B/$f -o $f
done
sha256sum -c --quiet --ignore-missing SHA256SUMS; echo exit=$?
python3 -c 'import json; d=json.load(open("pcr-reference-rock5a.json")); print(d["format"], d["boot_path"])'
python3 mk-pcr-reference.py --fit fitImage-rock5a \
  --uboot u-boot-rock5a.itb --idbloader idbloader-rock5a.img \
  --image kernel-rock5a.bin --dtb rk3588s-rock-5a.dtb --out recomputed.json
cmp recomputed.json pcr-reference-rock5a.json; echo cmp-exit=$?
```

Our output, 2026-10-13: every downloaded file matches its line in
`SHA256SUMS`, and the recomputed reference is byte-identical to the published
one.

```
exit=0
tactiq-pcr-reference/2 bootm
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
`coverage-rock5a.v2.1.0-rc14.yaml` in the same release rather than found by us:
the first-stage bootloader is the unmeasured root of the chain and the SoC
fuses are not burned, so nothing authenticates that stage; and only the slot B
values have been observed on hardware. Nineteen quotes from one board running
this release, described under L3 reference set below, report a digest of PCR 0
to 9 equal to the one recomputed from the signed reference for slot B. The slot
A values remain computed only.

Source: <https://github.com/revenue7-eng/tactiq-os/releases/tag/v2.1.0-rc14>

## L3 reference set

`published`, established 2026-09-28 against release `v2.1.0-rc13`,
re-established against `v2.1.0-rc14` on 2026-10-13. The reference set is the
signed reference integrity manifest of the release (`rim-rock5a.json` with
`rim-rock5a.json.p7s`), which verifies to the publisher's release root. The
device half is `l3-evidence-rc14.tar.gz`: nineteen TPM quotes from one cold
start of the release image on one board, the public part of the attestation key
that signed them, the endorsement key certificate of the board's TPM with
copies of its Infineon issuers, and a registration record, signed by a separate
leaf under the same root, that binds the attestation key to that endorsement
key. The release carries `VERIFY-L3-rc14.md`, a procedure that uses OpenSSL,
tpm2-tools and Python and no software of the publisher, and
`verify-l3-rc14.sh`, which runs it.

Three things changed against `v2.1.0-rc13`. The archive, the procedure and the
script are now listed in `SHA256SUMS`, so they sit inside the Sigstore-signed
set. The archive also carries its own list of files, signed by a further leaf
under the release root whose only extended key usage is the evidence purpose,
so the evidence verifies to the root independently of Sigstore. And the
registration record now carries the revocation lists of the endorsement key
chain that were current when the publisher checked it; the procedure re-checks
them instead of taking the record's word.

We ran `verify-l3-rc14.sh` on 2026-10-13 in a clean directory, with the files
downloaded from the release:

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc14
curl -sL $B/verify-l3-rc14.sh -o verify-l3-rc14.sh
grep ' verify-l3-rc14.sh$' SHA256SUMS; sha256sum verify-l3-rc14.sh
bash verify-l3-rc14.sh
```

Our output, 2026-10-13: the script is the one listed in `SHA256SUMS`, and the
run ends as below. All nineteen quotes verify under the attestation key named
in the signed record, all nineteen match the slot B composite of the signed
reference set, and a record with one byte changed is rejected. The TPM firmware
version carried in every quote is 7.87.19691.2, which the procedure checks
against a minimum of 7.87.

```
e5a9c27c7e09f7d974efb2de11338ac38e735b48f8de55f30d76ecf326b8c19f  verify-l3-rc14.sh
e5a9c27c7e09f7d974efb2de11338ac38e735b48f8de55f30d76ecf326b8c19f  verify-l3-rc14.sh
...
PASS: 91   FAIL: 0   NOT ESTABLISHED: 12
NO CHECK FAILED. Read the NOT ESTABLISHED lines: they are not passes.
```

Infineon's server could not be reached from our network during the run, so the
copies of Infineon's CA certificates in the archive were used and pinned by
fingerprint, which the script reports as not established.

What this verdict does not cover, taken from the publisher's own procedure. The
attestation key was registered by the publisher on its own bench, and a reader
cannot replay that registration. The quotes carry no challenge of the
reader's, so freshness is not shown, which this page does not adjudicate in any
case. A revocation after the registration is not covered. A TPM reset is not by
itself evidence of a reboot. The device log shows the envelopes in it, not that
none are missing. The evidence covers one board. The coverage manifest of
`v2.1.0-rc14` lists the corresponding row as `partial`, for these reasons.

The in-browser check on this site follows the publisher's crate at commit
`8893034` and reads the reference set and envelopes of `v2.1.0-rc14` unchanged.
It was run on 2026-10-13 against the first quote of the archive,
`135576682496`, with the release root pinned: accepted, composite
`dc7051b201f970dbf438f9561975bb8801eb394170294417b05c4449e1283438`, and the
attestation key name it reports equals `ak_name` in the signed record. The other
eighteen quotes were not run through the page. The page does not verify the
registration record itself; the procedure above does.

Source: <https://github.com/revenue7-eng/tactiq-os/releases/tag/v2.1.0-rc14>

## Release root

Everything the publisher signs under L3 reference set chains to one
certificate, `release-root-r2.pem`. It is attached to the release but is not
listed in `SHA256SUMS`. Inside the signed set it is bound twice:
`rim-rock5a.json` carries the SHA-256 of its public key, and the coverage
manifest carries its fingerprint. That ties the root to the Sigstore signature
of the tag, so a root swapped on the release page after signing is caught. It
does not tie the root to anything outside the publisher's repository: whoever
controls the repository from the start controls both.

The fingerprint, for a reader confirming it through a channel other than the
release page:

```
8E:10:04:1E:BB:FC:CB:A0:36:62:1B:2E:45:36:87:D2:9A:50:D7:15:65:F2:99:CB:41:28:B4:CE:B9:65:FF:E8
```

This page is not that channel. It is hosted under the same GitHub account as
the release, so it adds reach, not independence. The publisher prints the same
value in its measured-boot article on LinkedIn
(<https://www.linkedin.com/pulse/measured-boot-against-what-andrey-lazarev-j3kwc/>),
in an update dated 2026-09-29, and an independent verifier prints the value it observed at
<https://ankr.in/tactiq-verification.html>.

The root and the manifest that names it, directly:

- <https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc14/release-root-r2.pem>
- <https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc14/rim-rock5a.json>

```sh
B=https://github.com/revenue7-eng/tactiq-os/releases/download/v2.1.0-rc14
curl -sL $B/release-root-r2.pem -o root.pem
openssl x509 -in root.pem -noout -fingerprint -sha256
```

Our output, 2026-10-13:

```
sha256 Fingerprint=8E:10:04:1E:BB:FC:CB:A0:36:62:1B:2E:45:36:87:D2:9A:50:D7:15:65:F2:99:CB:41:28:B4:CE:B9:65:FF:E8
```

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
| 2026-09-29 | Release root | Not listed in `SHA256SUMS`; bound inside the signed set through `rim-rock5a.json` and the coverage manifest. Fingerprint added to this page, with the note that this page shares the release's GitHub account and is not a second channel |
| 2026-10-13 | Integrity, signature, SBOM, transparency log, expected measurements, re-run against `v2.1.0-rc14`, and the page re-keyed to that tag | All five `published`, verdicts unchanged. Twenty-eight artefacts against twenty-three in `v2.1.0-rc13`, the new ones being the L3 evidence archive with its procedure and script, a bootloader CVE report and a layer set check. The reference models the new bootloader path and is recomputed with fewer inputs; the recomputation is byte-identical to the published one. `latest` still redirects to the release list, observed against a fifth tag |
| 2026-10-13 | L3 reference set, against `v2.1.0-rc14` | `published`, verdict unchanged. `verify-l3-rc14.sh` run from the release files: 91 checks passed, none failed, 12 not established. Nineteen quotes, all matching slot B. The evidence is now inside `SHA256SUMS` and its own list is signed under the release root. Infineon's server was unreachable from our network, so the archive copies of its CA certificates were used, pinned by fingerprint |
| 2026-10-13 | In-browser L3 check, against `v2.1.0-rc14` | First quote of the archive accepted under the pinned release root; the reported attestation key name equals `ak_name` in the signed record. The other quotes were not run through the page |
| 2026-10-13 | Release root | Fingerprint re-read from the `v2.1.0-rc14` release assets, unchanged |
