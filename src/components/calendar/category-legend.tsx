"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { CATEGORY_KEY, DOT_CLASSNAME, type EventCategory } from "./category-style";

const ORDER: EventCategory[] = ["mine", "partner", "shared"];

/**
 * 달력 범례. onToggle 을 주면 눌러서 그 종류(내 일정/상대 일정/같이)만 진하게 강조하고,
 * 다시 누르거나 "전체 보기"를 누르면 원래대로.
 */
export function CategoryLegend({
  partnerName,
  active = null,
  onToggle,
}: {
  partnerName?: string | null;
  active?: EventCategory | null;
  onToggle?: (category: EventCategory | null) => void;
}) {
  const t = useTranslations("calendar");

  // Prefer the partner's real nickname over the generic "상대방 일정" label
  // when we have one — same precedent as ThreadList's categoryLabel and the
  // ledger's OwnershipLegend — instead of re-fetching it here.
  function label(category: EventCategory): string {
    if (category === "partner" && partnerName) return t("categoryPartnerNamed", { name: partnerName });
    return t(CATEGORY_KEY[category]);
  }

  if (!onToggle) {
    return (
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        {ORDER.map((category) => (
          <li key={category} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${DOT_CLASSNAME[category]}`} />
            {label(category)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs" title={t("legendFocusHint")}>
      {ORDER.map((category) => {
        const isActive = active === category;
        const dimmed = active !== null && !isActive;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => onToggle(isActive ? null : category)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition active:scale-95 ${
              isActive ? "bg-brand-soft font-bold text-ink ring-1 ring-brand/40" : dimmed ? "text-ink-muted/50" : "text-ink-muted hover:bg-surface-2"
            }`}
          >
            <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${DOT_CLASSNAME[category]} ${dimmed ? "opacity-40" : ""}`} />
            {label(category)}
          </button>
        );
      })}
      {active !== null && (
        <button
          type="button"
          onClick={() => onToggle(null)}
          aria-label={t("legendReset")}
          title={t("legendReset")}
          className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1 text-ink-muted transition hover:bg-surface-2 active:scale-95"
        >
          <RotateCcw aria-hidden className="size-3.5" />
          {t("legendReset")}
        </button>
      )}
    </div>
  );
}
