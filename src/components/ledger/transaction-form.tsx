"use client";

import { CategoryIcon } from "@/components/ledger/category-icon";
import { suggestCategory, suggestMemos, type MemoHistoryItem } from "@/lib/ledger/suggest-category";
import { cancelCelebration, startCelebration } from "@/components/feedback/celebrate-bus";
import { useRouter } from "@/i18n/navigation";
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, Trash2 } from "lucide-react";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type TransactionActionState,
} from "@/lib/actions/transactions";
import type { Database } from "@/types/database.types";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClass, labelClass, errorClass } from "@/components/ui/field";
import { SubmitButton, Spinner } from "@/components/ui/submit-button";
import { doneProgress, startProgress } from "@/components/feedback/progress-store";
import { CategoryPicker, type PickerCategory } from "@/components/ledger/category-picker";
import { PaymentMethodPicker, type PickerPaymentMethod } from "@/components/ledger/payment-method-picker";
import { useTimezone } from "@/components/dates/timezone-provider";
import { toZonedDateInputValue } from "@/lib/dates/timezone";

const DELETE_CONFIRM_MS = 3000;

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

const FIXED_INCOME_CATEGORIES = ["월급", "용돈", "페이백"] as const;

export function TransactionForm({
  mode,
  transaction,
  categories,
  paymentMethods = [],
  currentUserId = null,
  memoHistory = [],
}: {
  mode: "create" | "edit";
  transaction?: TransactionRow;
  categories: CategoryRow[];
  paymentMethods?: PickerPaymentMethod[];
  currentUserId?: string | null;
  /** 최근 거래의 메모/카테고리 (최신순) — 메모 기반 카테고리 자동 지정용. */
  memoHistory?: MemoHistoryItem[];
}) {
  const t = useTranslations("ledger");
  const { timeZone } = useTimezone();
  const action = mode === "create" ? createTransaction : updateTransaction.bind(null, transaction!.id);
  const [state, formAction] = useActionState<TransactionActionState, FormData>(action, {});
  const router = useRouter();
  useEffect(() => {
    if (state.celebrate && state.redirectTo) {
      router.push(state.redirectTo);
    } else if (state.error) {
      cancelCelebration();
    }
  }, [state, router]);
  const [type, setType] = useState<"expense" | "income">(
    (transaction?.type as "expense" | "income") ?? "expense"
  );

  // Categories created inline are kept locally so they show up (selected)
  // immediately, without waiting for a server refresh.
  const [createdCategories, setCreatedCategories] = useState<PickerCategory[]>([]);
  const allCategories = useMemo(() => {
    const seen = new Set(categories.map((category) => category.id));
    return [...categories, ...createdCategories.filter((category) => !seen.has(category.id))];
  }, [categories, createdCategories]);
  const filteredCategories =
    type === "income"
      ? FIXED_INCOME_CATEGORIES.map((name) => allCategories.find((c) => c.type === "income" && c.name === name)).filter(
          (c): c is NonNullable<typeof c> => Boolean(c)
        ).concat(
          // 예전에 만든 수입 카테고리는 수정 화면에서 선택값으로만 유지
          allCategories.filter(
            (c) =>
              c.type === "income" &&
              !FIXED_INCOME_CATEGORIES.includes(c.name as (typeof FIXED_INCOME_CATEGORIES)[number]) &&
              c.id === transaction?.category_id
          )
        )
      : allCategories.filter((category) => category.type === type);

  const [selectedByType, setSelectedByType] = useState<Partial<Record<"expense" | "income", string>>>(() =>
    transaction ? { [transaction.type as "expense" | "income"]: transaction.category_id } : {}
  );
  const selectedCategoryId =
    filteredCategories.find((category) => category.id === selectedByType[type])?.id ?? filteredCategories[0]?.id;

  // 결제수단 (카테고리 규칙으로 자동 선택하기 위해 제어 상태로 둔다).
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(transaction?.payment_method_id ?? null);

  // 카테고리별 결제수단 규칙: 로켓프레시 -> 쿠팡(국민) 카드.
  function applyCategoryRules(categoryId: string) {
    const category = allCategories.find((c) => c.id === categoryId);
    if (!category || !/로켓\s*프레시/.test(category.name)) return;
    const coupang =
      paymentMethods.find((m) => /쿠팡/.test(m.name) && /국민|kb/i.test(m.name)) ??
      paymentMethods.find((m) => /쿠팡/.test(m.name));
    if (coupang) setPaymentMethodId(coupang.id);
  }

  function selectCategory(categoryId: string) {
    setSelectedByType((prev) => ({ ...prev, [type]: categoryId }));
    applyCategoryRules(categoryId);
  }

  // 메모를 입력하면 과거 기록과 비슷한 내용을 찾아 카테고리를 자동 지정 (직접 고른 뒤에는 건드리지 않음).
  const manualPickRef = useRef(mode === "edit");
  const [suggestedName, setSuggestedName] = useState<string | null>(null);
  const [memo, setMemo] = useState(transaction?.memo ?? "");
  const [memoFocused, setMemoFocused] = useState(false);
  const memoSuggestions = useMemo(
    () => (memoFocused ? suggestMemos(memo, memoHistory, type) : []),
    [memo, memoFocused, memoHistory, type]
  );
  function onMemoChange(value: string) {
    setMemo(value);
    if (manualPickRef.current) return;
    const id = suggestCategory(value, memoHistory, type);
    const match = id ? filteredCategories.find((c) => c.id === id) : undefined;
    if (match) {
      selectCategory(match.id);
      setSuggestedName(match.name);
    } else {
      setSuggestedName(null);
    }
  }
  function pickMemoSuggestion(value: string, categoryId: string) {
    setMemo(value);
    setMemoFocused(false);
    const match = filteredCategories.find((c) => c.id === categoryId);
    if (match) {
      manualPickRef.current = true;
      selectCategory(match.id);
      setSuggestedName(match.name);
    }
  }

  const [deletePending, startDelete] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    },
    []
  );

  function onDeleteClick() {
    if (deletePending || !transaction) return;
    if (!confirmingDelete) {
      setDeleteError(null);
      setConfirmingDelete(true);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmingDelete(false), DELETE_CONFIRM_MS);
      return;
    }
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setConfirmingDelete(false);
    startProgress();
    startDelete(async () => {
      try {
        // On success the action redirects to the ledger (with a toast).
        const result = await deleteTransaction(transaction.id);
        if (result?.error) setDeleteError(result.error);
      } finally {
        doneProgress();
      }
    });
  }

  // Zoned-today (not UTC-today, per toZonedDateInputValue's doc comment) so a
  // brand-new entry defaults to the user's actual local date.
  const today = toZonedDateInputValue(new Date().toISOString(), timeZone);
  const isIncome = type === "income";

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        // 새 내역 저장: 로딩 화면 대신 저장한 카테고리 아이콘 효과를 즉시 띄운다.
        if (mode !== "create") return;
        const amount = Number(new FormData(event.currentTarget).get("amount"));
        const category = filteredCategories.find((c) => c.id === selectedCategoryId);
        if (!category || !(amount > 0)) return;
        startCelebration({ name: category.name, icon: category.icon, amount });
      }}
      className="flex flex-col gap-5 pb-24"
    >
      <header className="flex items-center gap-2 pt-2">
        <Link
          href="/ledger"
          aria-label={t("back")}
          className="grid h-9 w-9 place-items-center rounded-full text-ink-muted transition hover:bg-surface-2"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-ink">
          {mode === "create" ? t("newTitle") : t("editTitle")}
        </h1>
      </header>

      <fieldset className="grid grid-cols-2 gap-1 rounded-full bg-surface-2 p-1">
        <legend className="sr-only">{t("type")}</legend>
        {(["expense", "income"] as const).map((value) => {
          const active = type === value;
          return (
            <label
              key={value}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-center text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${
                active
                  ? `bg-surface shadow-sm ${value === "income" ? "text-income" : "text-expense"}`
                  : "text-ink-muted"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={value}
                checked={active}
                onChange={() => setType(value)}
                className="sr-only"
              />
              {value === "income" ? (
                <ArrowUpRight aria-hidden className="size-4" />
              ) : (
                <ArrowDownRight aria-hidden className="size-4" />
              )}
              {t(value)}
            </label>
          );
        })}
      </fieldset>

      <label className={labelClass}>
        {t("occurredAt")}
        <input
          type="date"
          name="occurredAt"
          defaultValue={transaction?.occurred_at ?? today}
          required
          className={inputClass}
        />
      </label>

      <Card className="flex flex-col gap-1 p-5">
        <label htmlFor="tx-amount" className="text-sm font-medium text-ink-muted">
          {t("amount")}
        </label>
        <div className="flex items-baseline gap-2 border-b-2 border-line pb-1 focus-within:border-brand">
          <input
            id="tx-amount"
            type="number"
            name="amount"
            inputMode="numeric"
            placeholder="0"
            defaultValue={transaction?.amount}
            min="0.01"
            step="0.01"
            required
            className={`w-full min-w-0 bg-transparent text-right text-3xl font-extrabold tabular-nums outline-none placeholder:text-ink-muted/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
              isIncome ? "text-income" : "text-expense"
            }`}
          />
          <span className="text-xl font-bold text-ink">원</span>
        </div>
      </Card>

      <div className={`${labelClass} relative`}>
        <label htmlFor="tx-memo">{t("memo")}</label>
        <input
          id="tx-memo"
          type="text"
          name="memo"
          value={memo}
          onChange={(event) => onMemoChange(event.target.value)}
          onFocus={() => setMemoFocused(true)}
          onBlur={() => setMemoFocused(false)}
          autoComplete="off"
          role="combobox"
          aria-expanded={memoSuggestions.length > 0}
          aria-controls="tx-memo-suggestions"
          className={inputClass}
        />
        {memoSuggestions.length > 0 && (
          <ul
            id="tx-memo-suggestions"
            role="listbox"
            className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          >
            {memoSuggestions.map((item) => {
              const category = allCategories.find((c) => c.id === item.categoryId);
              return (
                <li key={item.memo} role="option" aria-selected={false}>
                  <button
                    type="button"
                    // blur 보다 먼저 선택되도록 mousedown 에서 처리
                    onMouseDown={(event) => {
                      event.preventDefault();
                      pickMemoSuggestion(item.memo, item.categoryId);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-surface-2"
                  >
                    {category && <CategoryIcon category={category} className="size-4 shrink-0 text-ink-muted" />}
                    <span className="min-w-0 flex-1 truncate font-medium text-ink">{item.memo}</span>
                    {category && <span className="shrink-0 text-xs text-ink-muted">{category.name}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {suggestedName && (
          <span className="text-xs font-medium text-brand">{t("memoSuggested", { category: suggestedName })}</span>
        )}
      </div>

      <CategoryPicker
        type={type}
        allowCreate={!isIncome}
        categories={filteredCategories}
        selectedId={selectedCategoryId}
        onSelect={(id) => {
          manualPickRef.current = true;
          setSuggestedName(null);
          selectCategory(id);
        }}
        onCreated={(category) => {
          setCreatedCategories((prev) => [...prev, category]);
          setSelectedByType((prev) => ({ ...prev, [category.type]: category.id }));
          if (/로켓\s*프레시/.test(category.name)) {
            const coupang =
              paymentMethods.find((m) => /쿠팡/.test(m.name) && /국민|kb/i.test(m.name)) ??
              paymentMethods.find((m) => /쿠팡/.test(m.name));
            if (coupang) setPaymentMethodId(coupang.id);
          }
        }}
      />

      {!isIncome && (
        <PaymentMethodPicker
          name="paymentMethodId"
          methods={paymentMethods}
          value={paymentMethodId}
          onChange={setPaymentMethodId}
          currentUserId={currentUserId}
        />
      )}

      {state.error && (
        <p role="alert" className={errorClass}>
          {state.error}
        </p>
      )}

      <div className="sticky bottom-24 z-10 flex flex-col gap-2 bg-gradient-to-t from-bg via-bg to-transparent pt-3">
        <SubmitButton className="w-full py-3.5 text-base" disabled={deletePending}>
          {t("save")}
        </SubmitButton>
        {mode === "edit" && (!currentUserId || transaction?.owner_id === currentUserId) && (
          <>
            <Button
              type="button"
              variant="danger"
              className="w-full"
              onClick={onDeleteClick}
              disabled={deletePending}
              aria-busy={deletePending}
            >
              {deletePending ? <Spinner /> : <Trash2 aria-hidden className="size-4" />}
              {confirmingDelete ? t("deleteConfirm") : t("delete")}
            </Button>
            {deleteError && (
              <p role="alert" className={errorClass}>
                {deleteError}
              </p>
            )}
          </>
        )}
      </div>
    </form>
  );
}
