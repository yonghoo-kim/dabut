"use client";

import { AlignJustify, CalendarDays, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { useProgressRouter } from "@/components/feedback/use-progress-router";

/**
 * 달력/가계부 탭에서만 보이는 우하단 + 플로팅 버튼 (엄지가 닿는 위치).
 * 일정 탭에서는 그 위에 달력 ↔ 일정목록 전환 버튼을 함께 띄운다.
 */
export function AddFab() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tCal = useTranslations("calendar");
  const tLedger = useTranslations("ledger");
  const router = useProgressRouter();

  const isCalendar = pathname === "/calendar";
  const isLedger = pathname === "/ledger";
  if (!isCalendar && !isLedger) return null;

  const href = isCalendar
    ? { pathname: "/calendar/new" as const, query: searchParams.get("view") === "thread" ? { returnView: "thread" } : undefined }
    : { pathname: "/ledger/new" as const };
  const label = isCalendar ? tCal("addEvent") : tLedger("addTransaction");
  const isThread = searchParams.get("view") === "thread";
  const month = searchParams.get("month");
  // 일정목록으로 갈 때는 항상 오늘 기준으로 초기화, 달력으로 돌아갈 때는 보던 달 유지.
  const switchView = () =>
    router.push({ pathname: "/calendar", query: isThread ? (month ? { view: "month", month } : { view: "month" }) : { view: "thread" } });
  const switchLabel = isThread ? tCal("monthView") : tCal("threadView");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+5.75rem)]">
      <div className="flex flex-col items-end gap-3">
        {isCalendar && (
          <button
            type="button"
            onClick={switchView}
            aria-label={switchLabel}
            title={switchLabel}
            className="pointer-events-auto mr-1 grid size-12 place-items-center rounded-full border border-line bg-surface/85 text-brand backdrop-blur-sm shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition hover:bg-surface active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {isThread ? <CalendarDays aria-hidden className="size-6" /> : <AlignJustify aria-hidden className="size-6" />}
          </button>
        )}
        <Link
          href={href}
          aria-label={label}
          title={label}
          className="pointer-events-auto grid size-14 place-items-center rounded-full bg-brand/75 text-white backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:bg-brand-strong/85 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <Plus aria-hidden className="size-7" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}
