/**
 * Accordionコンポーネントの型定義
 */

export interface AccordionItem {
  /** 一意な識別子。絞り込みで並びが変わっても「開いた状態」が別の項目へ移らないよう、key に使う */
  id: string;
  /** アコーディオンのタイトル（質問など） */
  title: string;
  /** アコーディオンのコンテンツ（回答など） */
  content: string;
  /** 初期状態で開いているかどうか */
  defaultOpen?: boolean;
}

export interface AccordionProps {
  /** アコーディオンアイテムの配列 */
  items: AccordionItem[];
  /** カスタムクラス名 */
  className?: string;
}
