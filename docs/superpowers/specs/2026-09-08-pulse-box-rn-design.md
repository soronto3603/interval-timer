# PULSE BOX — React Native 앱 설계

- 작성일: 2026-09-08
- 상태: 승인 대기
- 디자인 원본: `design/pulse-box-canvas.html` (루트 `pulse-box-ui.html` 번들에서 추출)

## 1. 무엇을 만드는가

Android용 기능성 피트니스 인터벌 타이머. TABATA · AMRAP · EMOM · FOR TIME 4모드.
디자인은 15개 화면 + 토큰 + ko/en 문자열 테이블까지 완성된 상태이며, 이 문서는
그 디자인을 React Native로 옮기기 위한 엔지니어링 설계다.

디자인이 정의한 것은 재해석하지 않는다. 이 문서가 정하는 것은 디자인이 다루지
않은 부분(타이머 정확도, 백그라운드 동작, 백 버튼, 모드별 실행 화면, 영속)뿐이다.

### 확정된 제품 결정

| 항목 | 결정 |
|---|---|
| 스택 | Expo SDK 57 + dev build (Expo Go 아님) |
| v1 스코프 | 4모드 전부 + 15개 화면 전부 |
| 백그라운드 | 복귀 시 시간 보정만. foreground service 없음 |
| 운동 기록 | 모드별 마지막 프리셋만. 이력 화면 없음 |

**백그라운드 한계는 의도된 것이다.** 앱이 백그라운드에 있는 동안 사운드·진동은
울리지 않는다. 대신 돌아오면 경과 시간이 정확히 반영된 라운드·상태로 이어진다.
운동 중 화면은 keep-awake로 유지한다.

## 2. 아키텍처

```
src/
  core/timer/          순수 로직. RN import 0개
    types.ts           Segment · Anchor · TimerState · ModeConfig
    compile.ts         ModeConfig → Segment[]
    derive.ts          (Segment[], Anchor, now) → TimerState
    format.ts          ms → "MM:SS"
  store/
    settings.ts        zustand + AsyncStorage
    presets.ts         zustand + AsyncStorage
  theme/
    tokens.ts  fonts.ts  scale.ts
  i18n/
    strings.ts         ko/en (디자인 원본에서 그대로 이관)
    useT.ts
  services/
    cues.ts            expo-audio + expo-haptics
    keepAwake.ts       expo-keep-awake
  components/
    ScreenFrame AppHeader ModeRow Stepper CTAButton
    TimerDisplay ModeBar RoundDots ProgressBar DotGrid
    Toggle SettingRow Dialog PauseButton TallyCard
app/
  _layout.tsx          루트 스택 · 폰트 로드 · i18n
  index.tsx            01 Home
  setup/[mode].tsx     02 · 10 · 11 · 12
  timer.tsx            06 → 03/04 · 07 오버레이 · 08/09 다이얼로그
  complete.tsx         05
  settings/_layout.tsx
  settings/index.tsx   13
  settings/language.tsx 14
  settings/sound.tsx   15
```

### 경계

`core/timer`는 React도 React Native도 모른다. 클럭을 인자로 받으므로 시간에
의존하는 모든 규칙을 순수 함수로 테스트할 수 있다. 이 앱의 유일한 진짜 리스크가
시간 정확도이므로, 그 리스크 전부를 테스트 가능한 한 곳에 모은다.

`services/`는 부수효과만 담당한다. 큐 재생이 실패해도 엔진은 계속 돈다.

## 3. 타이머 엔진

### 타입

```ts
type SegmentKind = 'prep' | 'work' | 'rest' | 'interval' | 'amrap' | 'fortime'

type Segment = {
  kind: SegmentKind
  durationMs: number | null   // null = 무제한 카운트업 (cap 없는 For Time)
  countUp: boolean
  roundIndex: number          // 0-based. prep = -1
  roundTotal: number          // 라운드 개념이 없는 모드는 0
}

type Anchor = {
  startedAt: number           // epoch ms
  pausedTotalMs: number       // 누적 일시정지 시간
  pausedAt: number | null     // 현재 일시정지 시작 시각. null = 실행 중
}

type TimerState = {
  phase: 'running' | 'paused' | 'complete'
  segmentIndex: number
  segment: Segment
  remainingMs: number | null  // durationMs 가 null 인 세그먼트만 null
  elapsedInSegmentMs: number
  totalElapsedMs: number
}
```

### derive — 상태를 저장하지 않고 파생한다

