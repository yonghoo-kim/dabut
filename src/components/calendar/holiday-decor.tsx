import type { ComponentType } from "react";
import type { HolidayThemeKey } from "@/lib/calendar/holiday-theme";
import { ChristmasDecor } from "./christmas-decor";

/**
 * 국경일/명절 칸의 작은 애니메이션 장면들. 모두 인라인 SVG + CSS 애니메이션(globals.css 의 .hd-*)이라
 * 가볍고, "동작 줄이기" 설정이면 정지 화면으로 보인다. 칸 아래쪽에 깔리고 클릭은 통과한다.
 */
const sceneClass =
  "pointer-events-none absolute bottom-0.5 left-1/2 w-[94%] max-w-[4.5rem] -translate-x-1/2 overflow-visible";

/** 신정: 위에서 내려다본 알록달록 고명 떡국에서 김이 모락모락. */
function NewYearDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      {[16, 24, 32].map((x, i) => (
        <path
          key={x}
          className="hd-steam"
          style={{ animationDelay: `${i * 0.7}s` }}
          d={`M${x} 12 q-2.5 -3.5 0 -6.5 q2.5 -3 0 -6`}
          fill="none"
          stroke="#c9b8a8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
      {/* 그릇 (위에서 본 모습) */}
      <ellipse cx="24" cy="27" rx="20" ry="11.5" fill="#ffffff" stroke="#d9cfc2" strokeWidth="0.6" />
      <ellipse cx="24" cy="27" rx="20" ry="11.5" fill="none" stroke="#3f6fd8" strokeWidth="0.9" strokeDasharray="2.2 1.4" />
      <ellipse cx="24" cy="26.6" rx="17" ry="9.2" fill="#f1e2c4" />
      {/* 떡 */}
      {[
        [15, 25, -20],
        [21, 22.5, 15],
        [28, 23, -10],
        [33.5, 26, 25],
        [17.5, 30, 10],
        [25, 31, -15],
        [31, 30.5, 5],
      ].map(([cx, cy, r], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="3.6" ry="1.9" fill="#ffffff" stroke="#e3d8c6" strokeWidth="0.4" transform={`rotate(${r} ${cx} ${cy})`} />
      ))}
      {/* 고명: 소고기, 노른자 지단, 흰자 지단, 파, 김 */}
      <g transform="rotate(-8 24 25)">
        <rect x="19.5" y="24.3" width="7" height="1.3" rx="0.6" fill="#8a4b2a" />
        <rect x="21" y="26.1" width="6" height="1.2" rx="0.6" fill="#a05a32" />
        <rect x="26.5" y="23.4" width="6.4" height="1.1" rx="0.5" fill="#ffc928" />
        <rect x="27" y="25.2" width="5.6" height="1.1" rx="0.5" fill="#ffd84a" />
        <rect x="15.8" y="26.6" width="6" height="1.1" rx="0.5" fill="#fffaf0" stroke="#efe6d4" strokeWidth="0.3" />
        <rect x="16.6" y="28.3" width="5.4" height="1.1" rx="0.5" fill="#fffaf0" stroke="#efe6d4" strokeWidth="0.3" />
        <rect x="22.5" y="28.2" width="6" height="0.9" rx="0.4" fill="#2b2b2b" />
      </g>
      {[
        [20, 21.5],
        [29.5, 28.5],
        [14.5, 23.5],
        [33, 23],
        [24.5, 30.3],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1" fill="#5cb85c" stroke="#3e8e3e" strokeWidth="0.3" />
      ))}
    </svg>
  );
}

