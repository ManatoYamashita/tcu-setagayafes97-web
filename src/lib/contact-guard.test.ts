import { describe, expect, it } from "vitest";
import {
  decideMailerAction,
  evaluateSubmission,
  MIN_SUBMIT_ELAPSED_MS,
  RETRY_HINT,
} from "@/lib/contact-guard";

/** 人が普通に入力して送った状態 */
const human = { botField: "", elapsedMs: 30_000 };

describe("evaluateSubmission", () => {
  it("人が普通に送った内容は通す", () => {
    expect(evaluateSubmission(human)).toBe("ok");
  });

  it("ハニーポットに値が入っていたら拒否する", () => {
    expect(evaluateSubmission({ ...human, botField: "https://spam.example.com" })).toBe(
      "bot-field-filled"
    );
  });

  it("ハニーポットが空白だけなら通す", () => {
    // 自動入力が空白を入れることがある。人は触れないので、空白は「未入力」と同じに扱う
    expect(evaluateSubmission({ ...human, botField: "   " })).toBe("ok");
  });

  it("経過時間が無ければ拒否する（描画を経ない直接POST）", () => {
    expect(evaluateSubmission({ botField: "" })).toBe("missing-timing");
  });

  it("速すぎる送信を拒否する", () => {
    expect(evaluateSubmission({ ...human, elapsedMs: 0 })).toBe("too-fast");
    expect(evaluateSubmission({ ...human, elapsedMs: MIN_SUBMIT_ELAPSED_MS - 1 })).toBe("too-fast");
  });

  it("下限ちょうどは通す", () => {
    expect(evaluateSubmission({ ...human, elapsedMs: MIN_SUBMIT_ELAPSED_MS })).toBe("ok");
  });

  it("ハニーポットの判定は経過時間より先に効く", () => {
    // どちらも違反しているとき、ログに残る理由を安定させる
    expect(evaluateSubmission({ botField: "x", elapsedMs: 0 })).toBe("bot-field-filled");
  });

  /*
   * **下限は人が到達しうる値にしてはいけない。**
   *
   * 氏名・メール・件名・本文（10文字以上が必須）を入力する時間より十分短く、
   * かつ即時POSTは落とせる位置に置く。ここを 10 秒などへ上げると、
   * 短い問い合わせを手早く書いた来場者を弾く。
   */
  it("下限は3秒（人の入力時間より十分短い）", () => {
    expect(MIN_SUBMIT_ELAPSED_MS).toBe(3000);
  });

  /*
   * **「時間をおいて再度お試しください」と書いてはいけない。** 待っても直らない。
   * 自動入力の誤爆で弾かれた人が自力で復帰できる案内であること。
   */
  it("拒否時の案内が、再読み込みを促す内容である", () => {
    expect(RETRY_HINT).toContain("再読み込み");
    expect(RETRY_HINT).not.toContain("時間をおいて");
  });
});

describe("decideMailerAction", () => {
  it("設定が揃っていれば送る", () => {
    expect(decideMailerAction([], true)).toBe("send");
    expect(decideMailerAction([], false)).toBe("send");
  });

  /*
   * **#261 の再発防止装置。**
   *
   * 本番で設定が欠けているのに成功を返すと、来場者には「送信完了。3営業日以内にご返信いたします。」と
   * 表示されたまま、委員会には届かない。**落とし物の届け出が消える。**
   */
  it("本番で設定が欠けていたら受け付けない", () => {
    expect(decideMailerAction(["SMTP_HOST"], true)).toBe("reject");
    expect(decideMailerAction(["SMTP_HOST", "CONTACT_TO_EMAIL"], true)).toBe("reject");
  });

  it("本番以外ではログへ落として受け付ける（開発の利便）", () => {
    expect(decideMailerAction(["SMTP_HOST"], false)).toBe("dev-log");
  });
});
