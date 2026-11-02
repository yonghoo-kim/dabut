"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Flag, Flower, Flower2, Gift, Moon, PartyPopper, PenLine, Sparkles, Sunrise, TreePine, type LucideIcon } from "lucide-react";
import { ChristmasDecor } from "./christmas-decor";
import { holidayTheme, type HolidayThemeKey } from "@/lib/calendar/holiday-theme";
import { format, isSameDay, isSameMonth } from "date-fns";
import { getMonthGridDays } from "@/lib/calendar/month-grid";
import { isDayWithinEvent, isMultiDayEvent } from "@/lib/calendar/day-summary";
import { assignLanes, computeMultiDaySegments, groupIntoWeeks, type MultiDaySegment } from "@/lib/calendar/multi-day-bars";
import { Card } from "@/components/ui/card";
import type { Database } from "@/types/database.types";
import { CATEGORY_KEY, CHIP_CLASSNAME, DOT_CLASSNAME } from "./category-style";
import { getDateFnsLocale } from "./date-locale";
import { DayCellButton, DaySummaryProvider } from "./day-summary-sheet";

const HOLIDAY_ICONS: Record<HolidayThemeKey, LucideIcon> = {
  newYear: Sparkles,
  seollal: Gift,
  samil: Flag,
  children: PartyPopper,
  buddha: Flower,
  memorial: Flower2,
  liberation: Flag,
  chuseok: Moon,
  foundation: Sunrise,
  hangul: PenLine,
  christmas: TreePine,
};

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type CategorizedEvent = EventRow & { category: "mine" | "partner" | "shared" };
type EventSegment = MultiDaySegment & { event: CategorizedEvent };

const MAX_CHIPS = 2;

function dateKey(day: Date): string {
  return format(day, "yyyy-MM-dd");
}

function weekdayColor(dayOfWeek: number): string {
  if (dayOfWeek === 0) return "text-expense";
  if (dayOfWeek === 6) return "text-partner";
  return "text-ink-muted";
}