function YutPlayer({ x, robe, sleeve, flip }: { x: number; robe: string; sleeve: string; flip?: boolean }) {
  const dir = flip ? -1 : 1;
  return (
    <g className="hd-cheer" style={{ animationDelay: flip ? "0.3s" : "0s" }}>
      <circle cx={x} cy="21" r="2.8" fill="#ffd9b8" />
      <path d={`M${x - 2.8} 20.4 q2.8 -4.6 5.6 0`} fill="#2f2420" />
      <path d={`M${x - 3.4} 33 L${x - 2.2} 24 L${x + 2.2} 24 L${x + 3.4} 33 Z`} fill={robe} />
      {/* 색동 소매: 팔을 들어 환호 */}
      <line x1={x + 2 * dir} y1="25" x2={x + 5 * dir} y2="20.5" stroke={sleeve} strokeWidth="1.6" strokeLinecap="round" />
      <line x1={x + 3.1 * dir} y1="23.4" x2={x + 4 * dir} y2="22.1" stroke="#ffd166" strokeWidth="1.6" />
      <line x1={x - 2 * dir} y1="25" x2={x - 4 * dir} y2="29" stroke={sleeve} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

/** 설날: 윷놀이 — 윷가락 네 개가 빙글빙글 던져졌다 떨어진다. */
function SeollalDecor() {
  const sticks = [
    { x: 19, rot: -20, delay: 0, flat: false },
    { x: 22.5, rot: 15, delay: 0.08, flat: true },
    { x: 26, rot: -8, delay: 0.16, flat: false },
    { x: 29.5, rot: 25, delay: 0.24, flat: true },
  ];
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      {/* 멍석 */}
      <ellipse cx="24" cy="35" rx="21" ry="3.6" fill="#d8b77a" />
      <ellipse cx="24" cy="35" rx="18" ry="2.6" fill="none" stroke="#b8925a" strokeWidth="0.5" strokeDasharray="1.2 1" />
      {sticks.map((st, i) => (
        <g key={i} className="hd-yut" style={{ animationDelay: `${st.delay}s` }}>
          <g transform={`rotate(${st.rot} ${st.x} 30)`}>
            <rect x={st.x - 0.9} y="26" width="1.8" height="8" rx="0.9" fill={st.flat ? "#f6e3b4" : "#a8743f"} stroke="#7a4f2a" strokeWidth="0.35" />
            {!st.flat && <line x1={st.x} y1="27.2" x2={st.x} y2="32.8" stroke="#7a4f2a" strokeWidth="0.35" strokeDasharray="0.8 0.8" />}
          </g>
        </g>
      ))}
      <YutPlayer x={7} robe="#ff7aa2" sleeve="#5aa9ff" />
      <YutPlayer x={41} robe="#6fbf73" sleeve="#ff6b6b" flip />
    </svg>
  );
}

/** 작은 태극기 (깃발 부분만, 0,0 기준 20x13). */
function MiniTaegukgi() {
  return (
    <g>
      <rect x="0" y="0" width="20" height="13.4" fill="#ffffff" stroke="#d6d6d6" strokeWidth="0.35" />
      <path d="M6.7 6.7 a3.3 3.3 0 0 1 6.6 0 a1.65 1.65 0 0 1 -3.3 0 a1.65 1.65 0 0 0 -3.3 0 Z" fill="#cd2e3a" transform="rotate(-33 10 6.7)" />
      <path d="M6.7 6.7 a3.3 3.3 0 0 0 6.6 0 a1.65 1.65 0 0 1 -3.3 0 a1.65 1.65 0 0 0 -3.3 0 Z" fill="#0047a0" transform="rotate(-33 10 6.7)" />
      <g fill="#1a1a1a">
        <g transform="rotate(-33 3.2 2.8)">
          <rect x="1.8" y="2" width="2.8" height="0.45" />
          <rect x="1.8" y="2.7" width="2.8" height="0.45" />
          <rect x="1.8" y="3.4" width="2.8" height="0.45" />
        </g>
        <g transform="rotate(-33 16.8 10.6)">
          <rect x="15.4" y="9.8" width="1.2" height="0.45" />
          <rect x="16.9" y="9.8" width="1.2" height="0.45" />
          <rect x="15.4" y="10.5" width="1.2" height="0.45" />
          <rect x="16.9" y="10.5" width="1.2" height="0.45" />
          <rect x="15.4" y="11.2" width="1.2" height="0.45" />
          <rect x="16.9" y="11.2" width="1.2" height="0.45" />
        </g>
        <g transform="rotate(33 16.8 2.8)">
          <rect x="15.4" y="2" width="2.8" height="0.45" />
          <rect x="15.4" y="2.7" width="1.2" height="0.45" />
          <rect x="16.9" y="2.7" width="1.2" height="0.45" />
          <rect x="15.4" y="3.4" width="2.8" height="0.45" />
        </g>
        <g transform="rotate(33 3.2 10.6)">
          <rect x="1.8" y="9.8" width="1.2" height="0.45" />
          <rect x="3.3" y="9.8" width="1.2" height="0.45" />
          <rect x="1.8" y="10.5" width="2.8" height="0.45" />
          <rect x="1.8" y="11.2" width="1.2" height="0.45" />
          <rect x="3.3" y="11.2" width="1.2" height="0.45" />
        </g>
      </g>
    </g>
  );
}

/** 삼일절: 흰 저고리·검정 치마의 유관순 열사가 태극기를 흔들며 "만세!" */
function SamilDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      <text className="hd-manse" x="8" y="10" fontSize="5.4" fontWeight="800" textAnchor="middle" fill="#cd2e3a">
        만세!
      </text>
      {/* 태극기를 든 팔 (어깨 기준으로 흔듦) */}
      <g className="hd-wave-arm">
        <line x1="19" y1="24" x2="23" y2="15" stroke="#f7f4ee" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="23" cy="14.6" r="1.1" fill="#f3d2b0" />
        <rect x="22.6" y="3" width="0.8" height="13" rx="0.4" fill="#8a6a4c" />
        {/* CSS 애니메이션 transform 이 SVG transform 속성을 덮어쓰지 않도록 위치는 바깥 g 에 둔다. */}
        <g transform="translate(23.4 3.2) scale(0.72)">
          <g className="hd-flag">
            <MiniTaegukgi />
          </g>
        </g>
      </g>
      {/* 사람 */}
      <path d="M10 39 Q11 29 16 28 Q21 29 22 39 Z" fill="#232323" />
      <path d="M12 29.5 Q16 23.6 20 29.5 L19.4 31 Q16 32 12.6 31 Z" fill="#f7f4ee" stroke="#ddd6c8" strokeWidth="0.3" />
      <path d="M16 25.6 L15 31 L17 31 Z" fill="#9b1c2a" />
      <line x1="13" y1="25.5" x2="10.8" y2="31" stroke="#f7f4ee" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="20.5" r="4" fill="#f3d2b0" />
      <path d="M12 20 Q12 15.6 16 15.6 Q20 15.6 20 20 Q18.4 17.6 16 17.8 Q13.6 17.6 12 20 Z" fill="#1f1a17" />
      <path d="M12.3 20.5 Q11.4 24 12.4 26.4" fill="none" stroke="#1f1a17" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="14.6" cy="20.6" r="0.45" fill="#2a2a2a" />
      <circle cx="17.4" cy="20.6" r="0.45" fill="#2a2a2a" />
      <ellipse className="hd-shout" cx="16" cy="22.6" rx="0.9" ry="0.7" fill="#9b3a3a" />
    </svg>
  );
}

