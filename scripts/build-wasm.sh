#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
wasm-pack build "$ROOT/crates/duo-wasm" --target web --release --out-dir "$ROOT/packages/duo-wasm-pkg"
mkdir -p "$ROOT/apps/web/public/wasm"
cp "$ROOT/packages/duo-wasm-pkg/duo_wasm.js" "$ROOT/apps/web/public/wasm/"
cp "$ROOT/packages/duo-wasm-pkg/duo_wasm_bg.wasm" "$ROOT/apps/web/public/wasm/"
