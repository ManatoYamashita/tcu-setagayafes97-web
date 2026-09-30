"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

interface SlidePanelProps {
  /** false のときは閉じる。退場アニメーションの間は直前の内容を描き続ける */
  open: boolean;
  /** Esc・背景の押下。開閉の状態は親が持つ */
  onClose: () => void;
  /** パネルの見出し要素の id。`aria-labelledby` に使う */
  labelledBy: string;
  children: ReactNode;
}

/**
 * 退場アニメーションが `animationend` を出さなかったときの保険（ms）。
 * `globals.css` の `.slide-panel[data-closing]` の所要時間より長くすること。
 */
const CLOSE_FALLBACK_MS = 320;

/**
 * 下から（lg 以上は右から）滑り込むパネル
 *
 * ネイティブ `<dialog>` を `showModal()` で開く。フォーカストラップ・Esc・背景の inert・
 * top layer（z-index が要らない）・閉じたときの呼び出し元へのフォーカス復帰を標準で得られる。
 * 形状と動きは `globals.css` の `.slide-panel`。
 *
 * 入場・退場とも CSS keyframes で動かす。`@starting-style` + `overlay` の方式は退場が
 * Firefox / Safari で効かないため採らない。退場だけ JS で `data-closing` を付け、
 * アニメーションの終了を待ってから `close()` する。
 *
 * 使い手は タイムテーブルの企画詳細（`TimetableEventPanel`）と協賛の詳細（`SponsorList`）。
 * 設計判断は docs/frontend/timetable-event-panel.md を参照。
 */
export function SlidePanel({ open, onClose, labelledBy, children }: SlidePanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // 退場中も内容を描くため、最後に開いていた内容を保持する。
  // render 中の setState は「props が変わったら state を合わせる」公式の書き方で、
  // children の同一性が変わらない限り再描画は1回で止まる。
  const [snapshot, setSnapshot] = useState<ReactNode>(open ? children : null);
  if (open && children !== snapshot) setSnapshot(children);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      delete dialog.dataset.closing;
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (!dialog.open) return;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      delete dialog.dataset.closing;
      dialog.close();
      setSnapshot(null);
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.target === dialog) finish();
    };

    dialog.dataset.closing = "";
    dialog.addEventListener("animationend", onEnd);
    const timer = window.setTimeout(finish, CLOSE_FALLBACK_MS);

    return () => {
      // 退場の途中で開き直された（または unmount された）場合
      window.clearTimeout(timer);
      dialog.removeEventListener("animationend", onEnd);
    };
  }, [open]);

  // unmount 時に top layer へ残さない
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  // Esc。ネイティブの閉じ方に任せると親の状態と食い違うため、自前の閉じる処理へ流す
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  // 背景の押下は dialog 自身が target になる。中身は dialog を隙間なく覆うため、
  // パネルの内側を押して誤って閉じることはない。Safari は `closedby` 未対応なのでこの経路が必須
  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="slide-panel"
      aria-labelledby={labelledBy}
      onClick={handleClick}
    >
      {open ? children : snapshot}
    </dialog>
  );
}
