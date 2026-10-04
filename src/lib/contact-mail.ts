import { contactMailConfig } from "@/data/contact";
import { contactTypeLabels, type ContactType } from "@/types/contact";

/**
 * お問い合わせメールの送信設定と本文（`/api/contact` から使う純粋関数）
 *
 * route.ts から切り出してあるのは、テストで縛るためである。
 * 送信そのもの（nodemailer）は route.ts に残す。
 */

/** 送信に必須の環境変数。**宛先は含まない**（`src/data/contact.ts` が持つ） */
const REQUIRED_MAIL_ENV = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"] as const;

export interface MailConfig {
  host: string;
  port: number;
  /** 465 のときだけ SSL/TLS。587 は STARTTLS なので false */
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
}

export type MailConfigResult = { ok: true; config: MailConfig } | { ok: false; missing: string[] };

/**
 * 環境変数から送信設定を作る
 *
 * 値の前後の空白・改行は落とす。`echo "$VALUE" | vercel env add ...` のように流し込むと
 * 末尾に改行が付き、ホスト名やパスワードが一致しなくなるためである。
 *
 * @param env `process.env` を渡す
 * @returns 設定が欠けていれば、欠けている環境変数の名前
 */
export function resolveMailConfig(env: Record<string, string | undefined>): MailConfigResult {
  const read = (name: string) => env[name]?.trim() ?? "";

  const port = Number(read("SMTP_PORT"));
  const missing = REQUIRED_MAIL_ENV.filter((name) => {
    if (name === "SMTP_PORT") return !Number.isInteger(port) || port <= 0;

    return read(name) === "";
  });

  if (missing.length > 0) return { ok: false, missing };

  const user = read("SMTP_USER");

  return {
    ok: true,
    config: {
      host: read("SMTP_HOST"),
      port,
      secure: port === 465,
      user,
      pass: read("SMTP_PASS"),
      // 差出人は認証したアカウントへ落とす。別ドメインの既定値を書くと SPF/DMARC で弾かれる
      from: read("CONTACT_FROM_EMAIL") || user,
      to: contactMailConfig.to,
    },
  };
}

/** HTML の本文・属性値へ埋め込むための最小限のエスケープ */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface ContactEmailInput {
  type: ContactType;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * 委員会へ送るメールの件名と本文を作る
 *
 * **来場者の入力は必ずエスケープしてから HTML へ埋め込む。** そのまま埋め込むと、
 * 誰でもフォームから委員会の受信箱へ「公式の体裁をしたリンクや画像」を描かせられる。
 */
export function buildContactEmail(data: ContactEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const typeLabel = contactTypeLabels[data.type];
  const phone = data.phone || "未入力";

  // 件名はメールヘッダへ入る。改行を残すとヘッダの行を増やせるので、空白へ畳む
  const subject = `【世田谷祭お問い合わせ】${data.subject.replace(/[\r\n]+/g, " ")}`;

  const text = `
第97回東京都市大学世田谷祭 お問い合わせフォームからのメッセージ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【お問い合わせ種別】
${typeLabel}

【お名前】
${data.name}

【メールアドレス】
${data.email}

【電話番号】
${phone}

【件名】
${data.subject}

【お問い合わせ内容】
${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

このメールは自動送信されています。
  `.trim();

  const h = {
    typeLabel: escapeHtml(typeLabel),
    name: escapeHtml(data.name),
    email: escapeHtml(data.email),
    phone: escapeHtml(phone),
    subject: escapeHtml(data.subject),
    message: escapeHtml(data.message),
  };

  // メールクライアントは CSS 変数を解決しないため、色は HEX を直書きする。
  // #bf73e3 は --color-primary-400 の実配信値（@theme を変更したら手で追従させること）。
  // #9b59b6 はグラデーションの終端としてここだけで使う色で、カラースケールには属さない。
  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お問い合わせ</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #bf73e3 0%, #9b59b6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">第97回東京都市大学世田谷祭</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">お問い合わせフォームからのメッセージ</p>
  </div>

  <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px; color: #666;">お問い合わせ種別</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${h.typeLabel}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">お名前</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${h.name}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">メールアドレス</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${h.email}" style="color: #bf73e3;">${h.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">電話番号</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${h.phone}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">件名</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${h.subject}</td>
      </tr>
    </table>

    <div style="margin-top: 20px;">
      <p style="font-weight: bold; color: #666; margin-bottom: 10px;">お問い合わせ内容</p>
      <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #eee; white-space: pre-wrap;">${h.message}</div>
    </div>
  </div>

  <div style="background: #f0f0f0; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
    <p style="margin: 0;">このメールは自動送信されています</p>
    <p style="margin: 5px 0 0 0;">東京都市大学 世田谷祭実行委員会</p>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}
