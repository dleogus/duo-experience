# Duo Experience 배포 가이드

현재 구조는 Next.js `output: "export"` + Rust WASM 정적 파일이므로 **별도 API 서버 없이** Cloudflare Workers Static Assets에 배포합니다.

## 1. Cloudflare에서 준비

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 가입 및 로그인
2. Workers & Pages 사용 가능한 계정 준비
3. Cloudflare 프로필 또는 계정 페이지에서 **Account ID** 확인
4. [API Tokens](https://dash.cloudflare.com/profile/api-tokens)에서 **Edit Cloudflare Workers** 권한으로 범위가 제한된 토큰 생성
5. Cloudflare 계정에서 `*.workers.dev` 서브도메인을 활성화

토큰은 **GitHub 코드나 채팅에 붙여 넣지 마세요**.

## 2. GitHub Secrets 설정

레포지토리 > Settings > Secrets and variables > Actions > New repository secret 에서 두 항목 추가:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API 토큰
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID

GitHub Environment `production`을 사용할 수도 있습니다. 워크플로에서는 먼저 GitHub Actions secrets를 읽습니다.

## 3. 배포

`.github/workflows/deploy.yml`은 `master` 브랜치 push 및 수동 실행을 지원합니다.
PR을 `master`에 병합한 다음 Actions > Deploy to Cloudflare Workers > Run workflow를 실행하거나, 병합 시 자동 실행되는 워크플로의 성공을 확인합니다.

- Rust 단위 테스트 및 Clippy
- Rust → WASM 컴파일
- Next.js 정적 빌드
- Wrangler 업로드

완료 후 GitHub Actions 로그에 `https://duo-experience.<subdomain>.workers.dev` 형태의 주소가 표시됩니다. 실제 주소는 Cloudflare 계정에서 발급되는 서브도메인에 따라 달라집니다.

## 4. 로컬에서 미리 확인

```bash
pnpm install
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
pnpm build
npx wrangler@4 dev --config wrangler.jsonc
```

실제 Cloudflare에 직접 배포하려면 `npx wrangler@4 login` 후 `npx wrangler@4 deploy`를 실행합니다.

## 운영 주의사항

- `master` 배포가 공개 프로덕션으로 연결됩니다. PR은 먼저 CI 통과를 확인하세요.
- `duo-experience` Worker 이름이 계정 내 기존 Worker와 충돌하면 `wrangler.jsonc`에서 이름을 변경하세요.
- GitHub Secrets가 빠져 있으면 배포 작업이 명시적 오류로 실패합니다. 코드 문제는 아닙니다.
- 최초 배포에서는 Workers 서브도메인 활성화 또는 추가 권한 설정이 필요할 수 있습니다.
- Chrome 모바일 에뮬레이션 외에 실제 iOS Safari/Galaxy Chrome 점검을 권장합니다.
- 이 프로젝트는 Apple·Samsung 공식 서비스가 아닌 비공식 풍자 시뮬레이터입니다.
