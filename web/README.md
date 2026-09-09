# PULSE BOX 웹

랜딩 + 개인정보 처리방침. Netlify 로 배포한다.

## 왜 별도 package.json 인가

모바일 앱과 npm workspaces 로 묶지 않았다. 둘이 공유할 코드가 없고, 묶으면
Expo 가 호이스팅된 `node_modules` 를 못 찾아 `metro.config.js` 에
`watchFolders` / `nodeModulesPaths` 를 따로 잡아줘야 한다. 출시 직전의
안드로이드 빌드를 건드릴 이유가 없다.

디자인 토큰은 `src/tokens.css` 에 **복사**돼 있다 (앱의 `src/theme/tokens.ts`
와 같은 값). 값이 바뀌면 두 곳을 같이 고쳐야 한다.

## 왜 SPA 가 아닌가

Vite MPA 로 빌드해 `/privacy/` 가 실제 파일이 된다. Play Console 이 개인정보
처리방침 URL 을 검증하는데, SPA 폴백이 어긋나면 심사에서 막힌다. 그 URL 이
이 사이트의 존재 이유라 리다이렉트에 의존하지 않는다.

## 개발

```
npm install
npm run dev              # http://localhost:5173
npm run build            # tsc --noEmit && vite build → dist/
npm run preview          # 빌드 결과 확인
npm run verify:isolated  # Netlify 와 같은 조건으로 빌드 (아래 참고)
```

### 로컬 빌드 통과를 믿지 말 것

`web/` 이 RN 저장소 안에 있어서, 로컬에서 `tsc` 는 타입을 찾을 때 **상위
디렉터리의 `node_modules/@types` 까지 올라간다**. 그래서 `web/package.json` 에
빠진 의존성이 있어도 로컬에서는 통과하고 Netlify 에서만 깨진다.

첫 배포가 정확히 이것 때문에 실패했다 — `@types/node` 가 선언돼 있지 않았는데
루트(Expo 앱)의 것이 새어 들어와 로컬 빌드가 통과했다.

`npm run verify:isolated` 는 `web/` 만 임시 디렉터리에 복사해 `npm ci` 후
빌드한다. 의존성을 건드렸으면 푸시 전에 이걸 돌린다.

`tsconfig.json` 의 `typeRoots` 도 `./node_modules/@types` 로 못박아 두었다.
그래서 `vite/client` 대신 `src/vite-env.d.ts` 에서 CSS 선언만 직접 한다.

## 배포

저장소 루트의 `netlify.toml` 이 `base = "web"` 을 잡는다. 모바일 앱 쪽 변경은
배포를 트리거하지 않는다.

Netlify 에서 GitHub 저장소를 연결하면 나머지 설정(빌드 명령 · publish 경로 ·
Node 버전)은 `netlify.toml` 에서 읽는다.

## 처방침 내용을 고칠 때

`src/pages/Privacy.tsx` 의 내용은 앱 코드에서 확인한 사실만 담는다. 고치면
`store/README.md` 의 데이터 보안 양식 대응표도 같이 맞춰야 한다 — Play 는
둘이 어긋나면 문제 삼는다. 상단 `UPDATED` 개정일도 함께 올린다.
