import { render } from '@testing-library/react-native';

import { MAX_DOTS } from '../theme/tokens';
import { RoundDots } from './RoundDots';

describe('RoundDots — 오버플로 규칙', () => {
  it('디자인의 8라운드는 도트로 그린다', async () => {
    const { getByTestId, queryByTestId } = await render(
      <RoundDots total={8} current={3} accent="work" />,
    );

    expect(getByTestId('round-dots')).toBeTruthy();
    expect(queryByTestId('round-progress')).toBeNull();
  });

  it('한 줄에 들어가는 한계까지는 도트를 유지한다', async () => {
    const { getByTestId } = await render(
      <RoundDots total={MAX_DOTS} current={0} accent="work" />,
    );

    expect(getByTestId('round-dots')).toBeTruthy();
  });

  it('한계를 넘으면 진행 바로 바꾼다', async () => {
    const { getByTestId, queryByTestId } = await render(
      <RoundDots total={MAX_DOTS + 1} current={0} accent="work" />,
    );

    expect(getByTestId('round-progress')).toBeTruthy();
    expect(queryByTestId('round-dots')).toBeNull();
  });

  it('타바타 최대 99라운드도 진행 바로 그린다', async () => {
    const { getByTestId } = await render(
      <RoundDots total={99} current={50} accent="work" />,
    );

    expect(getByTestId('round-progress')).toBeTruthy();
  });

  it('도트 개수는 총 라운드 수와 같다', async () => {
    const { getByTestId } = await render(
      <RoundDots total={6} current={2} accent="rest" />,
    );

    expect(getByTestId('round-dots').children).toHaveLength(6);
  });

  it('라운드 개념이 없는 모드(AMRAP · For Time)에서는 아무것도 그리지 않는다', async () => {
    const { queryByTestId } = await render(
      <RoundDots total={0} current={0} accent="work" />,
    );

    expect(queryByTestId('round-dots')).toBeNull();
    expect(queryByTestId('round-progress')).toBeNull();
  });
});
