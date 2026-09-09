# Play Console 업로드 자산

## 업로드할 것

| 파일 | 용도 | Play 요구사항 |
|---|---|---|
| `icon-512.png` | 앱 아이콘 | 512×512 PNG ✅ |
| `feature-graphic-1024x500.png` | 피처 그래픽 | 1024×500 ✅ |
| `screenshots/*.png` | 폰 스크린샷 5장 | 최소 2장 · 1080×2424 ✅ |
| `screenshots-tablet/*.png` | 가로 스크린샷 | 선택. 7인치/10인치 탭에 쓸 수 있다 |

스크린샷은 **릴리스 빌드에서 직접 찍은 실제 화면**이다. `raw/design-renders/` 에
있는 것은 디자인 렌더로, 실제 앱과 다르다 (prep 화면에 없는 `GET READY` 라벨과
라운드 도트가 있고, 홈에 `전체 보기` 가 빠져 있으며 일부는 좌측이 잘려 있다).
Play 는 스토어 이미지가 실물을 반영하도록 요구하므로 렌더를 쓰지 않는다.

## 개인정보 처리방침 URL

웹은 `web/` 에 있고 Netlify 로 배포한다. Play Console 에 넣을 URL:

```
https://<netlify-도메인>/privacy/
```

Vite MPA 로 빌드해 `/privacy/` 가 실제 파일이다. SPA 폴백에 의존하지 않는다 —
Play 가 이 URL 을 검증하기 때문이다.

## 데이터 보안 양식 대응표

처방침 문구와 어긋나면 심사에서 문제가 된다. 코드 기준 사실:

| 양식 질문 | 답 | 근거 |
|---|---|---|
| 데이터를 수집하거나 공유합니까? | **아니요** | 앱에 네트워크 호출 코드가 없다 (fetch · axios · WebSocket 전무) |
| 제3자와 공유합니까? | 아니요 | 분석 · 광고 · 크래시 리포팅 SDK 0개 |
| 전송 중 암호화 | 해당 없음 | 전송하는 데이터가 없다 |
| 데이터 삭제 요청 방법 제공 | 해당 없음 | 앱 삭제로 전부 지워진다 |
| 기기 내 저장 | 설정 · 모드별 프리셋 · 마지막 완료 기록 1건 | AsyncStorage `pulse-box/settings`, `pulse-box/presets` |

기기에만 남고 외부로 나가지 않는 값은 Play 기준으로 "수집" 이 아니다.

## 앱이 요청하는 권한 (릴리스 APK 확인값)

```
ACCESS_NETWORK_STATE  INTERNET  MODIFY_AUDIO_SETTINGS  VIBRATE  WAKE_LOCK
```

전부 자동 승인되는 normal 권한이라 설치 시 사용자에게 노출되지 않는다.
`RECORD_AUDIO` · `FOREGROUND_SERVICE` · `SYSTEM_ALERT_WINDOW` ·
`READ/WRITE_EXTERNAL_STORAGE` 는 `app.json` 의 `blockedPermissions` 로 제거했다.

## 아직 없는 것

- 짧은 설명 (80자) / 긴 설명 (4000자)
- 콘텐츠 등급 설문
- 사운드 6개의 출처 확인 (직접 제작한 것이면 무관)