function Kid({ x, shirt, delay }: { x: number; shirt: string; delay: number }) {
  return (
    <g className="hd-kid" style={{ animationDelay: `${delay}s` }}>
      <circle cx={x} cy="18" r="3" fill="#ffd9b8" />
      <path d={`M${x - 3} 17 q3 -5 6 0`} fill="#3a2a22" />
      <rect x={x - 2.4} y="21" width="4.8" height="6.5" rx="1.6" fill={shirt} />
      <line className="hd-leg-a" style={{ animationDelay: `${delay}s` }} x1={x - 1} y1="27" x2={x - 2.5} y2="32" stroke="#4a4a6a" strokeWidth="1.6" strokeLinecap="round" />
      <line className="hd-leg-b" style={{ animationDelay: `${delay}s` }} x1={x + 1} y1="27" x2={x + 2.5} y2="32" stroke="#4a4a6a" strokeWidth="1.6" strokeLinecap="round" />
      <line x1={x - 2.4} y1="22.5" x2={x - 5} y2="19" stroke={shirt} strokeWidth="1.4" strokeLinecap="round" />
      <line x1={x + 2.4} y1="22.5" x2={x + 5} y2="19" stroke={shirt} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/** 어린이날: 아이들이 뛰어놀고 공이 통통. */
function ChildrenDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      <circle cx="40" cy="7" r="4" fill="#ffd166" className="hd-sun" />
      <path d="M0 34 Q24 30 48 34 L48 40 L0 40 Z" fill="#8fd18a" />
      <Kid x={14} shirt="#ff7a7a" delay={0} />
      <Kid x={33} shirt="#5aa9ff" delay={0.35} />
      <circle className="hd-ball" cx="24" cy="30" r="2.4" fill="#ffb02e" stroke="#e08a00" strokeWidth="0.4" />
    </svg>
  );
}

