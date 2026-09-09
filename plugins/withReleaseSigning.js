const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * 릴리스 서명 설정을 android/app/build.gradle 에 넣는다.
 *
 * 왜 플러그인인가: `expo prebuild --clean` 이 android/ 를 통째로 다시 만들기 때문에
 * build.gradle 을 손으로 고쳐 두면 다음 prebuild 에서 사라진다. Expo 기본값은
 * release 를 **debug 키로 서명**하므로(`signingConfig signingConfigs.debug`),
 * 그대로 두고 빌드하면 Play 에 올릴 수 없는 AAB 가 나온다.
 *
 * 비밀값은 저장소에 두지 않는다. gradle 프로퍼티로 받고, 없으면 debug 서명으로
 * 떨어져서 로컬 개발은 그대로 되게 한다.
 *
 * 빌드 시:
 *   ./gradlew bundleRelease \
 *     -PPULSEBOX_STORE_FILE=$HOME/keys/pulse-box-upload.keystore \
 *     -PPULSEBOX_STORE_PASSWORD=... -PPULSEBOX_KEY_ALIAS=... -PPULSEBOX_KEY_PASSWORD=...
 *
 * 또는 ~/.gradle/gradle.properties 에 같은 키를 넣어 두면 플래그 없이 빌드된다.
 */
const SIGNING_CONFIG = `
        release {
            // 프로퍼티가 없으면 아래 buildTypes 에서 debug 서명으로 떨어진다
            if (project.hasProperty('PULSEBOX_STORE_FILE')) {
                storeFile file(PULSEBOX_STORE_FILE)
                storePassword PULSEBOX_STORE_PASSWORD
                keyAlias PULSEBOX_KEY_ALIAS
                keyPassword PULSEBOX_KEY_PASSWORD
            }
        }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;

    if (gradle.includes('PULSEBOX_STORE_FILE')) return cfg;

    // signingConfigs { debug { ... } } 뒤에 release 를 추가
    gradle = gradle.replace(
      /(signingConfigs\s*\{)/,
      `$1${SIGNING_CONFIG}`,
    );

    // release 빌드타입이 debug 키를 쓰는 기본값을 갈아낀다
    gradle = gradle.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
      `$1signingConfig project.hasProperty('PULSEBOX_STORE_FILE') ? signingConfigs.release : signingConfigs.debug`,
    );

    cfg.modResults.contents = gradle;
    return cfg;
  });
};
