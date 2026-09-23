#!/bin/sh
# Rebuild docs/assets/l3/erc_level3.wasm from source and print its SHA-256.
#
#   ./wasm/build.sh          rebuild and overwrite the committed file
#   ./wasm/build.sh --check  rebuild into a temporary file and compare with the
#                            committed one; exit 1 on any difference
#
# Toolchain and dependencies are pinned (rust-toolchain.toml, Cargo.lock). Paths
# that differ between machines are remapped, so the same inputs give the same bytes.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
repo=$(dirname "$here")
cargo_home=${CARGO_HOME:-$HOME/.cargo}
out="$repo/docs/assets/l3/erc_level3.wasm"

cd "$here"
RUSTFLAGS="--remap-path-prefix=$cargo_home=/cargo --remap-path-prefix=$here=/src" \
    cargo build --locked --release --target wasm32-unknown-unknown
built="$here/target/wasm32-unknown-unknown/release/erc_level3.wasm"

if [ "${1:-}" = "--check" ]; then
    if cmp -s "$built" "$out"; then
        echo "reproduced: $(sha256sum "$out" | cut -d' ' -f1)"
    else
        echo "DIFFERS: committed $(sha256sum "$out" | cut -d' ' -f1), rebuilt $(sha256sum "$built" | cut -d' ' -f1)" >&2
        exit 1
    fi
else
    cp "$built" "$out"
    chmod 644 "$out"
    sha256sum "$out" | cut -d' ' -f1 > "$out.sha256"
    echo "wrote $out: $(cat "$out.sha256")"
fi
