import { ReactNode } from 'react';

import { CTAButton } from './CTAButton';
import { RoundDots } from './RoundDots';
import { TallyCard } from './TallyCard';
import { Accent } from './TimerDisplay';
import { TimerView } from '../core/timer/present';

type Props = {
  view: TimerView;
  accent: Accent;
  tally: number;
  onTally: (delta: 1 | -1) => void;
  onFinish: () => void;
  landscape: boolean;
};

/**
 * 03/04번 골격의 가변 슬롯 — 모드마다 다른 것이 들어간다.
 *
 * 세로와 가로가 같은 내용을 쓰고 크기만 다르므로 한 곳에 모았다.
 * 가로에서는 하단 한 줄에 들어가야 해서 높이가 84 로 줄어든다.
 */
export function TimerSlot({
  view,
  accent,
  tally,
  onTally,
  onFinish,
  landscape,
}: Props): ReactNode {
  switch (view.slot) {
    case 'dots':
      return (
        <RoundDots
          total={view.roundTotal}
          current={view.roundCurrent}
          accent={accent}
        />
      );

    case 'tally':
      return (
        <TallyCard
          label={view.tallyKind === 'reps' ? 'REPS' : 'ROUNDS'}
          count={tally}
          height={landscape ? 84 : 96}
          onIncrement={() => onTally(1)}
          onDecrement={() => onTally(-1)}
        />
      );

    case 'finish':
      return (
        <CTAButton
          label="FINISH"
          onPress={onFinish}
          variant="outline"
          height={landscape ? 84 : undefined}
          fontSize={34}
        />
      );
  }
}
