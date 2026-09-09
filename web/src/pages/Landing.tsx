import '../tokens.css';
import './landing.css';

const MODES = [
  {
    name: 'TABATA',
    desc: '운동과 휴식을 라운드 수만큼 반복합니다. 기본값은 20초 / 10초 × 8라운드 — 정통 프로토콜 그대로 4분입니다.',
  },
  {
    name: 'AMRAP',
    desc: '정해진 시간 안에 최대한 많이. 화면을 탭해 라운드나 렙을 세면서 진행합니다.',
  },
  {
    name: 'EMOM',
    desc: '정해진 인터벌을 개수만큼 반복합니다. 인터벌 길이는 15초부터 5분까지.',
  },
  {
    name: 'FOR TIME',
    desc: '시간을 세어 올립니다. 제한 시간을 걸 수도 있고, 없이 기록만 남길 수도 있습니다.',
  },
];

/** 실제 앱에서 찍은 스크린샷이다. 디자인 렌더가 아니다 — Play 는 스토어
 *  이미지가 실물을 반영하도록 요구한다. */
const SHOTS = [
  { src: '/screenshots/1-home.png', alt: '운동 선택 화면' },
  { src: '/screenshots/2-tabata-setup.png', alt: '타바타 설정 — 운동 · 휴식 · 라운드' },
  { src: '/screenshots/3-work.png', alt: '운동 중 타이머' },
  { src: '/screenshots/4-rest.png', alt: '휴식 중 타이머' },
  { src: '/screenshots/5-complete.png', alt: '운동 완료 요약' },
];

export function Landing() {
  return (
    <>
      <header className="nav">
        <div className="wrap nav-inner">
          <span className="logo">
            PULSE <em>BOX</em>
          </span>
          <a className="nav-link" href="/privacy/">
            개인정보 처리방침
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap hero-inner">
            <div className="hero-copy">
              <p className="sports hero-kicker">Functional Fitness Timer</p>
              <h1>
                운동 중엔
                <br />
                <span className="lime">화면을 안 봐도</span>
                <br />
                들린다
              </h1>
              <p className="lede">
                타바타 · AMRAP · EMOM · FOR TIME. 운동과 휴식, 완주가 서로 완전히
                다른 소리로 울려서, 폰을 벤치에 올려두고도 지금 무엇이 시작됐는지
                알 수 있습니다.
              </p>
              <ul className="points">
                <li>멀리서 읽히는 큰 숫자 — 눕히면 더 커집니다</li>
                <li>3·2·1 카운트다운과 10초 전 예고</li>
                <li>운동 중 화면이 꺼지지 않습니다</li>
                <li>한국어 · English</li>
              </ul>
              <p className="badge-note sports">Google Play 출시 준비 중</p>
            </div>

            <div className="hero-shot">
              <img
                src="/screenshots/3-work.png"
                alt="운동 중 타이머 화면"
                width={1080}
                height={2424}
                loading="eager"
              />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2 className="section-title">모드</h2>
            <div className="modes">
              {MODES.map((m) => (
                <article className="mode" key={m.name}>
                  <h3>{m.name}</h3>
                  <p>{m.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2 className="section-title">화면</h2>
            <div className="shots">
              {SHOTS.map((s) => (
                <img
                  key={s.src}
                  src={s.src}
                  alt={s.alt}
                  width={1080}
                  height={2424}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2 className="section-title">눕히면 시계가 된다</h2>
            <p className="lede">
              폰을 가로로 두면 숫자가 화면 높이에 맞춰 커집니다. 벤치에 올려두고
              멀리서, 또는 여럿이 같이 볼 때를 위한 배치입니다.
            </p>
            <img
              className="wide-shot"
              src="/screenshots/1-work-landscape.png"
              alt="가로 모드 — 화면을 채우는 큰 타이머"
              width={2424}
              height={1080}
              loading="lazy"
            />
          </div>
        </section>

        <section className="section">
          <div className="wrap privacy-cta">
            <h2 className="section-title">수집하는 개인정보가 없습니다</h2>
            <p className="lede">
              서버가 없고, 앱이 외부로 데이터를 보내는 코드 자체가 없습니다. 설정과
              기록은 기기 안에만 남고 앱을 삭제하면 함께 지워집니다. 분석 도구도
              광고도 넣지 않았습니다.
            </p>
            <a className="cta" href="/privacy/">
              처리방침 전문 보기
            </a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-inner">
          <span className="sports">PULSE BOX 1.0</span>
          <nav>
            <a href="/privacy/">개인정보 처리방침</a>
            <a href="mailto:huy.brown7630@gmail.com">문의</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
