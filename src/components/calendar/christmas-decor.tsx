/**
 * 성탄절 칸 꾸밈: 눈이 내리고, 아래 트리 전구가 반짝인다. GIF 대신 CSS 애니메이션이라
 * 가볍고 선명하며, "동작 줄이기" 설정이면 멈춘다 (globals.css 의 .xmas-* 참고).
 */
const FLAKES = [
  { left: 8, size: 4, duration: 5.2, delay: -0.4 },
  { left: 22, size: 3, duration: 6.4, delay: -3.1 },
  { left: 36, size: 5, duration: 4.8, delay: -1.7 },
  { left: 50, size: 3, duration: 5.9, delay: -4.6 },
  { left: 63, size: 3, duration: 6.8, delay: -2.2 },
  { left: 76, size: 3, duration: 5.4, delay: -5.3 },
  { left: 88, size: 3, duration: 6.1, delay: -0.9 },
  { left: 44, size: 3, duration: 7.2, delay: -6.0 },
];

const LIGHTS = [
  { cx: 17, cy: 22, color: "#ffd166", delay: 0 },
  { cx: 24, cy: 26, color: "#ff6b6b", delay: 0.4 },
  { cx: 13, cy: 31, color: "#7cc6ff", delay: 0.8 },
  { cx: 22, cy: 35, color: "#ffd166", delay: 1.2 },
  { cx: 28, cy: 37, color: "#ff8fab", delay: 0.6 },
  { cx: 11, cy: 39, color: "#ff6b6b", delay: 1.0 },
  { cx: 19, cy: 15, color: "#7cc6ff", delay: 1.4 },
];

export function ChristmasDecor() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLAKES.map((f, i) => (
        <i
          key={i}
          className="xmas-snow"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            animationDuration: `${f.duration}s, ${f.duration / 2}s`,
            animationDelay: `${f.delay}s, ${f.delay}s`,
          }}
        />
      ))}
      <svg viewBox="0 0 40 48" className="absolute bottom-0.5 right-0.5 h-[46%] max-h-12 w-auto">
        <polygon points="20,4 34,24 6,24" fill="#2e9a55" />
        <polygon points="20,12 37,34 3,34" fill="#2a8a4c" />
        <polygon points="20,20 39,44 1,44" fill="#24793f" />
        <rect x="17" y="43" width="6" height="5" rx="1" fill="#8a5a3c" />
        <polygon className="xmas-star" points="20,0 21.6,3.6 25.5,3.8 22.4,6.2 23.5,10 20,7.9 16.5,10 17.6,6.2 14.5,3.8 18.4,3.6" fill="#ffd166" />
        {LIGHTS.map((l, i) => (
          <circle key={i} className="xmas-light" cx={l.cx} cy={l.cy} r="1.8" fill={l.color} style={{ animationDelay: `${l.delay}s` }} />
        ))}
      </svg>
    </span>
  );
}
