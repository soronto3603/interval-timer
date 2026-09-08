import { getLocales } from 'expo-localization';

import { useSettings } from '../store/settings';
import { Lang, STRINGS, Strings } from './strings';

/** 시스템 언어. 한국어가 아니면 영문판을 쓴다. */
function systemLang(): Lang {
  const code = getLocales()[0]?.languageCode;
  return code === 'ko' ? 'ko' : 'en';
}

export function useLang(): Lang {
  const pref = useSettings((s) => s.language);
  return pref === 'system' ? systemLang() : pref;
}

/** 문자열 테이블. 디스플레이 워드(TABATA·WORK·REST)는 여기 없다 — 양 언어 공통이다. */
export function useT(): Strings {
  return STRINGS[useLang()] as Strings;
}
