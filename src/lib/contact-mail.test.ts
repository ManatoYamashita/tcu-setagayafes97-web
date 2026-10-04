import { describe, expect, it } from "vitest";
import { contactMailConfig } from "@/data/contact";
import { buildContactEmail, resolveMailConfig } from "@/lib/contact-mail";

/** 送信に必要な設定がすべて揃った環境 */
const fullEnv = {
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "465",
  SMTP_USER: "sender@example.com",
  SMTP_PASS: "app-password",
};

describe("contactMailConfig", () => {
  it("届け先は委員会の受信箱である（#261）", () => {
    expect(contactMailConfig.to).toBe("sfa.koho@gmail.com");
  });
});

describe("resolveMailConfig", () => {
  it("設定が揃っていれば、届け先を src/data の値で解決する", () => {
    const result = resolveMailConfig(fullEnv);

    expect(result).toEqual({
      ok: true,
      config: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        user: "sender@example.com",
        pass: "app-password",
        from: "sender@example.com",
        to: "sfa.koho@gmail.com",
      },
    });
  });

  it("届け先は環境変数で差し替えられない（CONTACT_TO_EMAIL は読まない）", () => {
    const result = resolveMailConfig({ ...fullEnv, CONTACT_TO_EMAIL: "stale@example.com" });

    expect(result.ok && result.config.to).toBe("sfa.koho@gmail.com");
  });

  it("CONTACT_TO_EMAIL が無くても送信できる（必須の設定から外れた）", () => {
    expect(resolveMailConfig(fullEnv).ok).toBe(true);
  });

  it("SMTP_* が欠けていたら、欠けている名前をすべて返す", () => {
    expect(resolveMailConfig({ SMTP_HOST: "smtp.gmail.com", SMTP_PORT: "465" })).toEqual({
      ok: false,
      missing: ["SMTP_USER", "SMTP_PASS"],
    });
    expect(resolveMailConfig({})).toEqual({
      ok: false,
      missing: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"],
    });
  });

  it("空白だけの値は未設定として扱う", () => {
    expect(resolveMailConfig({ ...fullEnv, SMTP_PASS: "  " })).toEqual({
      ok: false,
      missing: ["SMTP_PASS"],
    });
  });

  it("前後の空白・改行を落とす（echo で流し込んだ値の末尾改行対策）", () => {
    const result = resolveMailConfig({ ...fullEnv, SMTP_HOST: "smtp.gmail.com\n" });

    expect(result.ok && result.config.host).toBe("smtp.gmail.com");
  });

  it("SMTP_PORT が数値でなければ未設定として扱う", () => {
    expect(resolveMailConfig({ ...fullEnv, SMTP_PORT: "smtps" })).toEqual({
      ok: false,
      missing: ["SMTP_PORT"],
    });
  });

  it("465 のときだけ SSL/TLS で張る（587 は STARTTLS）", () => {
    const tls = resolveMailConfig({ ...fullEnv, SMTP_PORT: "587" });

    expect(tls.ok && tls.config.secure).toBe(false);
  });

  it("差出人は CONTACT_FROM_EMAIL があればそれを、無ければ SMTP_USER を使う", () => {
    const result = resolveMailConfig({ ...fullEnv, CONTACT_FROM_EMAIL: "noreply@example.com" });

    expect(result.ok && result.config.from).toBe("noreply@example.com");
  });
});

describe("buildContactEmail", () => {
  const submission = {
    type: "lost-and-found" as const,
    name: "世田谷 太郎",
    email: "visitor@example.com",
    subject: "財布を落としました",
    message: "7号館の前で黒い財布を落としました。",
  };

  it("件名に種別を問わず固定の接頭辞を付ける", () => {
    expect(buildContactEmail(submission).subject).toBe(
      "【世田谷祭お問い合わせ】財布を落としました"
    );
  });

  it("本文に種別ラベルと入力内容を含める", () => {
    const { text, html } = buildContactEmail(submission);

    for (const body of [text, html]) {
      expect(body).toContain("落とし物のお問い合わせ");
      expect(body).toContain("世田谷 太郎");
      expect(body).toContain("7号館の前で黒い財布を落としました。");
    }
  });

  it("電話番号が無ければ「未入力」と書く", () => {
    expect(buildContactEmail(submission).text).toContain("【電話番号】\n未入力");
  });

  it("来場者の入力を HTML として解釈させない（委員会の受信箱で偽のリンクを描かせない）", () => {
    const { html } = buildContactEmail({
      ...submission,
      name: '<a href="https://phish.example.com">本人確認</a>',
      message: "<script>alert(1)</script>&<img src=x onerror=alert(1)>",
    });

    expect(html).not.toContain('<a href="https://phish.example.com">');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;a href=&quot;https://phish.example.com&quot;&gt;");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;&amp;");
  });

  it("mailto の属性値を引用符で閉じさせない", () => {
    const { html } = buildContactEmail({ ...submission, email: 'a"onmouseover="x@example.com' });

    expect(html).toContain('href="mailto:a&quot;onmouseover=&quot;x@example.com"');
  });

  it("件名から改行を取り除く（ヘッダの行を増やさせない）", () => {
    const { subject } = buildContactEmail({ ...submission, subject: "件名\r\nBcc: x@example.com" });

    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject).toBe("【世田谷祭お問い合わせ】件名 Bcc: x@example.com");
  });
});
