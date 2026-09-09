/**
 * CSS side-effect import 를 위한 선언.
 *
 * `vite/client` 를 참조하지 않는 이유: tsconfig 의 typeRoots 를 web/ 안으로
 * 못박아 두었고(상위 RN 앱의 node_modules 로 타입 탐색이 새어 올라가는 것을
 * 막기 위해), 그 상태에서는 패키지 서브패스 타입인 vite/client 가 잡히지 않는다.
 * 실제로 필요한 것은 아래 한 줄뿐이다.
 */
declare module '*.css';
