# Duo Experience

**내가 보고 있는 화면이 바로 가상의 폴더블폰이 됩니다.**

Duo Experience는 **Next.js, Rust, WebAssembly(WASM)** 로 만든 비공식 폴더블폰 풍자 체험 프로젝트입니다. 웹페이지 안에 작은 휴대폰 모형을 띄우는 대신, 브라우저 화면 전체를 가상의 폴더블 디스플레이처럼 사용합니다.

**[실서비스 체험하기](https://duo-experience.ldh207424.workers.dev)**

## 주요 기능

- **몰입형 전체 화면:** 배경화면, 상태 표시줄, 위젯, 앱 아이콘, Dock으로 구성된 가상 홈 화면
- **가상 앱 실행:** 메시지, 브라우저, 사진, 카메라, 메모 앱 체험
- **앱 최적화 오류 연출:** 펼쳐진 화면에서 앱이 좁거나 어색하게 표시되는 상황을 의도적으로 표현
- **디스플레이 크랙 효과:** CSS와 SVG로 중앙 접힘 자국, 방사형 균열, OLED 번짐, 검은 화면 손상 등을 단계적으로 표시
- **터치 및 접기·펼치기:** 화면 중앙을 터치하거나 접었다 펼쳐 가상 손상 단계를 진행
- **몰입 모드:** 전체 화면으로 전환하거나 조작 패널을 숨겨 체험에 집중
- **Rust/WASM 기반 상태 관리:** 접힘 및 손상 상태를 Rust 상태 머신으로 관리하며, WASM이 준비되지 않은 환경에서는 TypeScript 대체 엔진으로 미리보기 제공

> **안내:** 이 프로젝트는 독립적으로 제작한 **비공식·가상 풍자 콘텐츠**입니다. 화면 파손과 앱 호환성 문제는 연출된 시각 효과이며, 실제 Apple·Samsung 등 특정 제조사 제품의 결함·내구성·고장 발생률을 나타내지 않습니다. 해당 제조사들과 제휴 관계가 없습니다.

## 기술 스택

| 구분 | 기술 | 역할 |
| --- | --- | --- |
| 프론트엔드 | Next.js, React, TypeScript | 화면 구성 및 사용자 인터랙션 |
| 시각 효과 | CSS, SVG | 접힘선·균열·OLED 손상 표현 |
| 상태 관리 | Rust (`duo-core`) | 접힘, 앱 전환, 손상 단계 관리 |
| 브라우저 연동 | WebAssembly, wasm-bindgen | Rust 상태 머신 실행 |
| 배포 | Cloudflare Workers Static Assets | 정적 사이트 호스팅 |

## 로컬 개발 환경 실행

### 사전 준비

- Node.js 22 이상
- pnpm 10 이상
- Rust 안정 버전(stable)
- wasm-pack

프로젝트 루트에서 다음 명령어를 실행합니다.

```bash
# pnpm 사용 준비
corepack enable

# 의존성 설치
pnpm install

# Rust WASM 빌드 타깃 추가
rustup target add wasm32-unknown-unknown

# wasm-pack 설치
cargo install wasm-pack --locked

# Rust → WebAssembly 빌드
pnpm build:wasm

# Next.js 개발 서버 실행
pnpm dev
```

브라우저에서 **http://localhost:3000** 에 접속하면 됩니다.

화면의 엔진 표기가 **`RUST / WASM`** 이면 Rust 엔진이 동작하는 상태입니다. WASM 빌드 파일이 없는 경우에는 **`TS FALLBACK`** 으로 표시되며 TypeScript 대체 엔진으로 화면을 미리 볼 수 있습니다.

## 테스트 및 빌드

```bash
# Rust 단위 테스트
cargo test --workspace

# TypeScript 타입 검사
pnpm --dir apps/web typecheck

# WASM 빌드 + Next.js 정적 빌드
pnpm build
```

실제 브라우저 테스트는 Playwright를 사용하며, GitHub Actions CI에서 실행합니다.

## 프로젝트 구조

```text
duo-experience/
├── apps/web/             # Next.js 웹 애플리케이션
├── crates/
│   ├── duo-core/         # Rust 상태 머신
│   └── duo-wasm/         # WebAssembly 연동 계층
├── scripts/              # WASM 빌드 스크립트
├── docs/                 # 배포 가이드
└── .github/workflows/    # CI 및 운영 배포 자동화
```

## 배포

이 프로젝트는 Next.js의 정적 내보내기(`output: "export"`)를 사용합니다. **WASM을 먼저 빌드한 뒤** 생성된 `apps/web/out` 디렉터리를 정적 호스팅 환경에 배포합니다.

현재는 `master` 브랜치에 변경 사항이 반영되면 GitHub Actions가 **Cloudflare Workers** 운영 배포를 실행하도록 구성되어 있습니다.

Cloudflare 계정 및 GitHub Secrets 설정 방법은 **[배포 가이드](docs/deployment.md)** 를 참고하세요.

---

**Duo Experience** — 접고, 펼치고, 균열을 체험하는 가상의 폴더블 디스플레이.
