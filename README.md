# PULSE BOX

Android 기능성 피트니스 인터벌 타이머. TABATA · AMRAP · EMOM · FOR TIME.

운동과 휴식, 완주가 서로 완전히 다른 소리로 울린다. 화면을 보지 않아도 지금
무엇이 시작됐는지 들리는 것이 이 앱의 요구사항이다.

```
├── app/        expo-router 라우트 8개 (디자인 15개 화면)
├── src/
│   ├── core/   순수 로직. RN import 0개
│   ├── theme/  디자인 토큰 · 타이포 · 글자 크기
│   ├── store/  zustand + AsyncStorage
│   └── ...     components · hooks · services · i18n
├── web/        랜딩 + 개인정보 처리방침 (Vite, Netlify)
├── design/     디자인 캔버스 원본 (추출본)
├── docs/       설계 스펙
└── store/      Play Console 업로드 자산
```

## 타이머 엔진

`src/core/timer` 는 React 도 React Native 도 모른다. 클럭을 인자로 받는 순수
함수라, 시간에 얽힌 모든 규칙을 유닛 테스트로 고정할 수 있다. 이 앱의 유일한
진짜 리스크가 시간 정확도이므로 그 리스크를 테스트 가능한 한 곳에 모았다.

모드는 **세그먼트 리스트로 컴파일**되고, 엔진은 상태를 저장하지 않고 파생한다.

```ts
compile(config): Segment[]                    // 4모드 → 세그먼트
derive(segments, anchor, now): TimerState     // 매 틱 파생
```

앵커는 3개 값뿐이다.

```ts
{ startedAt, pausedTotalMs, pausedAt }
```

`effNow = pausedAt ?? now` 로 계산하기 때문에

- **일시정지가 별도 코드 경로를 타지 않는다.** 멈춰 있으면 시간이 고정된다
- **백그라운드 복귀 보정이 공짜다.** `now` 를 다시 읽는 것이 곧 보정이다
- 회전해도 타이머가 끊기지 않는다 (`configChanges` 에 `orientation` 이 있어
  액티비티가 재생성되지 않고, 앵커가 살아 있다)

## 실행

```bash
npm install
npm run android          # 개발 빌드
npm test                 # 엔진 · 설정 · 컴포넌트 테스트
npm run typecheck

npm run build:android    # 릴리스 AAB (서명 설정 필요, 아래 참고)
```

웹:

```bash
cd web && npm install && npm run dev
```

## 릴리스 서명

업로드 키는 저장소에 두지 않는다. `~/keys/pulse-box-upload.properties` 에서
읽고, 그 파일이 없으면 빌드가 멈춘다 — debug 키로 서명된 AAB 를 Play 에 올리는
사고를 막기 위한 것이다.

```properties
PULSEBOX_STORE_FILE=/path/to/upload.keystore
PULSEBOX_STORE_PASSWORD=...
PULSEBOX_KEY_ALIAS=...
PULSEBOX_KEY_PASSWORD=...
```

서명 설정은 `plugins/withReleaseSigning.js` 가 넣는다. `expo prebuild --clean`
이 `android/` 를 재생성하므로 `build.gradle` 을 손으로 고치면 사라진다.

## 개인정보

앱은 개인정보를 수집하지 않는다. 네트워크 호출 코드가 없고, 분석 · 광고 SDK 도
없다. 설정과 마지막 완료 기록은 기기의 AsyncStorage 에만 남는다.
자세한 내용은 `web/src/pages/Privacy.tsx` 와 `store/README.md` 참고.

## 라이선스

폰트는 Anton · Barlow Condensed · Pretendard 모두 SIL OFL 1.1 이다
(`assets/fonts/LICENSES.md`).
