import { describe, expect, it } from "vitest";
import { holidayTheme } from "./holiday-theme";

describe("holidayTheme", () => {
  it("themes fixed-date holidays by date", () => {
    expect(holidayTheme("2026-08-15", "광복절")?.key).toBe("liberation");
    expect(holidayTheme("2026-12-25", "기독탄신일")?.key).toBe("christmas");
  });
  it("themes lunar holidays by name in any locale", () => {
    expect(holidayTheme("2026-09-25", "추석")?.key).toBe("chuseok");
    expect(holidayTheme("2026-02-17", "Korean New Year")?.key).toBe("seollal");
    expect(holidayTheme("2026-05-24", "석가탄신일")?.key).toBe("buddha");
  });
  it("skips substitute days, non-holidays and minor holidays", () => {
    expect(holidayTheme("2026-08-17", "광복절 (대체공휴일)")).toBeNull();
    expect(holidayTheme("2026-08-15", undefined)).toBeNull();
    expect(holidayTheme("2026-07-17", "제헌절")?.key).toBe("constitution");
    expect(holidayTheme("2026-07-18", "어떤 기념일")).toBeNull();
  });
});
