import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactFormSchema, contactTypeLabels, type ContactType } from "@/types/contact";

/**
 * お問い合わせフォーム送信APIエンドポイント
 *
 * 環境変数:
 * - SMTP_HOST: SMTPサーバーホスト
 * - SMTP_PORT: SMTPサーバーポート
 * - SMTP_USER: SMTPユーザー名
 * - SMTP_PASS: SMTPパスワード
 * - CONTACT_TO_EMAIL: 送信先メールアドレス
 * - CONTACT_FROM_EMAIL: 送信元メールアドレス
 */

// レート制限用のシンプルなインメモリストア
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分
const RATE_LIMIT_MAX_REQUESTS = 3; // 1分あたり最大3リクエスト

/**
 * レート制限チェック
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return true;
  }

  // ウィンドウが過ぎていたらリセット
  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return true;
  }

  // 制限チェック
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // カウント増加
  record.count++;
  return true;
}

/**
 * メール送信用のトランスポーター作成
 */
function createTransporter() {
  // 環境変数が設定されていない場合はnullを返す
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * メール本文を生成
 */
function generateEmailContent(data: {
  type: ContactType;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): { subject: string; text: string; html: string } {
  const typeLabel = contactTypeLabels[data.type];

  const subject = `【世田谷祭お問い合わせ】${data.subject}`;

  const text = `
東京都市大学 第97回 世田谷祭 お問い合わせフォームからのメッセージ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【お問い合わせ種別】
${typeLabel}

【お名前】
${data.name}

【メールアドレス】
${data.email}

【電話番号】
${data.phone || "未入力"}

【件名】
${data.subject}

【お問い合わせ内容】
${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

このメールは自動送信されています。
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お問い合わせ</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #CD79EE 0%, #9b59b6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">東京都市大学 第97回 世田谷祭</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">お問い合わせフォームからのメッセージ</p>
  </div>

  <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px; color: #666;">お問い合わせ種別</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${typeLabel}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">お名前</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">メールアドレス</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}" style="color: #CD79EE;">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">電話番号</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone || "未入力"}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">件名</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.subject}</td>
      </tr>
    </table>

    <div style="margin-top: 20px;">
      <p style="font-weight: bold; color: #666; margin-bottom: 10px;">お問い合わせ内容</p>
      <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #eee; white-space: pre-wrap;">${data.message}</div>
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

/**
 * POST: お問い合わせ送信
 */
export async function POST(request: NextRequest) {
  try {
    // IPアドレス取得（レート制限用）
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // レート制限チェック
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "送信回数の制限を超えました。しばらく時間をおいてから再度お試しください。",
        },
        { status: 429 }
      );
    }

    // リクエストボディ取得
    const body = await request.json();

    // バリデーション
    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "入力内容に誤りがあります。",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // メールトランスポーター作成
    const transporter = createTransporter();

    if (!transporter) {
      // 開発環境または環境変数未設定の場合はログ出力のみ
      console.log("=".repeat(50));
      console.log("[Contact Form Submission - Dev Mode]");
      console.log("=".repeat(50));
      console.log("Type:", contactTypeLabels[data.type]);
      console.log("Name:", data.name);
      console.log("Email:", data.email);
      console.log("Phone:", data.phone || "N/A");
      console.log("Subject:", data.subject);
      console.log("Message:", data.message);
      console.log("=".repeat(50));

      return NextResponse.json({
        success: true,
        message: "お問い合わせを受け付けました（開発モード）",
      });
    }

    // メール内容生成
    const emailContent = generateEmailContent({
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      subject: data.subject,
      message: data.message,
    });

    // メール送信
    await transporter.sendMail({
      from: process.env.CONTACT_FROM_EMAIL || "noreply@setagayafes.com",
      to: process.env.CONTACT_TO_EMAIL || "contact@setagayafes.com",
      replyTo: data.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    return NextResponse.json({
      success: true,
      message: "お問い合わせを受け付けました",
    });
  } catch (error) {
    console.error("Contact form submission error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "送信中にエラーが発生しました。時間をおいて再度お試しください。",
      },
      { status: 500 }
    );
  }
}
