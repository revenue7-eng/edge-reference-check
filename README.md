# edge-reference-check

Browser-side verification of edge Linux systems against published references.

Everything runs in the browser. The page has no backend, stores nothing,
and forgets the bundle when the tab closes. What you paste stays on your
machine.

## What it checks, and what that proves

Verification has three levels. Each level proves strictly more than the
one below, and each requires strictly more from the operating system's
publisher.

| Level | What you bring | What the page does | What it proves |
| --- | --- | --- | --- |
| 1 | A bundle collected on the device with `collect.sh` | Compares kernel config, boot parameters, LSM state and mapper state against a profile | The configuration **as the system reported it** |
| 2 | Your image and measurements, plus the publisher's reference | Compares your image hash and expected measurements against the published reference | The image on disk matches what was published |
| 3 | A signed attestation envelope from the device, the device public key, and a reference set | Verifies the envelope signature and checks the attested measurement against the reference set | The measured boot state is one the reference set recognises |

Level 1 is available for any Linux system. Levels 2 and 3 are available
only for (operating system, platform) pairs whose publisher has released a
reference. The catalog records which have.

Level 3 does not adjudicate freshness. Freshness in a counter-based
protocol requires state kept between checks, and this page keeps none.
That decision belongs to a verifier, not to a web page.

## Quick start

1. On the device, run `collect.sh` as root. It writes one text file and
   prints its path and SHA-256.
2. Open `docs/index.html` (or the published page) and paste the bundle.
3. Pick a profile. The built-in profile is an editorial hardened-edge
   baseline; a publisher's profile can be loaded from a JSON file.
4. Read the result. Every row is OK, FAIL, UNAVAILABLE or NOT APPLICABLE.
   UNAVAILABLE means the device did not expose that fact. NOT APPLICABLE
   means the profile expects that interface to be closed on this kind of
   system. Neither is a failure.

## Repository layout

- `collect.sh`: bundle collector, POSIX sh, BusyBox-safe.
- `profiles/`: profile schema and profiles. A profile is data, not code.
- `docs/`: the site, published with GitHub Pages.
- `docs/check.html`: the check itself. One file, no dependencies, no build
  step, and no code from the rest of this repository.
- `docs/methodology.md`: what each level means, what counts as a published
  reference, and the rules this project holds itself to.
- `docs/catalog.md`: which (OS, platform) pairs publish references, and at
  what level.

## Contributing a profile or a catalog row

A profile is a JSON file under `profiles/` that validates against
`profiles/schema.json`. A catalog row needs a source URL for every claim.
Claims without a source are not accepted.

## License

Apache-2.0. Maintained by TactiQ AI.
