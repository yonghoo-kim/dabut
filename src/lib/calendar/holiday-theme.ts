export type HolidayThemeKey =
  | "newYear"
  | "seollal"
  | "samil"
  | "children"
  | "buddha"
  | "memorial"
  | "liberation"
  | "chuseok"
  | "foundation"
  | "hangul"
  | "christmas"
  | "constitution";

export type HolidayTheme = {
  key: HolidayThemeKey;
  /** 셀 배경 (반투명이라 라이트/다크 모두 자연스럽게 얹힌다). */
  background: string;
  /** 아이콘·이름 색. */
  accent: string;
};

const THEMES: Record<HolidayThemeKey, Omit<HolidayTheme, "key">> = {
  newYear: { background: "linear-gradient(160deg, rgba(255,214,102,0.38), rgba(255,160,190,0.22))", accent: "#d99a00" },
  seollal: { background: "linear-gradient(160deg, rgba(255,120,120,0.30), rgba(255,206,120,0.28))", accent: "#e0484f" },
  samil: { background: "linear-gradient(160deg, rgba(90,140,255,0.22), rgba(255,110,110,0.20))", accent: "#3f6fd8" },
  children: { background: "linear-gradient(160deg, rgba(255,214,102,0.34), rgba(120,200,255,0.28))", accent: "#f08a24" },
  buddha: { background: "linear-gradient(160deg, rgba(255,150,200,0.30), rgba(255,220,130,0.28))", accent: "#d9558f" },
  memorial: { background: "linear-gradient(160deg, rgba(150,160,180,0.24), rgba(200,205,215,0.18))", accent: "#6b7488" },
  liberation: { background: "linear-gradient(160deg, rgba(90,140,255,0.24), rgba(255,110,110,0.22))", accent: "#d8434a" },
  chuseok: { background: "linear-gradient(160deg, rgba(255,214,102,0.36), rgba(255,160,90,0.28))", accent: "#e08a00" },
  foundation: { background: "linear-gradient(160deg, rgba(120,190,255,0.28), rgba(255,214,140,0.30))", accent: "#2f8fd8" },
  hangul: { background: "linear-gradient(160deg, rgba(120,200,150,0.28), rgba(255,236,170,0.28))", accent: "#2f9a5c" },
  constitution: { background: "linear-gradient(160deg, rgba(190,140,90,0.28), rgba(90,120,190,0.20))", accent: "#8a5a32" },
  christmas: { background: "linear-gradient(160deg, rgba(90,190,120,0.28), rgba(255,110,110,0.26))", accent: "#2e9a55" },
};

const FIXED_DATES: Record<string, HolidayThemeKey> = {
  "01-01": "newYear",
  "03-01": "samil",
  "05-05": "children",
  "06-06": "memorial",
  "07-17": "constitution",
  "08-15": "liberation",
  "10-03": "foundation",
  "10-09": "hangul",
  "12-25": "christmas",
};

const SUBSTITUTE = /대체|substitute|更换|振替/i;

/**
 * 주요 국경일/명절이면 달력 셀을 꾸밀 테마를 돌려준다. 공휴일 이름이 있을 때만 적용하고,
 * 대체공휴일은 꾸미지 않는다. 양력 고정일은 날짜로, 음력 명절은 (언어별) 이름으로 판별.
 */
export function holidayTheme(dateKey: string, holidayName: string | undefined): HolidayTheme | null {
  if (!holidayName || SUBSTITUTE.test(holidayName)) return null;
  let key: HolidayThemeKey | undefined = FIXED_DATES[dateKey.slice(5)];
  if (!key) {
    if (/설날|Korean New Year|Lunar New Year|春节|春節/i.test(holidayName)) key = "seollal";
    else if (/추석|Thanksgiving|Chuseok|中秋/i.test(holidayName)) key = "chuseok";
    else if (/석가|부처|Buddha|佛/i.test(holidayName)) key = "buddha";
  }
  return key ? { key, ...THEMES[key] } : null;
}
