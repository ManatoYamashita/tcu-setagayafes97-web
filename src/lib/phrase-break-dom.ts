import { PHRASE_SEPARATOR, hasJapanese, insertPhraseBreaks } from "./phrase-break";

/** 区切りを入れたテキストの親へ付ける。`globals.css` がこれに `keep-all` を当てる */
const MARK = "data-phrase-break";

/**
 * 触らない要素。入力欄・コード・SVG の文字は見た目や値が変わる。
 * `aria-live` は書き換えると読み上げが繰り返されるため除く。
 */
const SKIP = [
  "script",
  "style",
  "noscript",
  "textarea",
  "select",
  "code",
  "pre",
  "svg",
  "[contenteditable]",
  "[aria-live]",
  "[data-no-phrase-break]",
].join(",");

type Parse = (text: string) => string[];

let parsePromise: Promise<Parse> | undefined;

/** BudouX（日本語モデルのみ、gzip 約 9 KB）を初回だけ読み込む */
export function loadJapaneseParse(): Promise<Parse> {
  parsePromise ??= import("./budoux-ja").then(({ createJapaneseParser }) => {
    const parser = createJapaneseParser();
    return (text: string) => parser.parse(text);
  });
  return parsePromise;
}

// 自分の書き込みも MutationObserver へ characterData の変更として届くので、処理済みの値と比べて捨てる
const processed = new WeakMap<Text, string>();

/**
 * React がこのテキストをもうハイドレーションし終えたか
 *
 * 遅れてハイドレーションされる `<Suspense>` 境界（`/events` の一覧など）の中身を先に
 * 書き換えると、サーバーの HTML と食い違って React がエラー #418 を出し、境界を描き直す
 * （2026-10-10 に `/events` で実測）。ハイドレーション済みの DOM には React が
 * `__reactFiber$…` を持たせるので、最寄りの持ち主を探して判定する。
 * 持ち主が親でなくても `dangerouslySetInnerHTML` の中身（microCMS の本文）なら React は
 * 照合しないため書き換えてよい。React の内部名に頼っているので、上げるときは確かめること。
 */
function isHydrated(node: Text): boolean {
  for (let element = node.parentElement; element; element = element.parentElement) {
    const keys = Object.keys(element);
    if (!keys.some((key) => key.startsWith("__reactFiber$"))) continue;
    if (element === node.parentElement) return true;
    const propsKey = keys.find((key) => key.startsWith("__reactProps$"));
    const props = propsKey ? (element as unknown as Record<string, unknown>)[propsKey] : undefined;
    return typeof props === "object" && props !== null && "dangerouslySetInnerHTML" in props;
  }
  return false;
}

function isJapaneseScope(element: Element): boolean {
  const lang = element.closest("[lang]")?.getAttribute("lang") ?? "ja";
  return lang.startsWith("ja");
}

/**
 * root 以下の日本語テキストへ文節の区切りを入れる（設計は src/lib/phrase-break.ts）
 *
 * @returns ハイドレーション待ちで見送ったテキストがあれば true
 */
export function breakPhrasesIn(root: Node, parse: Parse): boolean {
  let deferred = false;

  const visit = (node: Text) => {
    if (processed.get(node) === node.data) return;
    const parent = node.parentElement;
    if (!parent || !hasJapanese(node.data) || parent.closest(SKIP) || !isJapaneseScope(parent)) {
      return;
    }
    if (!isHydrated(node)) {
      deferred = true;
      return;
    }
    const next = insertPhraseBreaks(node.data, parse);
    if (next !== node.data) node.data = next;
    processed.set(node, next);
    if (next.includes(PHRASE_SEPARATOR) && !parent.hasAttribute(MARK)) {
      parent.setAttribute(MARK, "");
    }
  };

  if (root instanceof Text) {
    visit(root);
  } else {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) visit(node as Text);
  }
  return deferred;
}

/**
 * 要素の中へ今すぐ区切りを入れる。DOM を作り替える演出（SplitText）の前に呼ぶ
 *
 * 作り替えた後の要素には React の持ち主がいないため、PhraseBreaker は触れない。
 * 読み込みに失敗しても例外は投げない（区切りが無いまま表示されるだけ）。
 */
export async function applyPhraseBreaks(root: Element): Promise<void> {
  try {
    breakPhrasesIn(root, await loadJapaneseParse());
  } catch {
    // 区切りは見た目の改善にとどまるので、取れなければ従来の折り返しのままにする
  }
}