/** 석가탄신일: 연꽃이 물 위에 둥둥. */
function BuddhaDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      <g className="hd-lotus">
        <ellipse cx="24" cy="29" rx="11" ry="2.6" fill="#5fb56b" />
        <path d="M24 28 C18 26 17 19 19 15 C21 19 23 22 24 28 Z" fill="#ff9cc4" />
        <path d="M24 28 C30 26 31 19 29 15 C27 19 25 22 24 28 Z" fill="#ff9cc4" />
        <path d="M24 28 C20 24 20 16 24 11 C28 16 28 24 24 28 Z" fill="#ffb8d4" />
        <path d="M24 28 C16 28 13 23 13 20 C17 22 20 25 24 28 Z" fill="#ff86b6" />
        <path d="M24 28 C32 28 35 23 35 20 C31 22 28 25 24 28 Z" fill="#ff86b6" />
        <circle cx="24" cy="24.5" r="1.4" fill="#ffd166" />
      </g>
      <path className="hd-wave" d="M-8 33 q4 -2 8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 L64 40 L-8 40 Z" fill="#7cc6ff" opacity="0.75" />
      <path className="hd-wave hd-wave-2" d="M-8 35 q4 -2 8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 L64 40 L-8 40 Z" fill="#4fa8f0" opacity="0.7" />
    </svg>
  );
}

function Soldier({ x }: { x: number }) {
  return (
    <g>
      <path d={`M${x - 3.2} 13 q3.2 -4.5 6.4 0 Z`} fill="#4b5a3a" />
      <circle cx={x} cy="14.5" r="2.4" fill="#f1cfae" />
      <rect x={x - 3} y="17" width="6" height="9" rx="1.2" fill="#5b6b45" />
      <rect x={x - 2.6} y="26" width="2.2" height="7" fill="#4b5a3a" />
      <rect x={x + 0.4} y="26" width="2.2" height="7" fill="#4b5a3a" />
      <rect x={x - 2.8} y="32.4" width="2.6" height="1.4" rx="0.5" fill="#2a2a2a" />
      <rect x={x + 0.2} y="32.4" width="2.6" height="1.4" rx="0.5" fill="#2a2a2a" />
      {/* 소총 */}
      <rect x={x + 3.2} y="11" width="0.9" height="15" rx="0.4" fill="#3a3a3a" />
    </g>
  );
}

/** 현충일: 태극기 아래 나라를 지키는 군인들 (태극기만 잔잔히 펄럭). */
function MemorialDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      <rect x="23.4" y="2" width="1.1" height="33" fill="#8a6a4c" />
      <g className="hd-flag hd-flag-slow">
        <rect x="24.5" y="3" width="13" height="8.6" fill="#ffffff" stroke="#d6d6d6" strokeWidth="0.3" />
        <circle cx="31" cy="7.3" r="2.2" fill="#cd2e3a" />
        <path d="M28.8 7.3 a2.2 2.2 0 0 0 4.4 0 Z" fill="#0047a0" />
      </g>
      <Soldier x={13} />
      <Soldier x={35} />
      <path d="M0 35 L48 35 L48 40 L0 40 Z" fill="#c9c2b4" />
    </svg>
  );
}

/** 추석: 보름달을 보며 두 손 모아 소원 비는 모습. */
function ChuseokDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      <circle className="hd-moon-glow" cx="30" cy="11" r="10" fill="#ffe08a" opacity="0.35" />
      <circle cx="30" cy="11" r="7" fill="#ffd65a" />
      <circle cx="27.5" cy="9.5" r="1.2" fill="#f2c443" />
      <circle cx="32" cy="13" r="0.9" fill="#f2c443" />
      {[
        [10, 6, 0],
        [43, 20, 0.6],
        [18, 3, 1.2],
      ].map(([x, y, d], i) => (
        <path key={i} className="hd-twinkle" style={{ animationDelay: `${d}s` }} d={`M${x} ${y - 1.6} L${x + 0.5} ${y - 0.5} L${x + 1.6} ${y} L${x + 0.5} ${y + 0.5} L${x} ${y + 1.6} L${x - 0.5} ${y + 0.5} L${x - 1.6} ${y} L${x - 0.5} ${y - 0.5} Z`} fill="#fff3b0" />
      ))}
      <path d="M0 34 Q14 27 30 32 Q40 35 48 32 L48 40 L0 40 Z" fill="#6b4f8a" opacity="0.55" />
      <g className="hd-pray">
        <circle cx="14" cy="22.5" r="2.6" fill="#3d2d4f" />
        <path d="M10 34 Q10 25 14 25 Q18 25 18 34 Z" fill="#3d2d4f" />
        <path d="M14 26.5 L16.6 24.2 L15.6 28 Z" fill="#3d2d4f" />
      </g>
    </svg>
  );
}

