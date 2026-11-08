"use client";

import { animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { REVEAL_WIDTH, resolveSwipeReveal } from "./resolve-swipe-reveal";

const SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;

/**
 * Row that reveals a trash button when dragged left (touch or mouse).
 * Nested inside the page-level tab swipe: framer-motion's per-axis drag lock
 * lets the innermost draggable win, so swiping a row never switches tabs.
 */
export function SwipeToDelete({
  children,
  onDelete,
  deleteLabel,
  disabled = false,
  canDelete = true,
  editHref,
  editLabel,
  className = "",
  contentClassName = "",
}: {
  children: ReactNode;
  onDelete: () => void;
  deleteLabel: string;
  disabled?: boolean;
  /** false 면 삭제 버튼 없이 (수정만) 노출. */
  canDelete?: boolean;
  /** 있으면 삭제 옆에 수정 버튼을 함께 노출. */
  editHref?: string;
  editLabel?: string;
  className?: string;
  contentClassName?: string;
}) {
  const actionCount = (editHref ? 1 : 0) + (canDelete ? 1 : 0);
  const revealWidth = REVEAL_WIDTH * Math.max(1, actionCount);
  const x = useMotionValue(0);
  const buttonOpacity = useTransform(x, [-revealWidth, -12, 0], [1, 0.4, 0]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);

  useEffect(() => {
    const controls = animate(x, open ? -revealWidth : 0, SPRING);
    return () => controls.stop();
  }, [open, x, revealWidth]);

  // Tapping anywhere else closes an open row.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (disabled || actionCount === 0) return <div className={className}>{children}</div>;

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    const next = resolveSwipeReveal(info.offset.x, info.velocity.x, open, revealWidth);
    if (next === open) {
      // State unchanged: the effect won't re-run, so snap back explicitly.
      animate(x, open ? -revealWidth : 0, SPRING);
    }
    setOpen(next);
  }

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ opacity: buttonOpacity, width: revealWidth }}
        className="absolute inset-y-0 right-0 flex"
      >
        {editHref && (
          <Link
            href={editHref}
            aria-label={editLabel}
            title={editLabel}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(false)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-ink-muted text-xs font-semibold text-white"
          >
            <Pencil aria-hidden className="size-5" strokeWidth={2} />
            <span>{editLabel}</span>
          </Link>
        )}
        {canDelete && (
          <button
            type="button"
            aria-label={deleteLabel}
            title={deleteLabel}
            onFocus={() => setOpen(true)}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-expense text-xs font-semibold text-white"
          >
            <Trash2 aria-hidden className="size-5" strokeWidth={2} />
            <span>{deleteLabel}</span>
          </button>
        )}
      </motion.div>
      <motion.div
        style={{ x }}
        drag="x"
        dragDirectionLock
        dragMomentum={false}
        dragConstraints={{ left: -revealWidth, right: 0 }}
        dragElastic={{ left: 0.2, right: 0.05 }}
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onDragEnd={handleDragEnd}
        onClickCapture={(event) => {
          // Swallow the click that ends a drag, and a tap on an open row just closes it.
          if (draggedRef.current || open) {
            event.preventDefault();
            event.stopPropagation();
            if (!draggedRef.current) setOpen(false);
          }
          draggedRef.current = false;
        }}
        onPointerDown={() => {
          draggedRef.current = false;
        }}
        className={`relative touch-pan-y ${contentClassName}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
