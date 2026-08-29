"use client";

import { useEffect } from "react";

/**
 * 画像のドラッグ（デスクトップへの保存や別タブへのドロップ）をサイト全体で抑止する。
 *
 * `globals.css` の `-webkit-user-drag: none` は Chromium / WebKit 系にしか効かず、
 * Firefox には画像ドラッグを CSS だけで止める手段がない。そのため document 段階で
 * dragstart を捕まえ、発生元が画像であれば既定動作を打ち消す。
 *
 * リスナーは document に1つ張るだけなので、画像が何枚に増えてもコストは変わらない。
 * 打ち消すのは HTML5 drag API の既定動作のみで、ポインタ／タッチ操作には触れないため、
 * カルーセルのスワイプなど既存のジェスチャには影響しない。
 */
export function NoImageDrag() {
  useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      const target = event.target;

      // リンクで囲まれた画像はイベントの発生元が <img> になるため、
      // ここで止めればリンクURLのドラッグも同時に抑止できる。
      if (target instanceof Element && target.closest("img")) {
        event.preventDefault();
      }
    };

    document.addEventListener("dragstart", handleDragStart);
    return () => document.removeEventListener("dragstart", handleDragStart);
  }, []);

  return null;
}
