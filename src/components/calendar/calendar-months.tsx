"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useProgressRouter } from "@/components/feedback/use-progress-router";
import { MonthView } from "./month-view";
import { MonthYearPicker } from "./month-year-picker";
import { ViewToggle } from "./view-toggle";
import { monthHref } from "./date-locale";
import type { Database } from "@/types/database.types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type CategorizedEvent = EventRow & { category: "mine" | "partner" | "shared" };

export type CalendarMonth = { key: string; title: string };

const DAY_MS = 24 * 60 * 60 * 1000;

function parseKey(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

/**
 * 여러 달(예: 이전 3 + 이후 9)을 처음에 한꺼번에 그려 두고 좌우 스크롤 스냅으로 넘겨 본다.
 * 좌우 스와이프와 오늘 버튼은 서버 왕복 없이 스크롤만 하므로 즉시 반응한다. 각 달 높이는 스크롤러 높이와
 * 같게 맞추고(높이는 화면에 딱 맞게), 현재 보이는 달은 scroll 이벤트로 계산해 헤더 제목에 반영한다
 * (IntersectionObserver 대신 scrollLeft/너비 계산 → iOS Safari 에서도 안정적).
 */
export function CalendarMonths({
  months,
  initialIndex,
  events,
  currentUserId,
  partnerName,
  timeZone,
  holidays,
  currentMonthKey,
  legend,
}: {
  months: CalendarMonth[];
  initialIndex: number;
  events: CategorizedEvent[];
  currentUserId: string;
  partnerName?: string | null;
  timeZone: string;
  holidays: [string, string][];
  /** 서버 기준 "이번 달" yyyy-MM (오늘 버튼 표시/이동용). */
  currentMonthKey: string;
  legend: ReactNode;
}) {
  const tDates = useTranslations("dates");
  const locale = useLocale();
  const router = useProgressRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [itemW, setItemW] = useState(0);
  const [active, setActive] = useState(initialIndex);
  const activeRef = useRef(initialIndex);
  const itemWRef = useRef(0);

  // 각 달에는 그 달 격자와 겹치는 일정만 넘겨 렌더 비용을 줄인다.
  const eventsByMonth = useMemo(() => {
    const spans = events.map((event) => {
      const start = new Date(event.start_at).getTime();
      const end = event.end_at ? new Date(event.end_at).getTime() : start;
      return { event, start, end: Math.max(start, end) };
    });
    return months.map(({ key }) => {
      const first = parseKey(key);
      const gridStart = first.getTime() - 8 * DAY_MS;
      const gridEnd = new Date(first.getFullYear(), first.getMonth() + 1, 1).getTime() + 8 * DAY_MS;
      return spans.filter((span) => span.start <= gridEnd && span.end >= gridStart).map((span) => span.event);
    });
  }, [events, months]);

  const scrollToIndex = useCallback((index: number, smooth: boolean) => {
    const el = scrollerRef.current;
    if (!el || !itemWRef.current) return;
    el.scrollTo({ left: index * itemWRef.current, behavior: smooth ? "smooth" : "auto" });
  }, []);

  // 스크롤러 너비 측정 + 초기 위치 (선택한 달이 보이게).
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0 && w !== itemWRef.current) {
        itemWRef.current = w;
        setItemW(w);
        // 너비가 바뀌면(회전, 창 크기) 보고 있던 달을 다시 맞춘다.
        requestAnimationFrame(() => {
          el.style.scrollBehavior = "auto";
          el.scrollLeft = activeRef.current * w;
          el.style.scrollBehavior = "";
        });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 스크롤 위치 -> 현재 월 (rAF 로 묶음).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = itemWRef.current;
        if (!w) return;
        const index = Math.max(0, Math.min(months.length - 1, Math.round(el.scrollLeft / w)));
        if (index !== activeRef.current) {
          activeRef.current = index;
          setActive(index);
        }
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [months.length]);

  // PC 마우스 휠(세로)은 한 번에 한 달씩 좌우로 넘긴다. 트랙패드 가로 스와이프는 그대로 둔다.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let lockedUntil = 0;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      const now = Date.now();
      if (now < lockedUntil) return;
      lockedUntil = now + 450;
      const target = Math.max(0, Math.min(months.length - 1, activeRef.current + (event.deltaY > 0 ? 1 : -1)));
      scrollToIndex(target, true);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [months.length, scrollToIndex]);

  function goToday() {
    const index = months.findIndex((m) => m.key === currentMonthKey);
    if (index >= 0) scrollToIndex(index, true);
    else router.push(monthHref(new Date()));
  }

  const activeMonth = months[active] ?? months[initialIndex];
  const activeDate = parseKey(activeMonth.key);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <header className="flex items-center justify-between gap-3 pt-2">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          <MonthYearPicker month={activeDate} monthTitle={activeMonth.title} locale={locale} />
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          {activeMonth.key !== currentMonthKey && (
            <button
              type="button"
              onClick={goToday}
              className="shrink-0 rounded-full border border-line bg-surface-2 px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand-soft active:scale-95"
            >
              {tDates("today")}
            </button>
          )}
          <ViewToggle />
        </div>
      </header>

      <div
        ref={scrollerRef}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        // 달력 좌우 스와이프가 탭 전환 스와이프로 넘어가지 않게.
        onPointerDownCapture={(event) => event.stopPropagation()}
        style={{ scrollBehavior: "smooth" }}
      >
        {months.map((m, i) => (
          <section
            key={m.key}
            data-month={m.key}
            aria-label={m.title}
            className="flex h-full shrink-0 snap-start snap-always flex-col"
            style={{ width: itemW || "100%" }}
          >
            <div className="min-h-0 flex-1 pb-1">
              <MonthView
                fill
                month={parseKey(m.key)}
                events={eventsByMonth[i]}
                currentUserId={currentUserId}
                partnerName={partnerName}
                timeZone={timeZone}
                holidays={holidays}
              />
            </div>
          </section>
        ))}
      </div>
      {legend}
    </div>
  );
}