```
effNow  = pausedAt ?? now
elapsed = max(0, effNow - startedAt - pausedTotalMs)
```

`elapsed`를 세그먼트 길이를 따라 걸어 내려가 현재 세그먼트와 그 안의 경과를 구한다.

일시정지가 별도 코드 경로 없이 흡수된다: 멈춰 있으면 `effNow`가 고정되므로 파생값도
고정된다. 복귀 보정은 `now`를 다시 읽는 것 그 자체이며 별도 로직이 없다.

```
일시정지:  pausedAt = now
재개:      pausedTotalMs += now - pausedAt;  pausedAt = null
리셋:      startedAt = now;  pausedTotalMs = 0;  pausedAt = null
```

### 모드별 컴파일

`PREP_SECONDS = 3` (v1에서 사용자 설정 아님. 디자인 06번의 "03"에 해당)

타바타는 마지막 라운드의 `rest` 도 낸다. 정통 타바타 프로토콜이 20초 on / 10초 off
× 8 = 정확히 4분이고, 디자인 05번 Complete 화면의 총 시간 `04:00` 도 그 값이다
(8 × 20 + 7 × 10 이면 03:50 이 되어 디자인과 어긋난다).

| 모드 | 세그먼트 |
|---|---|
| TABATA | `prep` + `[work, rest] × rounds` |
| EMOM | `prep` + `interval × count` |
| AMRAP | `prep` + `amrap(총시간)` 1개 |
| FOR TIME | `prep` + `fortime(cap ?? null)`, `countUp: true` |

AMRAP의 라운드/렙 집계는 세그먼트가 아니라 화면 로컬 카운터다 (§7).

### 틱과 큐

- 틱: `setInterval` 100ms. `AppState`가 `active`로 바뀌면 즉시 재파생
- 큐 발화: 이전 파생값 → 새 파생값을 비교해서 판단
  - 세그먼트 경계 통과 → `workStart` / `restStart` 큐
  - 남은 시간이 3초 / 2초 / 1초 임계를 통과 → `countdown` 큐
- **백그라운드 억제**: 틱 간격이 1500ms를 초과했으면 그 전이의 모든 큐를 무음
  처리한다. 5분 만에 돌아왔을 때 지난 알림이 몰아서 터지지 않게 한다
- **시계 역주행**: 5초를 초과해 뒤로 뛰면 `startedAt`을 재앵커해 타이머가 되감기지
  않게 한다. 그 미만은 `max(0, …)` 클램프로 흡수

### 완료

마지막 세그먼트를 지나면 `phase: 'complete'`. `complete.tsx`로 요약을 넘긴다:
모드 · 완료 라운드 · work/rest 값 · 총 시간 · (AMRAP이면) 집계 수.

기록에 남기는 총 시간은 끝까지 돈 운동이면 **계획된** 길이(`totalMsOf`)를 쓴다.
틱이 100ms 간격이라 완료 감지가 그만큼 늦고, 그 지연이 기록에 섞이면 8라운드
타바타가 04:00 이 아니라 04:01 로 남는다. `FINISH` 로 중간에 끝낸 운동만 실제
경과를 쓰며, 경과 시간이므로 내림으로 표시한다.

cap 없는 For Time은 스스로 완료되지 않는다. 사용자가 `FINISH`를 눌러야 한다 (§7).

## 4. 상태 & 영속

```ts
// presets — 모드별 마지막 설정. Home 카드와 Setup 초기값을 겸한다
presets: Record<ModeId, ModeConfig>
lastUsedMode: ModeId | null
lastCompleted: {
  mode, config, finishedAt, roundsDone, tally?, totalMs
} | null

// settings
language: 'system' | 'ko' | 'en'
vibration: boolean
keepAwake: boolean
cues: { countdown: boolean; workStart: boolean; restStart: boolean }
```

- **QUICK START** = `lastUsedMode`의 프리셋으로 즉시 타이머 진입 (prep은 건너뛰지
  않는다). 이력이 없으면 TABATA 20s / 10s / 8라운드
- **전체 보기** = 추가 라우트 없이 바텀시트. 모드별 프리셋 최대 4행, 탭하면 즉시 시작
- 13번 Settings의 `진동`과 15번 Sound의 `진동`은 **같은 값**에 바인딩한다.
  디자인이 두 곳에 중복 노출한 항목이다
- 13번의 `사운드 ON ›`은 3개 큐 중 하나라도 켜져 있으면 ON으로 표시하고, 탭하면
  15번으로 이동한다
