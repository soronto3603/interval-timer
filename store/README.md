# Play Console 업로드 자산

`raw/` 는 받은 원본 덤프다. 그 안에 문제가 셋 있어서 위쪽 정리본을 쓴다:

- `raw/icon-a-pulse-monogram.png` — 1024×500 이고 `feature-graphic.png` 와 바이트 동일.
  아이콘이 아니라 피처 그래픽이 두 번 저장된 것이다
- `raw/icon-c-start-block.png` — 블록 그리드가 좌측에서 잘려 있다
- `raw/01-home.png` = `raw/02-tabata-setup.png` — 동일 파일. 스크린샷은 4장이다

## 업로드할 것

| 파일 | 용도 | Play 요구사항 |
|---|---|---|
| `icon-512.png` | 앱 아이콘 | 512×512 PNG ✅ |
| `feature-graphic-1024x500.png` | 피처 그래픽 | 1024×500 ✅ |
| `screenshots/*.png` | 폰 스크린샷 4장 | 최소 2장, 1080×1920 ✅ |

## 아직 없는 것

- 개인정보 처리방침 URL (필수). 앱은 아무것도 수집하지 않고 설정을 기기에만
  저장하지만, URL 자체는 있어야 한다
- 짧은 설명 (80자) / 긴 설명 (4000자)
- 콘텐츠 등급 설문, 데이터 보안 양식
