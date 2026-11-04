# Duo Experience

비공식 풍자형 폴더블폰 웹 시뮬레이터. 실제 Apple/Samsung 제품 또는 공식 서비스가 아닙니다.

## Tech
- Next.js + TypeScript: UI
- Rust (`duo-core`): 기기 상태 머신
- wasm-bindgen (`duo-wasm`): 브라우저 연동
- Static export: 서버 없이 배포 가능

## Local development
Requirements: Node.js 22+, pnpm 10+, Rust stable, `wasm32-unknown-unknown`, `wasm-pack`.

```bash
corepack enable
pnpm install
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
pnpm build:wasm
pnpm dev
```
Visit http://localhost:3000.

## Tests and build
```bash
cargo test --workspace
cargo clippy --workspace --all-targets -- -D warnings
pnpm check
pnpm build
```

Static output: `apps/web/out/`. Upload this directory to static hosting.

## Notes
- In development without a compiled WASM module, the browser UI falls back to TypeScript. The engine indicator shows which engine is active.
- Fold count and issue scenarios are fictional interactive examples, **not** hardware reliability estimates.
- This MVP does not contain verified claims about unreleased/rumored devices. Research-backed claims should include dated sources before release.