/** 개천절: 하늘이 열리며 산 너머로 해가 떠오른다. */
function FoundationDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      <g className="hd-sunrise">
        <g className="hd-rays">
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x="23.4" y="7" width="1.2" height="4" rx="0.6" fill="#ffb347" transform={`rotate(${i * 36} 24 19)`} />
          ))}
        </g>
        <circle cx="24" cy="19" r="6" fill="#ff8c42" />
      </g>
      <g className="hd-cloud-l">
        <ellipse cx="9" cy="10" rx="6" ry="2.4" fill="#ffffff" opacity="0.9" />
        <ellipse cx="12" cy="8.6" rx="3.4" ry="2.2" fill="#ffffff" opacity="0.9" />
      </g>
      <g className="hd-cloud-r">
        <ellipse cx="39" cy="12" rx="6" ry="2.4" fill="#ffffff" opacity="0.9" />
        <ellipse cx="36" cy="10.6" rx="3.4" ry="2.2" fill="#ffffff" opacity="0.9" />
      </g>
      <path d="M0 40 L0 30 L10 20 L18 28 L26 18 L36 29 L42 24 L48 30 L48 40 Z" fill="#3e8e5e" />
      <path d="M10 20 L13 23 L7 23 Z M26 18 L29.5 22 L22.5 22 Z" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}

/** 한글날: 세종대왕님이 "나랏말싸미"를 한 글자씩 읊는다. */
function HangulDecor() {
  const chars = ["나", "랏", "말", "싸", "미"];
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      {/* 말풍선 */}
      <rect x="2" y="1" width="44" height="11" rx="5" fill="#ffffff" stroke="#c8b98f" strokeWidth="0.6" />
      <path d="M30 12 L33 15.5 L34 12 Z" fill="#ffffff" stroke="#c8b98f" strokeWidth="0.6" />
      <rect x="29.6" y="11.2" width="5" height="1.2" fill="#ffffff" />
      {chars.map((c, i) => (
        <text
          key={c}
          className="hd-char"
          style={{ animationDelay: `${i * 0.45}s` }}
          x={8 + i * 8}
          y="9.3"
          fontSize="7"
          fontWeight="700"
          textAnchor="middle"
          fill="#4a3a1e"
        >
          {c}
        </text>
      ))}
      {/* 세종대왕 (익선관, 곤룡포) */}
      <g className="hd-king">
        <rect x="31" y="17" width="10" height="3" rx="1.4" fill="#1f1f1f" />
        <ellipse cx="33" cy="16.4" rx="1.6" ry="2.2" fill="#1f1f1f" />
        <ellipse cx="39" cy="16.4" rx="1.6" ry="2.2" fill="#1f1f1f" />
        <circle cx="36" cy="22.5" r="3.4" fill="#f3d2b0" />
        <path d="M34.4 25.2 q1.6 2.4 3.2 0" fill="#3a2a22" />
        <path d="M28 40 Q28 27 36 26.5 Q44 27 44 40 Z" fill="#c8102e" />
        <circle cx="36" cy="31.5" r="2.6" fill="#f2c94c" />
        <rect x="29" y="34" width="14" height="1.6" fill="#7a1f1f" />
      </g>
      {/* 두루마리 */}
      <rect x="6" y="28" width="16" height="9" rx="1" fill="#f6ecd2" stroke="#c8b98f" strokeWidth="0.5" />
      <rect x="4.6" y="27.3" width="1.8" height="10.4" rx="0.9" fill="#b08a5a" />
      <rect x="21.6" y="27.3" width="1.8" height="10.4" rx="0.9" fill="#b08a5a" />
      {[9, 12, 15, 18].map((x) => (
        <line key={x} x1={x} y1="30" x2={x} y2="35" stroke="#7a6a4a" strokeWidth="0.6" />
      ))}
    </svg>
  );
}

