"use client";

import { useEffect, useState, type ComponentType } from "react";

/**
 * Agentation（UI視覚フィードバックツール）を開発環境でのみ有効化するラッパー。
 *
 * Agentation は要素をクリックして注釈を付け、セレクタ・位置・コンテキストを含む
 * 構造化データを AI コーディングエージェント向けに書き出す開発補助ツール。
 * https://www.agentation.com/
 *
 * 設計意図:
 * - `process.env.NODE_ENV` は本番クライアントバンドルでは文字列 "production" に
 *   静的置換される。そのため本番では早期 return 以降が到達不能なデッドコードとなり、
 *   `import("agentation")` ごとツリーシェイクで除去される。
 *   → 本番のクライアントバンドルには Agentation 由来のコードが一切含まれない。
 * - 動的 import により、開発時のみオンデマンドでモジュールを読み込む。
 * - 読み込み失敗はアプリ本体の描画に影響させない。
 */
export function AgentationDevTool() {
  const [Tool, setTool] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let mounted = true;
    import("agentation")
      .then((mod) => {
        if (mounted) setTool(() => mod.Agentation);
      })
      .catch(() => {
        // 開発ツールの読み込み失敗は無視する（本番では到達しない）
      });

    return () => {
      mounted = false;
    };
  }, []);

  return Tool ? <Tool /> : null;
}
