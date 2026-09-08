import { Dimensions } from 'react-native';

/** 디자인 캔버스의 프레임 폭 (390 × 844). */
export const DESIGN_WIDTH = 390;

const MIN_FACTOR = 0.86;
const MAX_FACTOR = 1.15;

/**
 * 화면 폭 대비 배율. 순수 함수라 테스트할 수 있게 분리했다.
 *
 * 디자인이 390 기준이라 360px 기기에서 Anton 150 타이머가 콘텐츠 폭을 넘는다.
 * 반대로 태블릿에서 글자만 무한정 커지는 것도 이상하므로 위아래를 모두 막는다.
 */
export function scaleFactor(width: number): number {
  return Math.min(MAX_FACTOR, Math.max(MIN_FACTOR, width / DESIGN_WIDTH));
}

/** 소수 fontSize 는 Android 에서 흐려지므로 정수로 반올림한다. */
export function scaleBy(px: number, width: number): number {
  return Math.round(px * scaleFactor(width));
}

/**
 * 디스플레이 타입(Anton 타이머·모드 워드)에만 쓴다.
 * 본문·라벨은 디자인 값을 그대로 써야 행 높이가 흐트러지지 않는다.
 */
export function scaleFont(px: number): number {
  return scaleBy(px, Dimensions.get('window').width);
}