/** 제헌절: 의사봉이 받침을 땅땅땅 세 번 두드린다. */
function ConstitutionDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      {/* 헌법 책 */}
      <rect x="4" y="22" width="13" height="15" rx="1" fill="#2f4f8f" />
      <rect x="5.4" y="23.4" width="10.2" height="12.2" rx="0.6" fill="none" stroke="#e8c66a" strokeWidth="0.6" />
      <text x="10.5" y="31.5" fontSize="4.6" fontWeight="700" textAnchor="middle" fill="#e8c66a">헌법</text>
      {/* 받침 */}
      <ellipse cx="31" cy="35.5" rx="10" ry="2.2" fill="#6b4226" />
      <rect x="23" y="31" width="16" height="4.6" rx="1.4" fill="#8a5a32" />
      <ellipse cx="31" cy="31" rx="8" ry="1.6" fill="#a8743f" />
      {/* 충격선 */}
      <g className="hd-impact">
        <path d="M21 27 l-3 -2 M22 24 l-2 -3.5 M41 27 l3 -2 M40 24 l2 -3.5" stroke="#e0a030" strokeWidth="1" strokeLinecap="round" />
      </g>
      {/* 의사봉 */}
      <g className="hd-gavel">
        <rect x="31" y="9" width="2" height="17" rx="1" fill="#7a4a24" transform="rotate(45 32 17.5)" />
        <rect x="24" y="19" width="12" height="6" rx="2" fill="#9a6232" transform="rotate(45 30 22)" />
        <rect x="25.4" y="20.6" width="1.4" height="2.8" fill="#e8c66a" transform="rotate(45 30 22)" />
        <rect x="33.2" y="20.6" width="1.4" height="2.8" fill="#e8c66a" transform="rotate(45 30 22)" />
      </g>
    </svg>
  );
}

function Cheerer({ x, robe, skin = "#f3d2b0", delay, flag }: { x: number; robe: string; skin?: string; delay: number; flag?: boolean }) {
  return (
    <g className="hd-hop-cheer" style={{ animationDelay: `${delay}s` }}>
      <path d={`M${x - 3.6} 36 Q${x - 3} 27.5 ${x} 27 Q${x + 3} 27.5 ${x + 3.6} 36 Z`} fill={robe} />
      <circle cx={x} cy="23.6" r="2.8" fill={skin} />
      <path d={`M${x - 2.8} 23 q2.8 -4.4 5.6 0`} fill="#231c18" />
      <g className="hd-arms" style={{ animationDelay: `${delay}s` }}>
        <line x1={x - 2} y1="28.4" x2={x - 4.6} y2="22.4" stroke={robe} strokeWidth="1.5" strokeLinecap="round" />
        <line x1={x + 2} y1="28.4" x2={x + 4.6} y2="22.4" stroke={robe} strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {flag && (
        <g transform={`translate(${x + 4.2} 14.6) scale(0.32)`}>
          <rect x="-1" y="0" width="1.6" height="26" fill="#8a6a4c" />
          <g transform="translate(0.6 0)">
            <g className="hd-flag">
              <MiniTaegukgi />
            </g>
          </g>
        </g>
      )}
    </g>
  );
}

/** 광복절: 여럿이 태극기를 들고 만세 환호, 바닥에는 굴복한 일제 순사. */
function LiberationDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      <text className="hd-manse" x="24" y="8" fontSize="5.6" fontWeight="800" textAnchor="middle" fill="#cd2e3a">
        만세!
      </text>
      <Cheerer x={8} robe="#f7f4ee" delay={0} flag />
      <Cheerer x={18.5} robe="#4a6fb5" delay={0.25} />
      <Cheerer x={29} robe="#f7f4ee" delay={0.5} flag />
      <Cheerer x={39.5} robe="#c8553d" delay={0.15} />
      {/* 바닥: 무릎 꿇고 고개 숙인 일제 순사 (모자·칼을 떨어뜨림). 민족 비하가 아닌 식민 통치의 종식을 상징. */}
      <g className="hd-bow">
        <path d="M21 39.6 L21 36.4 Q21 35 22.6 35 L27.4 35 Q29 35 29 36.4 L29 39.6 Z" fill="#2c2f36" />
        <path d="M22 35.6 Q24.6 31.4 27.8 33.6 L27.6 36 Z" fill="#2c2f36" />
        <circle cx="21.4" cy="35.2" r="1.7" fill="#e9c9a8" />
        <line x1="23" y1="36.2" x2="20.6" y2="38.6" stroke="#2c2f36" strokeWidth="1.1" strokeLinecap="round" />
        <rect x="24.2" y="35.3" width="0.7" height="2.2" fill="#c9a640" />
      </g>
      <g>
        <path d="M31.5 38.8 h3.8 v-1.1 q-1.9 -1.1 -3.8 0 Z" fill="#2c2f36" />
        <rect x="31.2" y="38.6" width="4.4" height="0.7" rx="0.3" fill="#1d1f24" />
        <circle cx="33.4" cy="37.9" r="0.35" fill="#c9a640" />
        <line x1="13" y1="39.2" x2="19.5" y2="38.2" stroke="#9aa0aa" strokeWidth="0.7" strokeLinecap="round" />
        <rect x="12" y="38.8" width="1.6" height="0.8" fill="#5a4630" />
      </g>
    </svg>
  );
}

