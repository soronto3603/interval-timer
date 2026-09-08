// 패키지 루트에서 임포트하면 쓰지 않는 웨이트까지 전부 번들된다
// (Barlow Condensed 는 18종 ≈ 1.8MB). 웨이트별 서브패스로 가져온다.
import { Anton_400Regular } from '@expo-google-fonts/anton/400Regular';
import { BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed/600SemiBold';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { useFonts } from 'expo-font';

/**
 * 폰트를 등록한다. 로드에 실패해도 앱을 막지 않는다 —
 * RN 이 시스템 폰트로 떨어뜨리고 레이아웃은 유지된다. 타이머가 폰트 때문에
 * 뜨지 않는 것이 훨씬 나쁘다.
 *
 * @returns 폰트 로드가 끝났는지 (실패로 끝난 경우도 true)
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    Anton_400Regular,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
  });

  if (error) {
    console.warn('[fonts] 로드 실패, 시스템 폰트로 진행합니다', error);
    return true;
  }
  return loaded;
}
