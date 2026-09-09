#!/usr/bin/env bash
# Netlify 와 같은 조건으로 web/ 을 빌드해 본다.
#
# 왜 필요한가: web/ 이 RN 저장소 안에 있어서, 로컬에서 tsc 는 타입을 찾을 때
# 상위 디렉터리의 node_modules/@types 까지 올라간다. 그래서 web/package.json 에
# 빠진 의존성이 있어도 로컬 빌드는 통과하고 Netlify 에서만 깨진다.
# 실제로 @types/node 가 빠진 채 첫 배포가 실패했다.
#
#   npm --prefix web run verify:isolated
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

rsync -a --exclude node_modules --exclude dist "$ROOT/web/" "$WORK/"
cd "$WORK"

echo "격리 디렉터리: $WORK"
npm ci --silent
npm run build

echo
echo "격리 빌드 통과 — web/package.json 이 필요한 의존성을 모두 선언하고 있다."
