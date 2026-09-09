import { scaleFactor } from './scale';

/**
 * 글자 폭 합계 (em). Anton 은 자폭이 약 0.45em 이고, 콜론은 그보다 좁다.
 * "00:17" ≈ 2.25em · "03" ≈ 0.95em
 */
export const CLOCK_EM = 2.25;
export const PREP_EM = 0.95;

/** 화면 좌우 여백 22 × 2 */
const SIDE_PADDING = 44;

/** 가로에서 숫자가 무한정 커지지 않게 (태블릿) */
const LANDSCAPE_MAX = 260;

/** 이보다 작아지면 멀리서 읽는다는 목적 자체가 사라진다 */
const MIN = 72;

export type TimerFontFit = {
  /** 화면 폭. 세로 배율(디자인 390 기준)을 매기는 데 쓴다 */
  width: number;
  /**
   * 숫자가 실제로 쓸 수 있는 높이.
   *
   * 화면 높이에서 추정치를 빼는 방식은 쓰지 않는다 — 안전영역은 기기마다 다르고,
   * 추정이 조금만 커도 넘친 Text 가 아래 형제(모드바 · 일시정지)를 화면 밖으로
   * 밀어낸다. RN 의 flex 아이템은 기본적으로 줄어들지 않기 때문이다.
   */
  maxHeight: number;
  landscape: boolean;
  /** 세로 기준 디자인 값 (시계 150 · prep 210) */
  base: number;
  advanceEm: number;
};

/**
 * 타이머 숫자 크기.
 *
 * 세로와 가로에서 **제약이 뒤집힌다**. 세로에서는 폭이 모자라 디자인 값(150)이
 * 상한이고, 가로에서는 폭이 남아도는 대신 높이가 411dp 로 줄어 높이가 상한이
 * 된다. 그래서 한쪽 축만 보고 배율을 매기면 가로에서 정반대로 동작한다.
 */
export function timerFontSize(fit: TimerFontFit): number {
  const widthLimit = (fit.width - SIDE_PADDING) / fit.advanceEm;

  // 가로에는 대응하는 디자인 값이 없다. 남는 공간을 그대로 쓴다.
  // 세로는 디자인 값이 기준이고, 화면 폭에 따라 좁은 범위로만 움직인다.
  const preferred = fit.landscape
    ? Math.min(widthLimit, LANDSCAPE_MAX)
    : Math.min(fit.base * scaleFactor(fit.width), widthLimit);

  return Math.max(MIN, Math.floor(Math.min(preferred, fit.maxHeight)));
}