- 언어 기본값은 `expo-localization`의 시스템 언어. 14번에서 덮어쓰면 영속된다
  (디자인 원본 명시 사항)

타이머 실행 상태는 전역 스토어에 두지 않는다. `timer.tsx`가 소유하는
`useIntervalTimer` 훅의 로컬 상태다. 화면을 벗어나면 운동도 끝난다.

## 5. 화면 매핑 & Android 백 버튼

15개 화면 → 8개 라우트. 07 / 08 / 09는 라우트가 아니라 `timer.tsx` 내부 상태다.

| 라우트 | 디자인 화면 |
|---|---|
| `index` | 01 Home |
| `setup/[mode]` | 02 Tabata · 10 AMRAP · 11 EMOM · 12 For Time |
| `timer` | 06 Prep → 03 Work / 04 Rest → 07 Paused → 08 Reset · 09 End |
| `complete` | 05 Complete |
| `settings/index` | 13 Settings |
| `settings/language` | 14 Language |
| `settings/sound` | 15 Sound & haptics |

디자인이 다루지 않은 부분이라 여기서 정한다:

| 화면 | 백 버튼 |
|---|---|
| Home | 앱 종료 |
| Setup | Home |
| Timer (실행 중) | 일시정지 → 07 오버레이 |
| Timer (일시정지) | 09 END WORKOUT? 확인 |
| 다이얼로그 열림 | 다이얼로그 취소 |
| Complete | Home (타이머로 되돌아갈 수 없음) |
| Settings | 이전 화면 |

Complete와 Timer는 뒤로 스와이프로 빠져나갈 수 없게 막는다.

다이얼로그 버튼 구성은 디자인 그대로 유지한다:

| 다이얼로그 | 1차 (강조) | 2차 |
|---|---|---|
| 08 `RESET TIMER?` | `RESET` (orange) | `CANCEL` (외곽선) |
| 09 `END WORKOUT?` | `KEEP GOING` (lime) | `END` (외곽선) |

09에서 1차 버튼이 "계속하기"라는 점에 주의한다. 파괴적 동작(`END`)이 2차다.

## 5-2. 화면 방향

디자인은 세로 프레임(390×844)만 그렸지만, 인터벌 타이머는 폰을 눕혀 두고 멀리서
보거나 여럿이 같이 보는 쓰임이 크다. 그래서 **타이머 계열만** 가로를 지원한다.

| 화면 | 방향 |
|---|---|
| `timer` · `complete` | 회전 허용 |
| `index` · `setup/*` · `settings/*` | 세로 고정 |

폰을 눕히는 건 운동 중이지 설정할 때가 아니고, 스테퍼·설정 목록은 세로가 맞다.

### 방향 정책은 도착하는 화면이 선언한다

떠나는 화면이 원래대로 되돌리는 방식이면, 가로로 운동을 끝냈을 때 타이머가 세로로
튕겼다가 완료 화면에서 다시 가로로 돌아오는 깜빡임이 생긴다. 그래서 `timer` 와
`complete` 는 포커스 시 `unlockAsync`, `index` 는 `lockAsync(PORTRAIT_UP)` 를
호출하고, 떠날 때는 아무것도 하지 않는다. 다른 화면은 Home 을 거쳐야 갈 수 있어
자연히 세로다.

### 회전은 타이머를 끊지 않는다

`AndroidManifest` 의 `configChanges` 에 `orientation|screenSize` 가 있어 회전으로
액티비티가 재생성되지 않는다. 앵커가 살아 있으므로 운동 중에 돌려도 이어진다.

### 가로 실행 화면 — 시계 모드

```
┌──────────────────────────────────────────────┐
│ ROUND 3 / 8                        PULSE BOX │  30
│                                              │
│                 00:17                        │  남은 전부 (~210)
│                                              │
│ ●●●●○○○○      ── WORK ──          ⏸ + 힌트   │  96
└──────────────────────────────────────────────┘
```

숫자가 주인공이다. 눕히는 이유가 멀리서 시간을 보려는 것이므로 그 우선순위를 따른다.
대가로 두 가지를 디자인에서 벗어난다:

- 모드바: 전폭 92 → 가운데 낮은 띠(44). 세로에서는 주인공 중 하나지만 411dp 높이를
  숫자에 내줘야 한다
- 일시정지: 132 → 72. 힌트를 포함해 하단 행 96. 힌트를 빼면 눕혀 두고만 쓰는 사람은
  버튼을 탭했는데 아무 일도 안 일어나는 이유를 알 방법이 없다

