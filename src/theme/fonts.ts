import { TextStyle } from 'react-native';

import { color } from './tokens';

/**
 * 폰트 패밀리 이름. useAppFonts 가 등록하는 키와 일치해야 한다.
 * 로드에 실패하면 RN 이 시스템 폰트로 떨어지며, 앱은 그대로 동작한다.
 */
export const font = {
  /** 타이머 숫자 · 모드 워드 */
  anton: 'Anton_400Regular',
  /** 스포츠 라벨 (+0.2~0.3em 자간) */
  barlow600: 'BarlowCondensed_600SemiBold',
  barlow700: 'BarlowCondensed_700Bold',
  /** 한글 본문 */
  ko400: 'Pretendard-Regular',
  ko600: 'Pretendard-SemiBold',
  ko700: 'Pretendard-Bold',
} as const;

/**
 * 자간 변환: 디자인은 em 단위, RN 은 px 단위다.
 * letterSpacing: 0.3em @ 26px → 7.8px
 */
export const em = (size: number, value: number) => size * value;

/**
 * 디자인의 TYPE 토큰. 크기가 화면 폭에 따라 변하는 디스플레이 타입은
 * 여기서 fontSize 를 정하지 않고 쓰는 쪽에서 timerFontSize 로 넣는다.
 */
export const type = {
  /** display/timer — Anton 150 / lh 1.0 / +0.01em */
  timer: (size: number): TextStyle => ({
    fontFamily: font.anton,
    fontSize: size,
    lineHeight: size,
    letterSpacing: em(size, 0.01),
    color: color.ink,
  }),

  /** display/mode — Anton 30–66 */
  mode: (size: number, letter = 0.01): TextStyle => ({
    fontFamily: font.anton,
    fontSize: size,
    letterSpacing: em(size, letter),
    color: color.ink,
  }),

  /** label/sports — Barlow Condensed 700 / +0.3em */
  sports: (size: number, letter = 0.3): TextStyle => ({
    fontFamily: font.barlow700,
    fontSize: size,
    letterSpacing: em(size, letter),
    color: color.inkDim,
  }),

  /** label/meta — Barlow Condensed 600 / +0.2~0.22em */
  meta: (size: number, letter = 0.2): TextStyle => ({
    fontFamily: font.barlow600,
    fontSize: size,
    letterSpacing: em(size, letter),
    color: color.faint,
  }),

  /** 셰브론 · −/+ 기호. Barlow 는 기호 균형이 좋다 */
  glyph: (size: number): TextStyle => ({
    fontFamily: font.barlow700,
    fontSize: size,
    lineHeight: size,
    color: color.faint,
  }),

  /** label/ko — Pretendard 600–700 / 자간 0 */
  ko: (size: number, weight: 400 | 600 | 700 = 600): TextStyle => ({
    fontFamily:
      weight === 700 ? font.ko700 : weight === 600 ? font.ko600 : font.ko400,
    fontSize: size,
    color: color.ink,
  }),
} as const;
