# Duo Experience

**Your screen is the device.** An independent fullscreen foldable-phone parody built with Next.js, Rust, and WebAssembly.

## Experience

- The browser viewport becomes a fictitious foldable operating-system home screen (no nested phone mockup).
- Open mock apps: messages, browser, photos, camera, notes.
- **App optimization** mode deliberately renders a narrow, poorly scaled mock app.
- **Screen crack** mode progressively draws a center crease, spider cracks, OLED bleed and dead pixel strip using CSS and inline SVG.
- Tap the center of the screen to deepen the fictional damage. Fold and unfold to advance the simulation.
- Use fullscreen and hide controls for an immersive mobile-screen experience.
- Rust `duo-core` state machine drives the fold and damage state; TypeScript fallback enables preview without WASM.

**All screen defects and app compatibility problems are fictional UI effects** and do not report actual defects of any real Apple, Samsung, or other product. This project is independent and unaffiliated.

## Local development

Requires Node 22+, pnpm 10+, Rust and wasm-pack.

```sh
corepack enable
pnpm install
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
pnpm wasm:build
pnpm dev
```

When the engine badge shows **RUST / WASM**, the compiled Rust state machine is active. Without a WASM build it clearly shows **TS FALLBACK**.

## Validation

```sh
cargo test --workspace
pnpm --dir apps/web typecheck
pnpm build
```

Build order matters: generate WASM before the static export. Publish `apps/web/out` to Cloudflare Pages/Workers Static Assets or another static host. See `docs/deployment.md`.
