import type { ComponentType } from "react";
import type { HolidayThemeKey } from "@/lib/calendar/holiday-theme";
import { ChristmasDecor } from "./christmas-decor";

/**
 * 국경일/명절 칸의 작은 애니메이션 장면들. 모두 인라인 SVG + CSS 애니메이션(globals.css 의 .hd-*)이라
 * 가볍고, "동작 줄이기" 설정이면 정지 화면으로 보인다. 칸 아래쪽에 깔리고 클릭은 통과한다.
 */
const sceneClass =
  "pointer-events-none absolute bottom-0.5 left-1/2 w-[94%] max-w-[4.5rem] -translate-x-1/2 overflow-visible";

/** 신정: 고명 올린 떡국에서 김이 모락모락. */
function NewYearDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      {[14, 22, 30].map((x, i) => (
        <path
          key={x}
          className="hd-steam"
          style={{ animationDelay: `${i * 0.7}s` }}
          d={`M${x} 18 q-3 -4 0 -8 q3 -4 0 -8`}
          fill="none"
          stroke="#c9b8a8"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
      <ellipse cx="24" cy="22" rx="18" ry="5" fill="#f4efe6" />
      <ellipse cx="24" cy="22" rx="15.5" ry="3.6" fill="#efe2c8" />
      {/* 떡 */}
      {[
        [16, 21.5, -15],
        [22, 22.6, 10],
        [28, 21.4, -8],
        [33, 22.4, 20],
        [19, 23.4, 25],
      ].map(([cx, cy, r], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="3" ry="1.3" fill="#ffffff" stroke="#e6dccb" strokeWidth="0.4" transform={`rotate(${r} ${cx} ${cy})`} />
      ))}
      {/* 고명: 황백지단, 김, 파 */}
      <rect x="20" y="20" width="5" height="0.9" rx="0.4" fill="#ffcf3f" transform="rotate(-20 22 20)" />
      <rect x="25" y="21" width="5" height="0.9" rx="0.4" fill="#fff6dc" transform="rotate(15 27 21)" />
      <rect x="22" y="19.6" width="6" height="0.8" rx="0.4" fill="#2d2d2d" transform="rotate(5 25 20)" />
      <circle cx="18.5" cy="20.6" r="0.9" fill="#6abf4b" />
      <circle cx="30" cy="20.3" r="0.9" fill="#6abf4b" />
      {/* 그릇 */}
      <path d="M6 22 Q8 36 24 36 Q40 36 42 22 Z" fill="#ffffff" stroke="#d9cfc2" strokeWidth="0.6" />
      <path d="M8.5 27 Q24 31 39.5 27" fill="none" stroke="#3f6fd8" strokeWidth="1" />
      <ellipse cx="24" cy="37" rx="8" ry="1.4" fill="#e9e1d6" />
    </svg>
  );
}

/** 삼일절: 바람에 휘날리는 태극기. */
function SamilDecor() {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={sceneClass}>
      <rect x="9" y="4" width="1.4" height="35" rx="0.6" fill="#8a6a4c" />
      <circle cx="9.7" cy="4" r="1.4" fill="#e0b84a" />
      <g className="hd-flag">
        <rect x="10.4" y="5" width="30" height="20" fill="#ffffff" stroke="#d6d6d6" strokeWidth="0.4" />
        {/* 태극 */}
        <path d="M20.4 15 a5 5 0 0 1 10 0 a2.5 2.5 0 0 1 -5 0 a2.5 2.5 0 0 0 -5 0 Z" fill="#cd2e3a" transform="rotate(-33 25.4 15)" />
        <path d="M20.4 15 a5 5 0 0 0 10 0 a2.5 2.5 0 0 1 -5 0 a2.5 2.5 0 0 0 -5 0 Z" fill="#0047a0" transform="rotate(-33 25.4 15)" />
        {/* 4괘 (간략) */}
        <g fill="#1a1a1a">
          <g transform="rotate(-33 15 9)">
            <rect x="13" y="8" width="4" height="0.7" />
            <rect x="13" y="9" width="4" height="0.7" />
            <rect x="13" y="10" width="4" height="0.7" />
          </g>
          <g transform="rotate(-33 35.8 21)">
            <rect x="33.8" y="20" width="1.7" height="0.7" />
            <rect x="35.9" y="20" width="1.7" height="0.7" />
            <rect x="33.8" y="21" width="1.7" height="0.7" />
            <rect x="35.9" y="21" width="1.7" height="0.7" />
            <rect x="33.8" y="22" width="1.7" height="0.7" />
            <rect x="35.9" y="22" width="1.7" height="0.7" />
          </g>
          <g transform="rotate(33 35.8 9)">
            <rect x="33.8" y="8" width="4" height="0.7" />
            <rect x="33.8" y="9" width="1.7" height="0.7" />
            <rect x="35.9" y="9" width="1.7" height="0.7" />
            <rect x="33.8" y="10" width="4" height="0.7" />
          </g>
          <g transform="rotate(33 15 21)">
            <rect x="13" y="20" width="1.7" height="0.7" />
            <rect x="15.1" y="20" width="1.7" height="0.7" />
            <rect x="13" y="21" width="4" height="0.7" />
            <rect x="13" y="22" width="1.7" height="0.7" />
            <rect x="15.1" y="22" width="1.7" height="0.7" />
          </g>
        </g>
      </g>
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

export const HOLIDAY_DECOR: Partial<Record<HolidayThemeKey, ComponentType>> = {
  newYear: NewYearDecor,
  samil: SamilDecor,
  children: ChildrenDecor,
  buddha: BuddhaDecor,
  memorial: MemorialDecor,
  chuseok: ChuseokDecor,
  foundation: FoundationDecor,
  hangul: HangulDecor,
  christmas: ChristmasDecor,
  constitution: ConstitutionDecor,
};