export function MonthView({
  month,
  events,
  currentUserId,
  partnerName,
  timeZone,
  holidays,
  fill = false,
}: {
  month: Date;
  events: CategorizedEvent[];
  currentUserId: string;
  partnerName?: string | null;
  /** The viewing user's configured timezone — decides which calendar day each event's instant falls on. */
  timeZone: string;
  /**
   * "yyyy-MM-dd" -> holiday name entries, computed server-side (see
   * lib/calendar/holidays.ts) and passed as plain tuples rather than a Map
   * so this stays a trivially serializable RSC prop — `date-holidays`'s ~2MB
   * rule data must never end up in the client bundle.
   */
  holidays?: [string, string][];
  /** 부모 높이에 맞춰 한 달이 한 화면에 다 보이도록 행 높이를 균등 분배한다 (3개월 스크롤러용). */
  fill?: boolean;
}) {
  const t = useTranslations("calendar");
  const tSummary = useTranslations("daySummary");
  const tDates = useTranslations("dates");
  const locale = useLocale();
  const dfLocale = getDateFnsLocale(locale);
  const days = getMonthGridDays(month);
  const weeks = groupIntoWeeks(days);
  const today = new Date();
  const weekdays = days.slice(0, 7);

  const holidayMap = useMemo(() => new Map(holidays), [holidays]);

  const summaryEvents = events.map(({ id, owner_id, title, all_day, start_at, end_at, visibility }) => ({
    id,
    owner_id,
    title,
    all_day,
    start_at,
    end_at,
    visibility,
  }));

  // Events spanning different calendar days (in `timeZone`) render as a
  // single continuous bar in a per-week "multi-day lane" instead of a chip
  // repeated in every day cell they touch; same-day events keep the
  // existing chip rendering unchanged.
  const multiDayEvents = events.filter((event) => isMultiDayEvent(event, timeZone));
  const singleDayEvents = events.filter((event) => !isMultiDayEvent(event, timeZone));

  const lanesByWeek = weeks.map((_, weekIndex) => {
    const segments: EventSegment[] = multiDayEvents.flatMap((event) =>
      computeMultiDaySegments(days, event, timeZone)
        .filter((segment) => segment.weekIndex === weekIndex)
        .map((segment) => ({ ...segment, event }))
    );
    return assignLanes(segments);
  });

  return (
    <DaySummaryProvider
      events={summaryEvents}
      currentUserId={currentUserId}
      partnerName={partnerName}
      timeZone={timeZone}
      holidays={holidayMap}
    >
    <div className={fill ? "h-full min-h-0" : undefined}>
    <Card className={`!p-2 sm:!p-3 ${fill ? "flex h-full min-h-0 flex-col" : ""}`}>
      <div className="grid grid-cols-7 pb-1.5 text-center text-[11px] font-semibold">
        {weekdays.map((day) => (
          <div key={day.getDay()} className={weekdayColor(day.getDay())}>
            {format(day, locale === "en" ? "EEE" : "EEEEE", { locale: dfLocale })}
          </div>
        ))}
      </div>
      <div className={`flex flex-col gap-px overflow-hidden rounded-xl bg-line ${fill ? "min-h-0 flex-1" : ""}`}>
        {weeks.map((weekDays, weekIndex) => {
          const laned = lanesByWeek[weekIndex];
          const laneCount = laned.reduce((max, { lane }) => Math.max(max, lane + 1), 0);
          return (
            <div key={weekDays[0].toISOString()} className={`flex flex-col gap-px ${fill ? "min-h-0 flex-1" : ""}`}>
              {laneCount > 0 && (
                <div
                  className="grid grid-cols-7 gap-x-px gap-y-0.5 bg-surface px-0.5 pt-0.5"
                  style={{ gridAutoRows: "1.1rem" }}
                >
                  {laned.map(({ item, lane }) => (
                    <span
                      key={item.event.id}
                      title={item.event.title}
                      style={{
                        gridColumn: `${item.startCol + 1} / ${item.endCol + 2}`,
                        gridRow: lane + 1,
                      }}
                      className={`flex min-w-0 items-center truncate px-1.5 text-[10px] font-medium leading-[1.1rem] ${
                        CHIP_CLASSNAME[item.event.category]
                      } ${item.isEventStart ? "rounded-l-md" : ""} ${item.isEventEnd ? "rounded-r-md" : ""}`}
                    >
                      {item.isEventStart ? item.event.title : ""}
                    </span>
                  ))}
                </div>
              )}
              <div className={`grid grid-cols-7 gap-px bg-line ${fill ? "min-h-0 flex-1" : ""}`}>
                {weekDays.map((day, dayIndex) => {
                  const cornerClass = `${weekIndex === 0 && dayIndex === 0 && laneCount === 0 ? "rounded-tl-xl" : ""} ${weekIndex === 0 && dayIndex === 6 && laneCount === 0 ? "rounded-tr-xl" : ""} ${weekIndex === weeks.length - 1 && dayIndex === 0 ? "rounded-bl-xl" : ""} ${weekIndex === weeks.length - 1 && dayIndex === 6 ? "rounded-br-xl" : ""}`;
                  const touching = events.filter((event) => isDayWithinEvent(day, event, timeZone));
                  const dayEvents = singleDayEvents.filter((event) => isDayWithinEvent(day, event, timeZone));
                  const inMonth = isSameMonth(day, month);
                  const isToday = isSameDay(day, today);
                  const holidayName = holidayMap.get(dateKey(day));
                  const theme = holidayTheme(dateKey(day), holidayName);
                  const ThemeIcon = theme ? HOLIDAY_ICONS[theme.key] : null;
                  const visible = dayEvents.slice(0, MAX_CHIPS);
                  const hidden = dayEvents.length - visible.length;
                  return (
                    <DayCellButton
                      key={day.toISOString()}
                      dateKey={dateKey(day)}
                      label={tSummary("openDay", {
                        date: format(day, "PPP", { locale: dfLocale }),
                        count: touching.length,
                      })}
                      className={`flex min-w-0 flex-col gap-0.5 p-0.5 ${fill ? "min-h-0 overflow-hidden" : "min-h-[6.5rem]"} ${
                        inMonth ? "bg-surface" : "bg-surface-2/60 opacity-45"
                      } ${isToday ? "today-cell-indicator" : ""} ${cornerClass}`}
                      style={theme ? { backgroundImage: theme.background } : undefined}
                    >
                      {theme?.key === "christmas" && <ChristmasDecor />}
                      {ThemeIcon && theme && theme.key !== "christmas" && (
                        <ThemeIcon
                          aria-hidden
                          className="pointer-events-none absolute bottom-1 right-1 size-[42%] max-h-9 max-w-9 opacity-25"
                          style={{ color: theme.accent }}
                          strokeWidth={1.6}
                        />
                      )}
                      <span
                        aria-current={isToday ? "date" : undefined}
                        title={holidayName}
                        className={
                          isToday
                            ? "mx-auto text-xs font-bold text-brand"
                            : `mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${holidayName || day.getDay() === 0 ? "text-expense" : day.getDay() === 6 ? "text-partner" : "text-ink"}`
                        }
                      >
                        {isToday ? tDates("today") : day.getDate()}
                      </span>
                      {theme && holidayName && (
                        <span
                          className="relative -mt-0.5 truncate text-center text-[9px] font-bold leading-tight"
                          style={{ color: theme.accent }}
                        >
                          {t(`holidayShort.${theme.key}`)}
                        </span>
                      )}
                      <ul className="flex min-w-0 flex-col gap-0.5">
                        {visible.map((event) => (
                          <li key={event.id} className="min-w-0" title={t(CATEGORY_KEY[event.category])}>
                            <span
                              className={`flex min-w-0 items-start gap-0.5 rounded-md px-1 py-px text-[10px] font-medium leading-tight ${CHIP_CLASSNAME[event.category]}`}
                            >
                              {event.category === "partner" && (
                                <span aria-hidden className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASSNAME.partner}`} />
                              )}
                              <span className="line-clamp-2 min-w-0 break-words">{event.title}</span>
                            </span>
                          </li>
                        ))}
                        {hidden > 0 && (
                          <li className="px-1 text-[10px] font-semibold text-ink-muted">+{hidden}</li>
                        )}
                      </ul>
                    </DayCellButton>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
    </div>
    </DaySummaryProvider>
  );
}
