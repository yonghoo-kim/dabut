import { getLocale, getTranslations } from "next-intl/server";
import { addMonths, format, endOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { categorizeEvent } from "@/lib/calendar/categorize-event";
import { expandEventsForDisplay } from "@/lib/calendar/expand-events-for-display";
import { redirect } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ViewToggle } from "@/components/calendar/view-toggle";
import { MonthSlide } from "@/components/calendar/month-slide";
import { CalendarMonths } from "@/components/calendar/calendar-months";
import { MonthNavArrows } from "@/components/calendar/month-nav-arrows";
import { ThreadView } from "@/components/calendar/thread-view";
import { TodayButton } from "@/components/calendar/today-button";
import { CategoryLegend } from "@/components/calendar/category-legend";
import { getDateFnsLocale, monthTitlePattern, parseMonthParam } from "@/components/calendar/date-locale";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { resolvePartnerName } from "@/lib/calendar/partner-name";
import { getHolidaysForYear } from "@/lib/calendar/holidays";
import { getMonthGridDays } from "@/lib/calendar/month-grid";
import { toDateKey } from "@/lib/dates/relative-day";
import { DEFAULT_TIMEZONE, zonedDateTimeToUtcIso } from "@/lib/dates/timezone";
import { TelegramOnboardingBanner } from "@/components/settings/telegram-onboarding-banner";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; month?: string }>;
}) {
  const { view, month: monthParam } = await searchParams;
  const t = await getTranslations("calendar");
  const locale = await getLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // AppLayout already redirects unauthenticated visits to /login, but its
  // getUser() call and this one are independent requests to Supabase Auth;
  // fail safe here too instead of crashing on user!.id if one transiently
  // returns no session.
  if (!user) return redirect({ href: "/login", locale });
  // These three only depend on `user.id`/the already-authenticated
  // `supabase` client, not on each other — running them as a single
  // Promise.all instead of three sequential awaits turns three round trips
  // (plus resolvePartnerName's own two internal round trips) into one
  // batch, which is most of where the previous multi-second month-change
  // delay actually came from (the RSC-navigation blank flash on top of that
  // is a separate issue, fixed by startTransition — see MonthSlide).
  const [{ data: events }, partnerName, { data: profile }] = await Promise.all([
    supabase.from("events").select("*"),
    resolvePartnerName(supabase, user.id),
    supabase.from("profiles").select("telegram_chat_id, timezone").eq("id", user.id).maybeSingle(),
  ]);
  const timeZone = profile?.timezone ?? DEFAULT_TIMEZONE;

  // Recurring parents are expanded into their visible-range computed
  // occurrences and merged with the plain/standalone rows (which already
  // include any detached exceptions) before anything downstream sees them —
  // every display component below keeps working with a plain EventRow[],
  // unaware a given row might be a computed occurrence. See
  // src/lib/calendar/expand-events-for-display.ts.
  const displayEvents = await expandEventsForDisplay(supabase, events ?? [], timeZone);

  const categorized = displayEvents.map((event) => ({
    ...event,
    // visibility is a text check constraint in the DB, not a real Postgres
    // enum, so the generated type is `string`; the constraint guarantees
    // only these two values.
    category: categorizeEvent(
      { owner_id: event.owner_id, visibility: event.visibility as "personal" | "shared" },
      user.id
    ),
  }));

  const month = parseMonthParam(monthParam);
  const isThread = view === "thread";
  const monthTitle = format(month, monthTitlePattern(locale), { locale: getDateFnsLocale(locale) });

  // Thread/list view ("일정목록") is scoped to the same selected month as the
  // grid, the same way the ledger list is scoped to its month — events are
  // kept whenever they overlap the month at all, so a multi-day event
  // starting just before month-end (or ending just after month-start) still
  // shows up once, in both months it touches.
  // 일정목록은 선택한 달의 앞뒤 한 달씩, 총 3개월을 보여준다 (처음 화면은 오늘 기준).
  const threadWindowStart = addMonths(month, -1);
  const threadWindowEnd = addMonths(month, 1);
  const threadMonthKeys = [-1, 0, 1].map((offset) => format(addMonths(month, offset), "yyyy-MM"));
  const monthStartIso = zonedDateTimeToUtcIso(format(threadWindowStart, "yyyy-MM-dd"), "00:00:00", timeZone);
  const monthEndIso = zonedDateTimeToUtcIso(format(endOfMonth(threadWindowEnd), "yyyy-MM-dd"), "23:59:59", timeZone);
  const monthStartMs = new Date(monthStartIso).getTime();
  const monthEndMs = new Date(monthEndIso).getTime();
  const threadEvents = isThread
    ? categorized.filter((event) => {
        const startMs = new Date(event.start_at).getTime();
        const endMs = event.end_at ? new Date(event.end_at).getTime() : startMs;
        return startMs <= monthEndMs && endMs >= monthStartMs;
      })
    : [];

  // Computed server-side only — `date-holidays`'s rule data (~2MB) must
  // never reach the client bundle; MonthView gets plain [key, name] tuples.
  // The 6-week grid can spill into an adjacent year at a Dec/Jan boundary,
  // so every year actually present in the grid is covered, not just
  // `month`'s own year.
  // 미리 그려 둘 달 범위: 선택한 달 기준 이전 3개월 ~ 이후 9개월 (화살표/스크롤은 서버 왕복 없이 이 안에서 이동).
  const MONTHS_BEFORE = 3;
  const MONTHS_AFTER = 9;
  const windowMonths = Array.from({ length: MONTHS_BEFORE + MONTHS_AFTER + 1 }, (_, i) => addMonths(month, i - MONTHS_BEFORE));
  const gridYears = isThread
    ? []
    : Array.from(new Set(windowMonths.flatMap((m) => getMonthGridDays(m).map((d) => d.getFullYear()))));
  const holidayEntries: [string, string][] = Array.from(
    gridYears.reduce((map, year) => {
      for (const [key, name] of getHolidaysForYear(year, timeZone, locale)) map.set(key, name);
      return map;
    }, new Map<string, string>())
  );

  const realtime = (
    <>
      <RealtimeRefresh table="events" />
      {/* A single-occurrence cancel/detach (이 일정만) only writes
          event_exceptions, not events — the other side needs this too to
          live-refresh when a recurring occurrence changes. */}
      <RealtimeRefresh table="event_exceptions" />
    </>
  );

  if (!isThread) {
    // 한 달이 화면에 딱 맞게 보이도록 페이지 높이를 뷰포트에 고정하고, 달력은 그 안에서 스크롤 스냅.
    const dfLocale = getDateFnsLocale(locale);
    return (
      <main className="calendar-fit flex flex-col gap-3">
        {profile && !profile.telegram_chat_id && <TelegramOnboardingBanner />}
        {realtime}
        <CalendarMonths
          // 기준 월이 바뀌면(월 선택, 범위 밖 오늘 이동) 스크롤 위치/현재 월 상태를 새로 시작한다.
          key={format(month, "yyyy-MM")}
          months={windowMonths.map((m) => ({
            key: format(m, "yyyy-MM"),
            title: format(m, monthTitlePattern(locale), { locale: dfLocale }),
          }))}
          initialIndex={MONTHS_BEFORE}
          events={categorized}
          currentUserId={user.id}
          partnerName={partnerName}
          timeZone={timeZone}
          holidays={holidayEntries}
          currentMonthKey={format(new Date(), "yyyy-MM")}
          legend={<CategoryLegend partnerName={partnerName} />}
        />
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-3 pb-6">
      {profile && !profile.telegram_chat_id && <TelegramOnboardingBanner />}
      {realtime}
      <PageHeader
        title={
          <MonthNavArrows
            month={month}
            monthTitle={monthTitle}
            prevLabel={t("prevMonth")}
            nextLabel={t("nextMonth")}
            extraQuery={{ view: "thread" }}
          />
        }
        action={
          <div className="flex shrink-0 items-center gap-2">
            <TodayButton month={month} extraQuery={{ view: "thread" }} />
            <ViewToggle />
          </div>
        }
      />
      <MonthSlide monthKey={`thread-${format(month, "yyyy-MM")}`}>
        <ThreadView
          events={threadEvents}
          currentUserId={user.id}
          serverTodayKey={toDateKey(new Date())}
          timeZone={timeZone}
          partnerName={partnerName}
          isCurrentMonth={threadMonthKeys.includes(format(new Date(), "yyyy-MM"))}
          monthKey={format(month, "yyyy-MM")}
          monthKeys={threadMonthKeys}
        />
      </MonthSlide>
    </main>
  );
}
