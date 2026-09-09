import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TimerView } from '../core/timer/present';
import { type } from '../theme/fonts';
import { CLOCK_EM, PREP_EM, timerFontSize } from '../theme/timerFont';
import { color, layout, space, touch } from '../theme/tokens';
import { AppHeader, Logo } from './AppHeader';
import { PauseButton } from './PauseButton';
import { ModeBar, SportsLabel, TimerNumber } from './TimerDisplay';

type Dims = { width: number; height: number; landscape: boolean };

type Props = {
  view: TimerView;
  dims: Dims;
  slot: ReactNode;
  onPause: () => void;
  onTap: () => void;
  hint: string;
};

/** 가로에서 일시정지 버튼. 411dp 높이에 132 는 안 들어간다. */
const LANDSCAPE_PAUSE = 72;

/**
 * 가로 하단 행. 버튼 + 힌트가 들어간다.
 *
 * 힌트를 빼면 눕혀 두고만 쓰는 사람은 버튼을 탭했는데 아무 일도 안 일어나는
 * 이유를 알 방법이 없다. 숫자가 12dp 를 양보하는 편이 낫다.
 */
const LANDSCAPE_BOTTOM = 96;

/** 숫자 위아래에 실제로 놓이는 것들의 높이 */
const ROW = {
  landscapeTop: 30, // ROUND 라벨 / 로고
  landscapeBottom: LANDSCAPE_BOTTOM,
  portraitHeader: 34,
  portraitLabel: 34,
  portraitModeBar: touch.modeBar + 22, // 모드바 + 위 여백
  portraitSlot: 96 + 44, // 슬롯(집계 카드가 가장 크다) + 위 여백
  portraitPause: touch.pause + 14 + 20, // 버튼 + 힌트
  prepModeBar: touch.modeBar + space.lg,
  prepFooter: 30,
};

/**
 * 숫자가 실제로 쓸 수 있는 높이.
 *
 * 화면 높이에서 어림한 상수를 빼는 방식을 쓰다가 가로에서 하단 행이 화면 밖으로
 * 밀려났다. 안전영역은 기기마다 다르고, RN 의 flex 아이템은 기본적으로 줄어들지
 * 않아서 넘친 Text 가 아래 형제를 그대로 밀어낸다. 그래서 실제 인셋을 재서 뺀다.
 */
function useAvailableHeight(dims: Dims, occupied: number) {
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + (dims.landscape ? 12 : layout.screenTop);
  const paddingBottom = Math.max(
    insets.bottom,
    dims.landscape ? 12 : layout.safeBottom,
  );

  return Math.max(0, dims.height - paddingTop - paddingBottom - occupied);
}

export function PrepLayout({ view, dims }: Pick<Props, 'view' | 'dims'>) {
  const maxHeight = useAvailableHeight(
    dims,
    (dims.landscape ? 44 + space.lg : ROW.prepModeBar) +
      ROW.prepFooter +
      (dims.landscape ? 0 : ROW.portraitHeader) +
      space.lg,
  );

  const fontSize = timerFontSize({
    width: dims.width,
    maxHeight,
    landscape: dims.landscape,
    base: 210,
    advanceEm: PREP_EM,
  });

  return (
    <>
      {dims.landscape ? (
        <View style={styles.landscapeTop}>
          <View />
          <Logo size={18} />
        </View>
      ) : (
        <AppHeader />
      )}
      <View style={styles.prepBody}>
        <TimerNumber text={view.timerText} accent="prep" fontSize={fontSize} />
        <View style={dims.landscape ? undefined : styles.fullWidth}>
          <ModeBar
            label={view.modeLabel}
            accent="prep"
            compact={dims.landscape}
          />
        </View>
      </View>
      <Text style={[type.sports(22, 0.26), styles.prepFooter]}>
        {view.footerLabel}
      </Text>
    </>
  );
}

export function RunningLayout({
  view,
  dims,
  slot,
  onPause,
  onTap,
  hint,
}: Props) {
  const occupied = dims.landscape
    ? ROW.landscapeTop + ROW.landscapeBottom + space.md
    : ROW.portraitHeader +
      ROW.portraitLabel +
      ROW.portraitModeBar +
      ROW.portraitSlot +
      ROW.portraitPause +
      space.xxxl;

  const maxHeight = useAvailableHeight(dims, occupied);

  const fontSize = timerFontSize({
    width: dims.width,
    maxHeight,
    landscape: dims.landscape,
    base: 150,
    advanceEm: CLOCK_EM,
  });

  if (dims.landscape) {
    // 시계 모드: 숫자가 주인공이고 나머지는 위아래 가장자리로 밀린다.
    // 폰을 눕히는 이유가 멀리서 시간을 보려는 것이라 이 우선순위가 맞다.
    return (
      <>
        <View style={styles.landscapeTop}>
          <SportsLabel text={view.sportsLabel} align="left" />
          <Logo size={18} />
        </View>

        <View style={styles.landscapeNumber}>
          <TimerNumber
            text={view.timerText}
            accent={view.accent}
            fontSize={fontSize}
          />
        </View>

        <View style={styles.landscapeBottom}>
          <View style={styles.landscapeSlot}>{slot}</View>
          <ModeBar label={view.modeLabel} accent={view.accent} compact />
          <View style={styles.landscapePause}>
            <PauseButton
              size={LANDSCAPE_PAUSE}
              onPause={onPause}
              onTap={onTap}
              hint={hint}
              hintSize={12}
            />
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <View style={styles.portraitBody}>
        <SportsLabel text={view.sportsLabel} />
        <TimerNumber
          text={view.timerText}
          accent={view.accent}
          fontSize={fontSize}
        />
        <View style={styles.modeBarWrap}>
          <ModeBar label={view.modeLabel} accent={view.accent} />
        </View>
        <View style={styles.portraitSlot}>{slot}</View>
      </View>
      <View style={styles.portraitPause}>
        <PauseButton onPause={onPause} onTap={onTap} hint={hint} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  prepBody: {
    flex: 1,
    // 계산이 어긋나도 아래 형제를 밀어내지 못하게 한다
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
    alignSelf: 'stretch',
  },
  prepFooter: {
    textAlign: 'center',
    color: color.muted,
  },

  // --- 세로 ---
  portraitBody: {
    marginTop: space.xxxl,
  },
  modeBarWrap: {
    marginTop: 22,
  },
  portraitSlot: {
    marginTop: 44,
  },
  portraitPause: {
    marginTop: 'auto',
  },

  // --- 가로 ---
  landscapeTop: {
    height: ROW.landscapeTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  landscapeNumber: {
    flex: 1,
    // flexShrink 없이는 넘친 Text 가 하단 행을 화면 밖으로 밀어낸다
    flexShrink: 1,
    minHeight: 0,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  landscapeBottom: {
    height: ROW.landscapeBottom,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.lg,
  },
  landscapeSlot: {
    flex: 1,
    justifyContent: 'center',
  },
  landscapePause: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
