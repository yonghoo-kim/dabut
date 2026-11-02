"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useProgressRouter } from "@/components/feedback/use-progress-router";
import { MonthView } from "./month-view";
import { MonthYearPicker } from "./month-year-picker";
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
 * 여러 달(예: 이전 3 + 이후 9)을 처음에 한꺼번에 그려 두고 좌우 스와이프로 한 달씩 넘겨 본다.
 * 네이티브 스크롤 대신 transform 기반 페이저라 한 번 스와이프 = 정확히 한 달이고(iOS 관성 튐 없음),
 * 스와이프/오늘 버튼/휠 모두 서버 왕복 없이 즉시 반응한다. 각 달은 화면 높이에 딱 맞게 채운다.
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const [itemW, setItemW] = useState(0);
  const [active, setActiveState] = useState(initialIndex);
  const activeRef = useRef(initialIndex);
  // 드래그 중 손가락 이동량(px). null 이면 드래그 중이 아님 → transition 으로 스냅.
  const [dragDx, setDragDx] = useState<number | null>(null);
  // 멀리 점프할 때는 애니메이션 없이 바로 이동.
  const [instant, setInstant] = useState(true);
  const suppressClickRef = useRef(false);

  const setActive = useCallback(
    (index: number, animate = true) => {
      const clamped = Math.max(0, Math.min(months.length - 1, index));
      setInstant(!animate);
      activeRef.current = clamped;
      setActiveState(clamped);
    },
    [months.length]
  );

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

  // 뷰포트 너비 측정 (회전/창 크기 변경 대응).
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setItemW((prev) => (prev === w ? prev : w));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 직접 구현한 스와이프 페이저: 네이티브 스크롤 스냅은 iOS Safari 에서 관성으로 두세 달 넘어갔다가
  // 되돌아오는 문제가 있어, 한 번 스와이프 = 정확히 한 달로 제어한다.
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // 달력 좌우 스와이프가 탭 전환 스와이프로 넘어가지 않게.
    event.stopPropagation();
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const width = itemW || viewportRef.current?.clientWidth || 1;
    const startX = event.clientX;
    const startY = event.clientY;
    let axis: "x" | "y" | null = null;
    let dx = 0;
    const samples: { t: number; x: number }[] = [{ t: performance.now(), x: startX }];

    const move = (e: PointerEvent) => {
      const mx = e.clientX - startX;
      const my = e.clientY - startY;
      if (!axis) {
        if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
        axis = Math.abs(mx) > Math.abs(my) ? "x" : "y";
        if (axis === "y") return cleanup();
        suppressClickRef.current = true;
      }
      if (e.cancelable) e.preventDefault();
      const atEdge = (activeRef.current === 0 && mx > 0) || (activeRef.current === months.length - 1 && mx < 0);
      dx = atEdge ? mx * 0.3 : mx;
      samples.push({ t: performance.now(), x: e.clientX });
      if (samples.length > 6) samples.shift();
      setDragDx(dx);
    };
    const up = () => {
      cleanup();
      if (axis !== "x") return;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const velocity = (last.x - first.x) / Math.max(1, last.t - first.t); // px/ms
      let delta = 0;
      if (dx < -width * 0.18 || velocity < -0.35) delta = 1;
      else if (dx > width * 0.18 || velocity > 0.35) delta = -1;
      setDragDx(null);
      setActive(activeRef.current + delta, true);
      // 드래그 직후 발생하는 click 은 날짜 시트를 열지 않도록 한 틱 동안만 막는다.
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    };
    const cancel = () => {
      cleanup();
      setDragDx(null);
      suppressClickRef.current = false;
    };
    function cleanup() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    }
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }

  // PC 마우스 휠/트랙패드: 한 번에 한 달씩.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let lockedUntil = 0;
    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 4) return;
      event.preventDefault();
      const now = Date.now();
      if (now < lockedUntil) return;
      lockedUntil = now + 450;
      setActive(activeRef.current + (delta > 0 ? 1 : -1), true);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setActive]);

  function goToday() {
    const index = months.findIndex((m) => m.key === currentMonthKey);
    if (index >= 0) setActive(index, Math.abs(index - activeRef.current) <= 1);
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
          {/* 이번 달에서도 자리를 차지하게 두고 숨기기만 해서, 넘길 때 헤더 높이가 바뀌어 달력이 밀리지 않게 한다. */}
          <button
            type="button"
            onClick={goToday}
            tabIndex={activeMonth.key === currentMonthKey ? -1 : 0}
            aria-hidden={activeMonth.key === currentMonthKey}
            className={`shrink-0 rounded-full border border-line bg-surface-2 px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand-soft active:scale-95 ${
              activeMonth.key === currentMonthKey ? "invisible" : ""
            }`}
          >
            {tDates("today")}
          </button>
        </div>
      </header>

      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 touch-pan-y select-none overflow-hidden"
        onPointerDownCapture={onPointerDown}
        onClickCapture={(event) => {
          if (suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        <div
          className="flex h-full will-change-transform"
          style={{
            transform: `translate3d(${-active * itemW + (dragDx ?? 0)}px, 0, 0)`,
            transition: dragDx !== null || instant ? "none" : "transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1)",
          }}
        >
        {months.map((m, i) => (
          <section
            key={m.key}
            data-month={m.key}
            aria-label={m.title}
            aria-hidden={i !== active}
            className="flex h-full shrink-0 flex-col"
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
      </div>
      {legend}
    </div>
  );
}