/** 노동절: 오늘은 쉬는 날! 안전모 쓴 노동자가 해먹에서 흔들흔들 낮잠, Zz. */
function LaborDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      <circle className="hd-sun" cx="40" cy="7" r="3.6" fill="#ffd166" />
      {["Z", "z", "z"].map((z, i) => (
        <text key={i} className="hd-zz" style={{ animationDelay: `${i * 0.6}s` }} x={26 + i * 3} y={16 - i * 3} fontSize={4.6 - i * 0.8} fontWeight="800" fill="#4a7bd8">
          {z}
        </text>
      ))}
      {/* 기둥 (나무) */}
      <rect x="4" y="16" width="2.4" height="20" rx="1" fill="#8a5a32" />
      <rect x="41.6" y="16" width="2.4" height="20" rx="1" fill="#8a5a32" />
      <circle cx="5.2" cy="14" r="4.4" fill="#5fb56b" />
      <circle cx="42.8" cy="14" r="4.4" fill="#5fb56b" />
      <g className="hd-hammock">
        <path d="M6.4 20 Q24 34 41.6 20" fill="none" stroke="#c98b4a" strokeWidth="0.6" />
        <path d="M8 21.4 Q24 33 40 21.4 Q24 30.4 8 21.4 Z" fill="#ff8a5c" />
        <path d="M10 23 Q24 31.6 38 23" fill="none" stroke="#ffd1a8" strokeWidth="0.7" strokeDasharray="1.4 1.2" />
        {/* 누운 노동자: 안전모, 작업복 */}
        <circle cx="15" cy="23.6" r="2.4" fill="#f3d2b0" />
        <path d="M12.4 23 a2.6 2.6 0 0 1 5.2 0 Z" fill="#ffc928" transform="rotate(-20 15 23)" />
        <rect x="12" y="21.6" width="6.4" height="0.8" rx="0.4" fill="#e0a800" transform="rotate(-20 15 23)" />
        <path d="M17 25 Q24 28.6 32 26.4 L31.6 24.6 Q24 26 17.4 23.8 Z" fill="#3f6fd8" />
        <line x1="31" y1="25.4" x2="35" y2="24" stroke="#2c4f9e" strokeWidth="1.3" strokeLinecap="round" />
      </g>
      {/* 바닥: 내려둔 렌치 */}
      <path d="M0 36 L48 36 L48 40 L0 40 Z" fill="#9bd18f" />
      <g transform="rotate(-15 24 37.6)">
        <rect x="19" y="37" width="9" height="1.3" rx="0.6" fill="#8d96a3" />
        <path d="M28 36.2 a1.8 1.8 0 1 1 0 2.9 l0.9 -1.45 Z" fill="#8d96a3" />
      </g>
    </svg>
  );
}

export const HOLIDAY_DECOR: Partial<Record<HolidayThemeKey, ComponentType>> = {
  newYear: NewYearDecor,
  seollal: SeollalDecor,
  samil: SamilDecor,
  liberation: LiberationDecor,
  children: ChildrenDecor,
  buddha: BuddhaDecor,
  memorial: MemorialDecor,
  chuseok: ChuseokDecor,
  foundation: FoundationDecor,
  hangul: HangulDecor,
  christmas: ChristmasDecor,
  constitution: ConstitutionDecor,
  labor: LaborDecor,
};
