/**
 * Accordionコンポーネントの型定義
 */

export interface AccordionItem {
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

export interface AccordionItemProps {
  /** アコーディオンアイテム */
  item: AccordionItem;
  /** インデックス（一意なキーとして使用） */
  index: number;
}
