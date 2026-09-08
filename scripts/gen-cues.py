#!/usr/bin/env python3
"""사운드 큐 3개를 합성해 assets/sounds/ 에 쓴다.

큐 음원을 파일로 받아오지 않고 생성하는 이유: 라이선스 문제가 없고, 크기가 작고,
톤을 여기서 바로 조정할 수 있다.

    python3 scripts/gen-cues.py

  countdown   3·2·1 틱. 짧고 건조하게
  work-start  상승 2연음. 라임(#B8FF2E)의 청각 대응
  rest-start  낮은 단음. 힘을 빼는 신호
"""

import math
import os
import struct
import wave

RATE = 44100
AMP = 0.55  # 헤드룸 확보. 기기 볼륨에서 클리핑 방지


def tone(freq, ms, *, attack_ms=4.0, decay=6.0, harmonic=0.0):
    """감쇠 엔벨로프를 씌운 사인 톤. attack 은 클릭 노이즈를 없애기 위한 것."""
    n = int(RATE * ms / 1000)
    attack = max(1, int(RATE * attack_ms / 1000))
    out = []
    for i in range(n):
        t = i / RATE
        env = min(1.0, i / attack) * math.exp(-decay * t / (ms / 1000))
        s = math.sin(2 * math.pi * freq * t)
        if harmonic:
            s += harmonic * math.sin(2 * math.pi * freq * 2 * t)
            s /= 1 + harmonic
        out.append(AMP * env * s)
    return out


def silence(ms):
    return [0.0] * int(RATE * ms / 1000)


def write(path, samples):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(
            b"".join(
                struct.pack("<h", max(-32768, min(32767, int(s * 32767))))
                for s in samples
            )
        )
    return os.path.getsize(path)


CUES = {
    # 1초에 한 번씩 세 번 울린다. 짧게 끊어야 다음 틱과 겹치지 않는다
    "countdown": tone(1000, 55, decay=9.0),
    # 상승 2연음. 시작 신호라 배음을 살짝 넣어 밝게
    "work-start": (
        tone(1175, 80, decay=6.0, harmonic=0.3)
        + silence(45)
        + tone(1568, 130, decay=5.0, harmonic=0.3)
    ),
    # 단음, 낮고 길게
    "rest-start": tone(698, 230, decay=4.0, harmonic=0.15),
}


def main():
    out_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "assets",
        "sounds",
    )
    os.makedirs(out_dir, exist_ok=True)
    for name, samples in CUES.items():
        path = os.path.join(out_dir, f"{name}.wav")
        size = write(path, samples)
        print(f"{name}.wav  {len(samples) / RATE * 1000:.0f}ms  {size:,} bytes")


if __name__ == "__main__":
    main()
