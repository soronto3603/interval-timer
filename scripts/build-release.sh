#!/usr/bin/env bash
# PULSE BOX 릴리스 빌드.
#
# 서명 값은 저장소에 두지 않는다. ~/keys/pulse-box-upload.properties 에서 읽고,
# 그 파일이 없으면 멈춘다 — debug 키로 서명된 AAB 를 Play 에 올리는 사고를 막는다.
set -euo pipefail

PROPS="${PULSEBOX_SIGNING_PROPS:-$HOME/keys/pulse-box-upload.properties}"
if [ ! -f "$PROPS" ]; then
  echo "서명 설정을 찾을 수 없습니다: $PROPS" >&2
  echo "키스토어를 만들고 그 경로/비밀번호를 이 파일에 두세요." >&2
  exit 1
fi

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export JAVA_HOME="${JAVA_HOME:-/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home}"

set -a; . "$PROPS"; set +a

npx expo prebuild --platform android --clean

cd android
./gradlew "${1:-bundleRelease}" \
  -PPULSEBOX_STORE_FILE="$PULSEBOX_STORE_FILE" \
  -PPULSEBOX_STORE_PASSWORD="$PULSEBOX_STORE_PASSWORD" \
  -PPULSEBOX_KEY_ALIAS="$PULSEBOX_KEY_ALIAS" \
  -PPULSEBOX_KEY_PASSWORD="$PULSEBOX_KEY_PASSWORD"

cd ..
echo
echo "AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