일시정지 오버레이는 버튼 3개를 가로 한 줄로, 다이얼로그는 폭을 560 으로 제한하고
버튼을 좌우로 편다. 완료 화면은 좌측 제목 / 우측 요약 2단이고, 요약 행은 4행이
스크롤 없이 들어가도록 세로 여백을 22 → 12 로 줄인다.

### 타이머 글자 크기 — 축이 뒤집힌다

세로에서는 **폭**이 모자라 디자인 값 150 이 상한이고, 가로에서는 폭이 남는 대신
높이가 411dp 로 줄어 **높이**가 상한이 된다. 한 축만 보고 배율을 매기면 가로에서
정반대로 동작한다. `timerFontSize` 가 두 축을 모두 본다.

쓸 수 있는 높이는 화면 높이에서 어림한 상수를 빼지 않고 **실제 인셋을 재서** 넘긴다.
추정이 조금만 커도 넘친 `Text` 가 아래 형제(모드바·일시정지)를 화면 밖으로 밀어낸다 —
RN 의 flex 아이템은 기본적으로 줄어들지 않기 때문이다. 실제로 그 버그를 냈다.

## 6. 디자인 시스템

### 토큰 (원본 그대로)

```
bg/void     #070807     앱 배경
bg/screen   #0C0D0C     화면 배경
surface     #141614     행 · 입력
line        #202320     구분선 1px
work/lime   #B8FF2E     운동 · 1차 액션
rest/orange #FF6B1A     휴식
prep/blue   #2E8DFF     준비 카운트다운
ink         #F4F6F2     본문
muted       #8A918A     보조

space   4 · 8 · 12 · 22 · 26 · 34 · 52   (4pt 기반)
padding 화면 좌우 22 / safe bottom 26
radius  row 12 · control 14 · screen 40
touch   row 72 · stepper 80 · CTA 88 · pause 132
```

### 타이포

| 프리셋 | 스펙 |
|---|---|
| display/timer | Anton 150 / lh 1.0 / +0.01em |
| display/mode | Anton 30–66 |
| label/sports | Barlow Condensed 700 / +0.3em / uppercase |
| label/meta | Barlow Condensed 600 / +0.2~0.22em / uppercase |
| label/ko | Pretendard 600–700 / 자간 0 |

폰트 조달:

- Anton → `@expo-google-fonts/anton`
- Barlow Condensed 600/700 → `@expo-google-fonts/barlow-condensed`
- Pretendard 400/600/700 → npm `pretendard@1.3.9`의
  `dist/public/static/Pretendard-{Regular,SemiBold,Bold}.otf`를 `assets/fonts/`로
  받는다 (4.5MB). 같은 경로의 `alternative/*.ttf` 는 웨이트당 2.6MB로 합계 7.7MB라
  OTF 를 쓴다. 특정 기기에서 CFF 렌더링 문제가 보이면 파일만 TTF 로 교체하면 된다.
  서브셋팅은 나중 최적화 과제로 남긴다
- 조달 스크립트는 없다. `scripts/gen-cues.py` 와 달리 한 번 받으면 끝인 파일이다

로드 실패 시 시스템 폰트로 폴백하고 앱을 차단하지 않는다.

### CSS에서 그대로 넘어오지 않는 것 3개

1. **로고 이탤릭** — 디자인은 Anton에 `font-style: italic`을 걸었으나 Anton에는
   이탤릭 자체가 없고, Android는 커스텀 폰트의 합성 이탤릭을 신뢰할 수 없다.
   → 감싼 View에 `transform: [{ skewX: '-8deg' }]`
2. **점 격자 배경** (03 · 04 · 06 ~ 09) — RN에 `background-image`가 없다.
   → `react-native-svg` `<Pattern>`으로 22×22 간격 원 1px, `DotGrid` 컴포넌트를
   absolute fill
3. **좁은 화면에서 150px 타이머 넘침** — 디자인 폭은 390이다. Anton 150으로 `00:17`은
   약 337px이고 360px 기기의 콘텐츠 폭 316px를 넘는다.
   → `scaleFont(px) = px * clamp(width / 390, 0.86, 1.15)`를 디스플레이 타입에만 적용

`text-shadow: 0 0 60px rgba(...)`는 `textShadowColor` / `textShadowRadius`로
그대로 이관된다.

## 7. 디자인에 없는 실행 화면 3개

03 / 04의 골격을 유지한다:

