import '../tokens.css';
import './privacy.css';

/** 문서 개정일. 내용을 고치면 함께 올린다. */
const UPDATED = '2026년 9월 9일';
const CONTACT = 'huy.brown7630@gmail.com';

/**
 * 개인정보 처리방침.
 *
 * 내용은 앱 코드에서 확인한 사실만 쓴다:
 *   - 네트워크 호출 코드 0건 (fetch/axios/WebSocket 없음)
 *   - 분석 · 광고 SDK 0개
 *   - AsyncStorage 로컬 저장 7개 필드 (아래 표와 일치)
 * Play Console 의 데이터 보안 양식과 문구가 어긋나면 심사에서 문제가 되므로,
 * 이 페이지를 고치면 그 양식도 같이 고쳐야 한다.
 */
export function Privacy() {
  return (
    <main className="doc">
      <header className="doc-head">
        <a className="logo" href="/">
          PULSE <em>BOX</em>
        </a>
        <p className="sports doc-kicker">Privacy Policy</p>
        <h1>개인정보 처리방침</h1>
        <p className="doc-updated">최종 개정일 · {UPDATED}</p>
      </header>

      <section className="callout">
        <h2>요약</h2>
        <p>
          PULSE BOX는 <strong>어떤 개인정보도 수집하지 않습니다.</strong> 서버가
          없고, 앱이 외부로 데이터를 보내는 코드 자체가 없습니다. 설정과 운동
          기록은 사용자의 기기 안에만 저장되며, 앱을 삭제하면 함께 지워집니다.
        </p>
      </section>

      <section>
        <h2>1. 수집하지 않는 것</h2>
        <p>다음 정보를 일절 수집하지 않습니다.</p>
        <ul>
          <li>이름 · 이메일 · 전화번호 등 신원 정보</li>
          <li>위치 정보</li>
          <li>연락처 · 사진 · 파일</li>
          <li>기기 식별자 · 광고 식별자</li>
          <li>사용 기록 · 분석 데이터 · 크래시 로그</li>
        </ul>
        <p>
          계정 기능이 없어 회원가입이나 로그인을 요구하지 않으며, 결제 기능도
          없습니다.
        </p>
      </section>

      <section>
        <h2>2. 기기에만 저장되는 것</h2>
        <p>
          앱을 다시 열었을 때 설정이 유지되도록, 아래 값을 사용자 기기의 앱 저장
          공간에 보관합니다. <strong>외부로 전송되지 않습니다.</strong>
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>저장 항목</th>
                <th>내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>언어</td>
                <td>한국어 / English / 시스템 설정 따르기</td>
              </tr>
              <tr>
                <td>진동</td>
                <td>켬 / 끔</td>
              </tr>
              <tr>
                <td>화면 유지</td>
                <td>켬 / 끔</td>
              </tr>
              <tr>
                <td>알림음</td>
                <td>카운트다운 · 운동 시작 · 휴식 시작 각각의 켬/끔</td>
              </tr>
              <tr>
                <td>모드별 설정</td>
                <td>
                  타바타 · AMRAP · EMOM · FOR TIME 각 모드의 시간과 라운드 수
                </td>
              </tr>
              <tr>
                <td>마지막 사용 모드</td>
                <td>홈 화면의 빠른 시작에 쓰입니다</td>
              </tr>
              <tr>
                <td>마지막 완료 기록</td>
                <td>
                  직전에 마친 운동 한 건의 모드 · 설정 · 완료 시각 · 총 시간
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          앱을 삭제하거나 Android 설정에서 앱 데이터를 지우면 위 값은 모두
          삭제됩니다. 별도의 삭제 요청 절차가 필요하지 않습니다.
        </p>
      </section>

      <section>
        <h2>3. 제3자 서비스</h2>
        <p>
          분석 도구, 광고 네트워크, 크래시 리포팅 등 <strong>어떤 제3자 SDK도
          포함하지 않습니다.</strong> 따라서 제3자에게 제공되거나 위탁되는
          정보가 없습니다.
        </p>
      </section>

      <section>
        <h2>4. 앱이 요청하는 권한</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>권한</th>
                <th>용도</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>진동 (VIBRATE)</td>
                <td>운동 · 휴식 전환 시 촉각 알림</td>
              </tr>
              <tr>
                <td>오디오 설정 변경 (MODIFY_AUDIO_SETTINGS)</td>
                <td>
                  무음 모드에서도 알림음이 들리도록, 다른 앱의 음악을 끊지 않도록
                  재생 방식을 지정
                </td>
              </tr>
              <tr>
                <td>절전 해제 (WAKE_LOCK)</td>
                <td>
                  오디오 재생 라이브러리가 포함한 권한입니다. 운동 중 화면
                  유지는 이 권한이 아니라 화면 켜두기 플래그로 처리합니다
                </td>
              </tr>
              <tr>
                <td>네트워크 상태 · 인터넷</td>
                <td>
                  Android 앱 구성상 포함되지만 <strong>앱은 네트워크를 사용하지
                  않습니다</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          마이크, 카메라, 위치, 저장소, 연락처 권한은 요청하지 않습니다.
        </p>
      </section>

      <section>
        <h2>5. 아동의 개인정보</h2>
        <p>
          이 앱은 개인정보를 수집하지 않으므로 아동의 개인정보 또한 수집하지
          않습니다.
        </p>
      </section>

      <section>
        <h2>6. 방침 변경</h2>
        <p>
          내용이 바뀌면 이 페이지를 갱신하고 상단의 개정일을 고칩니다. 수집
          항목이 생기는 변경이라면 앱 업데이트 시 함께 알립니다.
        </p>
      </section>

      <section>
        <h2>7. 문의</h2>
        <p>
          이 방침이나 앱에 대한 문의는 아래로 보내주세요.
          <br />
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </section>

      <footer className="doc-foot">
        <a href="/">← PULSE BOX</a>
        <span className="sports">PULSE BOX 1.0</span>
      </footer>
    </main>
  );
}
