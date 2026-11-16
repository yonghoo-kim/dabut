"use client";

import { useEffect, useId, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { createCategory, deleteCategory } from "@/lib/actions/categories";
import { Spinner } from "@/components/ui/submit-button";
import { buttonClass } from "@/components/ui/button";
import { inputClass, errorClass } from "@/components/ui/field";
import { doneProgress, startProgress } from "@/components/feedback/progress-store";
import { Plus } from "lucide-react";
import { CATEGORY_ICON_CHOICES, CategoryIcon } from "@/components/ledger/category-icon";

export type PickerCategory = { id: string; name: string; type: string; icon: string | null };

const chipClass =
  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition active:scale-[0.97]";

/**
 * Category chips (radio group named `categoryId`) plus a "+ add" button that
 * opens a modal dialog (native <dialog>, same convention as
 * DeleteAccount — backdrop/Escape/outside-click close) with the name input
 * and a much larger icon grid than the old inline panel.
 *
 * The modal's own "추가" button calls the Server Action directly (type
 * "button") rather than nesting a <form> — this component deliberately
 * lives inside the transaction <form>, and a <dialog> renders in the top
 * layer, outside the normal DOM flow, which would make a nested <form>
 * especially confusing. Because of that, this component listens for the
 * ancestor form's own submit (via a ref + `.closest("form")`) to catch the
 * case where the user typed a new category name but submitted the outer
 * form without pressing "추가" first — otherwise that name would be
 * silently discarded.
 */
export function CategoryPicker({
  type,
  allowCreate = true,
  hint,
  categories,
  selectedId,
  onSelect,
  onCreated,
  onDeleted,
}: {
  type: "expense" | "income";
  allowCreate?: boolean;
  /** 카테고리 제목 옆에 작게 보여줄 안내 (예: 비슷한 기록으로 자동 지정). */
  hint?: string | null;
  categories: PickerCategory[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onCreated: (category: PickerCategory) => void;
  /** 길게 눌러 삭제에 성공한 카테고리 id. */
  onDeleted?: (id: string) => void;
}) {
  const t = useTranslations("ledger");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>(CATEGORY_ICON_CHOICES[0]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const titleId = useId();
  const deleteTitleId = useId();

  // 길게 눌러 삭제: 0.55초 누르면 확인창. 누르는 동안 움직이면 취소.
  const [confirmTarget, setConfirmTarget] = useState<PickerCategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();
  const confirmRef = useRef<HTMLDialogElement>(null);
  const pressRef = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  const longPressedRef = useRef(false);

  function startPress(category: PickerCategory, event: React.PointerEvent) {
    if (!onDeleted) return;
    longPressedRef.current = false;
    const timer = setTimeout(() => {
      longPressedRef.current = true;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(15);
      setDeleteError(null);
      setConfirmTarget(category);
    }, 550);
    pressRef.current = { timer, x: event.clientX, y: event.clientY };
  }
  function movePress(event: React.PointerEvent) {
    const press = pressRef.current;
    if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) cancelPress();
  }
  function cancelPress() {
    if (pressRef.current) clearTimeout(pressRef.current.timer);
    pressRef.current = null;
  }

  useEffect(() => {
    const dialog = confirmRef.current;
    if (!dialog) return;
    if (confirmTarget && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.open = true;
    }
    if (!confirmTarget && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.open = false;
    }
  }, [confirmTarget]);

  function confirmDelete() {
    const target = confirmTarget;
    if (!target || deletePending) return;
    startDelete(async () => {
      const result = await deleteCategory(target.id);
      if (result.ok) {
        onDeleted?.(target.id);
        setConfirmTarget(null);
      } else if (result.error === "inUse") {
        setDeleteError(t("categoryInUse", { count: result.count ?? 0 }));
      } else if (result.error === "notAllowed") {
        setDeleteError(t("categoryNotDeletable"));
      } else {
        setDeleteError(t("categoryDeleteFailed"));
      }
    });
  }

  // 모달이 열려 있는 동안 뒤 화면이 스크롤/스와이프되지 않게 잠근다.
  const anyModalOpen = open || confirmTarget !== null;
  useEffect(() => {
    if (!anyModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [anyModalOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Guarded rather than calling showModal()/close() unconditionally:
    // every real browser supports them, but jsdom (unit tests) doesn't
    // implement HTMLDialogElement at all, so this falls back to toggling
    // the `open` attribute directly instead of throwing.
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.open = true;
    }
    if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.open = false;
    }
  }, [open]);

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  // Switching expense/income closes the modal.
  useEffect(() => {
    setOpen(false);
    setError(null);
  }, [type]);

  const trimmed = name.trim();

  // This component deliberately lives inside the transaction <form> (see
  // the note above), so it can't rely on its own onSubmit. Instead it finds
  // that ancestor form and listens for its submit event directly: if the
  // modal is open with a typed-but-never-submitted category name, block the
  // save, show an error, and focus the modal's own "추가" button instead of
  // silently discarding the typed name under whatever category was already
  // selected.
  useEffect(() => {
    const form = fieldsetRef.current?.closest("form");
    if (!form) return;
    function handleSubmit(event: SubmitEvent) {
      if (open && trimmed) {
        event.preventDefault();
        setError(t("categoryAddFirst"));
        addButtonRef.current?.focus();
      }
    }
    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [open, trimmed, t]);

  function closeModal() {
    if (pending) return;
    setOpen(false);
    setError(null);
  }

  function submit() {
    if (pending) return;
    if (!trimmed) {
      setError(t("categoryNameRequired"));
      return;
    }
    setError(null);
    startProgress();
    startTransition(async () => {
      try {
        const result = await createCategory({ type, name: trimmed, icon });
        if (result.error || !result.category) {
          setError(result.error ?? t("categoryNameRequired"));
          return;
        }
        onCreated(result.category);
        setName("");
        setIcon(CATEGORY_ICON_CHOICES[0]);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        doneProgress();
      }
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter here must not submit the outer transaction form.
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }

  // Only the 10 most-used categories show by default (categories arrives
  // pre-sorted most-used-first — see fetchCategoriesSortedByUsage) — the
  // rest are tucked behind "더보기" so this chip row doesn't sprawl as the
  // category list grows. The currently selected one stays visible even if
  // it falls outside the top 10 (e.g. editing an older, rarely-used entry).
  const TOP_COUNT = 10;
  const topCategories = categories.slice(0, TOP_COUNT);
  const hiddenCategories = categories.slice(TOP_COUNT).filter((c) => c.id !== selectedId);
  const forcedVisible = categories.slice(TOP_COUNT).filter((c) => c.id === selectedId);
  const visibleCategories = expanded ? categories : [...topCategories, ...forcedVisible];

  return (
    <fieldset ref={fieldsetRef} className="flex flex-col gap-2">
      <legend className="mb-2 flex items-baseline gap-2 text-sm font-medium text-ink-muted">
        {t("category")}
        {hint && <span className="text-[11px] font-semibold text-brand">{hint}</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {visibleCategories.map((category) => (
          <label
            key={category.id}
            className="cursor-pointer select-none [-webkit-touch-callout:none]"
            title={onDeleted ? t("categoryLongPressHint") : undefined}
            onPointerDown={(event) => startPress(category, event)}
            onPointerMove={movePress}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onPointerCancel={cancelPress}
            onContextMenu={(event) => onDeleted && event.preventDefault()}
            onClickCapture={(event) => {
              // 길게 눌러 확인창을 연 경우엔 선택으로 처리하지 않는다.
              if (longPressedRef.current) {
                event.preventDefault();
                event.stopPropagation();
                longPressedRef.current = false;
              }
            }}
          >
            <input
              type="radio"
              name="categoryId"
              value={category.id}
              checked={category.id === selectedId}
              onChange={() => onSelect(category.id)}
              required
              className="peer sr-only"
            />
            <span
              className={`${chipClass} border-line bg-surface text-ink peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:text-brand-strong peer-focus-visible:ring-2 peer-focus-visible:ring-brand`}
            >
              <CategoryIcon category={category} className="size-4" />
              {category.name}
            </span>
          </label>
        ))}
        {hiddenCategories.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className={`${chipClass} border-dashed border-line text-ink-muted hover:bg-surface-2`}
          >
            {expanded ? t("filterLess") : t("filterMore", { count: hiddenCategories.length })}
          </button>
        )}
        {allowCreate && (
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => {
              setOpen((value) => !value);
              setError(null);
            }}
            className={`${chipClass} border-dashed ${
              open ? "border-brand bg-brand-soft text-brand-strong" : "border-line text-ink-muted hover:bg-surface-2"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`}
          >
            <Plus aria-hidden className="size-4" />
            {t("addCategory")}
          </button>
        )}
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // 모달 위에서의 스와이프가 뒤의 탭 전환/화면으로 전달되지 않게.
        onPointerDownCapture={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        onCancel={(event) => {
          event.preventDefault();
          closeModal();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeModal();
        }}
        className="m-auto w-[min(92vw,26rem)] rounded-[var(--radius-card)] border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex max-h-[85vh] flex-col gap-3 p-5">
          <h2 id={titleId} className="text-base font-bold text-ink">
            {t("addCategoryTitle")}
          </h2>

          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={onKeyDown}
            maxLength={12}
            placeholder={t("categoryNamePlaceholder")}
            aria-label={t("categoryName")}
            className={inputClass}
          />

          {/* -m-1 p-1 (plus the existing pr-1): the selected ring sits right
              at each button's edge, so the top/bottom row's ring would get
              visually clipped by overflow-y-auto without this breathing
              room. */}
          <div
            role="radiogroup"
            aria-label={t("categoryIcon")}
            className="-m-1 grid max-h-[45vh] grid-cols-6 gap-1.5 overflow-y-auto p-1"
          >
            {CATEGORY_ICON_CHOICES.map((choice) => {
              const active = choice === icon;
              return (
                <button
                  key={choice}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={choice}
                  onClick={() => setIcon(choice)}
                  className={`grid h-10 place-items-center rounded-xl text-ink transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    active ? "bg-brand-soft ring-2 ring-brand" : "bg-surface hover:bg-surface"
                  }`}
                >
                  <CategoryIcon iconKey={choice} className="size-5" />
                </button>
              );
            })}
          </div>

          {error && (
            <p role="alert" className={errorClass}>
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={closeModal} disabled={pending} className={buttonClass("ghost", "flex-1")}>
              {t("cancel")}
            </button>
            <button
              ref={addButtonRef}
              type="button"
              onClick={submit}
              disabled={pending || !trimmed}
              aria-busy={pending}
              className={buttonClass("primary", "flex-1")}
            >
              {pending && <Spinner />}
              {t("addCategorySubmit")}
            </button>
          </div>
        </div>
      </dialog>

      <dialog
        ref={confirmRef}
        aria-labelledby={deleteTitleId}
        onPointerDownCapture={(event) => event.stopPropagation()}
        onCancel={(event) => {
          event.preventDefault();
          if (!deletePending) setConfirmTarget(null);
        }}
        onClick={(event) => {
          if (event.target === confirmRef.current && !deletePending) setConfirmTarget(null);
        }}
        className="m-auto w-[min(88vw,22rem)] rounded-[var(--radius-card)] border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-3 p-5">
          <h2 id={deleteTitleId} className="text-base font-bold text-ink">
            {t("categoryDeleteTitle")}
          </h2>
          {confirmTarget && (
            <p className="flex items-center gap-2 text-sm text-ink">
              <CategoryIcon category={confirmTarget} className="size-4 shrink-0" />
              {t("categoryDeleteBody", { name: confirmTarget.name })}
            </p>
          )}
          {deleteError && (
            <p role="alert" className={errorClass}>
              {deleteError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmTarget(null)}
              disabled={deletePending}
              className={buttonClass("ghost", "flex-1")}
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deletePending}
              aria-busy={deletePending}
              className={buttonClass("danger", "flex-1")}
            >
              {deletePending && <Spinner />}
              {t("categoryDeleteConfirm")}
            </button>
          </div>
        </div>
      </dialog>
    </fieldset>
  );
}