```
헤더 → Barlow 상단 라벨 → Anton 150 타이머 → 92 모드바 → [가변 슬롯] → 132 일시정지
```

가변 슬롯만 모드별로 교체한다.

**EMOM** — 03과 동일. 상단 라벨 `ROUND 3 / 10`, 슬롯은 인터벌 도트.

디자인 11번의 필드 라벨은 `분 / Minutes`이지만 이 값은 **인터벌 개수**이고,
`TOTAL = 개수 × 인터벌 길이`다 (디자인의 10 × 01:00 = 10:00). 인터벌을 01:00이 아닌
값으로 두면 개수와 분이 어긋나므로, 실행 화면 상단 라벨은 `MIN`이 아니라
`ROUND n / N`을 쓴다. Setup 화면의 필드 라벨은 디자인 그대로 `분 / Minutes`로 둔다.

**AMRAP** — 상단 라벨 `AMRAP · 12:00`, 라임 카운트다운. 슬롯에 `TallyCard`:
`#141614` / height 96 / radius 14, 좌측에 `ROUNDS`(또는 `REPS`) 라벨,
우측에 Anton 46 카운트. **카드 전체가 탭 타겟**(+1, 햅틱), 길게 누르면 −1.
Setup 10번의 `카운트 방식` ROUNDS/REPS 선택이 이 라벨을 결정한다.

**FOR TIME** — 카운트업. cap이 있으면 상단 라벨 `CAP 12:00 · LEFT 03:12`,
없으면 `COUNT UP`. 슬롯에 외곽선 `FINISH` CTA (height 88).
디자인에 For Time을 끝낼 방법이 없어서 필요하다.

채운 라임이 아니라 외곽선인 이유: 바로 위 모드바가 이미 채운 라임이라, 같은 색
같은 폭 덩어리를 붙이면 둘이 하나로 읽히고 표시일 뿐인 모드바가 버튼처럼 보인다.
디자인의 색 언어에서도 운동을 벗어나는 동작(RESET · CANCEL)은 외곽선이다.

### 일시정지는 롱프레스다

디자인 03 · 04번이 일시정지 버튼 아래 `길게 눌러 일시정지` 힌트를 둔 것은
탭으로는 멈추지 않는다는 뜻이다. 운동 중에 팔이 스쳐 타이머가 멈추면 안 된다.
450ms 홀드로 멈추고, 짧게 누르면 햅틱으로 눌렸다는 것만 알린다.

### 도트 오버플로 규칙

타바타 라운드가 최대 99이므로 도트가 항상 들어가지 않는다.
라운드 ≤ 12면 도트, 초과하면 height 6 라임 진행 바로 대체한다.
상단에 이미 `ROUND n / N`이 있어 정보 손실은 없다.

## 8. 스테퍼 규격

| 필드 | 스텝 | 범위 |
|---|---|---|
| Tabata work | 5s | 5s – 10:00 |
| Tabata rest | 5s | 5s – 10:00 |
| Tabata rounds | 1 | 1 – 99 |
| AMRAP time | 1:00 | 1:00 – 60:00 |
| EMOM minutes | 1 | 1 – 60 |
| EMOM interval | 15s | 15s – 5:00 |
| For Time cap | 1:00 | 없음 / 1:00 – 60:00 |

길게 누르면 가속 반복. 범위 끝에 닿으면 해당 `−` 또는 `+`만 흐리게 처리한다.

## 9. 에러 처리

| 실패 | 처리 |
|---|---|
| 폰트 로드 실패 | 시스템 폰트로 렌더. 앱을 차단하지 않음 |
| 오디오 로드/재생 실패 | try/catch로 무음 처리, 1회만 로그. 큐 실패가 타이머를 죽이지 않음 |
| AsyncStorage 읽기 실패 | 기본값으로 부팅 |
| 저장된 설정 스키마 불일치 | 해당 항목만 기본값으로 리셋 (전체 초기화 아님) |
| 시계 역주행 | `max(0, …)` 클램프. 5초 초과 시 `startedAt` 재앵커 |
| 잘못된 라우트 파라미터 (`setup/xxx`) | Home으로 리다이렉트 |

## 10. 사운드 & 햅틱

음원 6개를 쓴다 (`assets/sounds/`, mono 48kHz, 합계 384KB). `ready_tick` 하나를
배속만 바꿔 준비 진입과 3·2·1 에 재사용한다 — `shouldCorrectPitch: false` 로 두면
배속이 곧 피치다.

```
ui_tap            80ms   조작 피드백용 짧은 클릭
ready_tick       420ms   드라이한 전자 tick (피치 4단계로 재사용)
warning_10s      320ms   낮은 하강형 알림 (150→56Hz)
work_start       920ms   상승형 시작음 (228→570→880Hz)
rest_start       820ms   하강형 전환음
workout_complete 1420ms  3음 상승 완료음 (143→293→659Hz)
```

핵심은 WORK · REST · COMPLETE 가 서로 완전히 다른 소리라는 것이다. 운동 중 화면을
보지 않아도 무엇이 시작됐는지 들려야 한다.

### 이벤트 매핑

| 이벤트 | 음원 | 배속 | 햅틱 |
|---|---|---|---|
| 모드 선택 · 스테퍼 · 토글 | — | — | Light |
| START 탭 | `ui_tap` | 1.0 | Medium |
| GET READY 진입 | `ready_tick` | 0.84 | Medium |
| 카운트다운 3 · 2 | `ready_tick` | 1.0 · 1.06 | Light |
| 카운트다운 1 | `ready_tick` | 1.19 | Medium |
| WORK 시작 | `work_start` | 1.0 | Heavy |
| 10초 남음 | `warning_10s` | 1.0 | Light |
| REST 시작 | `rest_start` | 1.0 | Medium |
| 일시정지 · 재개 · 리셋/종료 확인 | — | — | Medium |
| COMPLETE | `workout_complete` | 1.0 | Heavy + 220ms 뒤 Light |

prep 은 3초이므로 카운트다운 3 의 임계를 "통과"하지 않는다. 대신 그 순간에
`readyEnter` 가 울려서 결과적으로 03 → 02 → 01 이 서로 다른 소리로 들린다.

### 10초 경고는 짧은 구간에서 생략한다

타바타 기본 휴식이 10초다. 그대로 두면 경고가 `rest_start` 바로 뒤에 붙어 두 소리가
겹치고, "막판 진입"이라는 뜻도 사라진다. 구간이 **15초를 넘을 때만** 울린다.

### 설정 토글은 디자인의 3개를 유지한다

큐 종류가 토글보다 많으므로 묶는다 (디자인 15번에 행을 추가하지 않기 위해).

```
카운트다운 알림 → readyEnter · countdown 3·2·1 · warn10
운동 시작 알림   → workStart · START 탭
휴식 시작 알림   → restStart
완료음          → 토글 없음. 셋이 전부 꺼져 있을 때만 함께 무음
```

완주 보상은 끌 이유가 적어 별도 토글을 두지 않았다.

진동은 `expo-haptics` 의 Light/Medium/Heavy 3단계를 쓰고, `vibration` 스위치 하나가
전체를 끈다. 일시정지 계열은 소리 없이 촉각만 준다 — 운동 중에 소음을 더하는 것보다
즉각적인 손끝 반응이 낫다.

## 11. 테스트

`core/timer`가 순수하므로 실질 커버리지를 여기서 확보한다. **TDD로 엔진부터.**

### 엔진 (jest, 클럭 주입)

- `compile` — 4모드 세그먼트 리스트. 타바타 총 길이 = 라운드 × (work + rest). cap 없는 For Time의 `durationMs: null`
- `derive` — 경계 정확히 그 ms, 경계 −1ms / +1ms
- 일시정지 중 파생값 고정, 재개 후 연속성
- **백그라운드 점프** — 5분을 건너뛰고 올바른 세그먼트에 착지
- **큐 억제** — 점프 시 발화 0회 (완료음 포함)
- **10초 경고** — 임계 통과 시 발화, 15초 이하 구간에서는 생략
- **카운트다운 단계** — 한 틱에 여러 단계가 지나가면 가장 늦은 단계만
- 시계 역주행 재앵커
- 라운드 1 / 라운드 99 경계

### 그 외

- 스토어 영속 왕복 (저장 → 재부팅 → 복원)
- 스테퍼 클램핑, 도트 → 진행 바 전환 임계 (`@testing-library/react-native`)

프리셋은 `jest-expo`.

## 12. v1에서 하지 않는 것

- 백그라운드/화면 꺼짐 상태의 사운드·진동 (foreground service)
- 운동 이력 화면 및 통계
- iOS (디자인이 Android 기준. 코드는 대부분 공유되지만 검증하지 않음)
- prep 시간 사용자 설정
- 커스텀 인터벌 (임의 세그먼트 편집)
- 폰트 서브셋팅
