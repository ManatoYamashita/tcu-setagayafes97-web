import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { decideMailerAction, evaluateSubmission, RETRY_HINT } from "@/lib/contact-guard";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { contactSubmissionSchema, contactTypeLabels, type ContactType } from "@/types/contact";

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

/**
 * IP 単位のレート制限（**補助**）
 *
 * > [!IMPORTANT]
 * > **これは厳密な上限になりません。** サーバーレスでは状態がインスタンスごとに別で、
 * > 2026-09-21 の実測では **429 を返した約3秒後に、上限を超えたはずの同じIPが通りました**（#260）。
 * > 実効の上限は「設定値 × 同時に生きているインスタンス数」で、**負荷が上がるほど緩くなります。**
 * >
 * > 主防御は `src/lib/contact-guard.ts`（状態を持たない）です。ここは素朴な連打を鈍らせるだけの保険です。
 *
 * **30本/分は「1人あたりの妥当な回数」ではありません。** 学園祭当日は大学構内の Wi-Fi から
 * 数千人が同じ出口IPで出てきます。1人基準（数本/分）で置くと、**落とし物を届け出ようとした来場者が、
 * 自分ではなく他人の送信で弾かれます。** 誤爆を避ける側へ倒し、連打は上の主防御で落とします。
 *
 * 以前はこのファイルに独自の `Map` がありましたが、**期限切れのエントリを一度も消しませんでした。**
 * 掃除つきの共通モジュールへ寄せてあります。
 */
const limiter = createRateLimiter({ limit: 30, windowMs: 60_000 });

/** 送信に必要な設定が揃っているか。欠けている環境変数の名前を返す */
function missingMailEnv(): string[] {
  return [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    // **宛先には既定値を置かない。** 以前は `contact@setagayafes.com` へ落ちていたが、
    // このサイトのドメインは `setagayafes.org` であり、届かない先へ静かに送る形だった
    "CONTACT_TO_EMAIL",
  ].filter((name) => !process.env[name]);
}

/**
 * メール送信用のトランスポーターと宛先を作る
 *
 * @returns 設定が欠けていれば null
 */
function resolveMailer() {
  if (missingMailEnv().length > 0) return null;

  const port = Number.parseInt(process.env.SMTP_PORT as string, 10);

  return {
    transporter: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // 465 のときだけ SSL/TLS で張る。587 は STARTTLS なので secure は false
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASS as string,
      },
    }),
    to: process.env.CONTACT_TO_EMAIL as string,
    // 差出人は認証したアカウントへ落とす。別ドメインの既定値を書くと SPF/DMARC で弾かれる
    from: process.env.CONTACT_FROM_EMAIL || (process.env.SMTP_USER as string),
  };
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
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}" style="color: #bf73e3;">${data.email}</a></td>
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
 *
 * **検証の順序に意味がある。** レート制限を本文のパースより前に置いてあるのは、
 * 安い検査を先に終えるためと、**空ボディ `{}` で副作用なしにレート制限を試せる**ようにするためである
 * （空ボディは下の zod 検証で 400 になり、メールは出ない。#260 の実測で使った手）。
 */
export async function POST(request: NextRequest) {
  try {
    // 1. レート制限（補助）。詳細は limiter の宣言を参照
    const ip = getClientIp(request.headers);

    if (!limiter.take(ip)) {
      console.error(`[contact] レート制限に到達しました ip=${ip}`);

      return NextResponse.json(
        {
          success: false,
          error: "送信回数の制限を超えました。しばらく時間をおいてから再度お試しください。",
        },
        { status: 429 }
      );
    }

    // 2. 本文のパース
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "入力内容に誤りがあります。" },
        { status: 400 }
      );
    }

    // 3. 検証
    const parsed = contactSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "入力内容に誤りがあります。",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 4. 自動投稿よけ（主防御）。状態を持たないので、どのインスタンスでも同じ判定になる
    const verdict = evaluateSubmission({ botField: data.botField, elapsedMs: data.elapsedMs });

    if (verdict !== "ok") {
      // **来場者の入力内容は出さない。** どの経路で落ちたかだけ残す
      console.error(`[contact] 自動投稿として拒否しました verdict=${verdict} ip=${ip}`);

      return NextResponse.json({ success: false, error: RETRY_HINT }, { status: 400 });
    }

    // 5. 送信設定。**欠けていたら受け付けない**
    const missing = missingMailEnv();
    const action = decideMailerAction(missing, process.env.NODE_ENV === "production");

    if (action !== "send") {
      /*
       * 本番で設定が欠けているのは事故である。**成功を返してはいけない。**
       *
       * 2026-09-21 まで、ここは本番でも `success: true` を返しており、来場者には
       * 「送信完了。3営業日以内にご返信いたします。」と表示されていた。実際には
       * 関数ログへ出力されるだけで、委員会には届いていなかった（#261）。
       * **落とし物の届け出もここで消えていた。**
       */
      if (action === "reject") {
        console.error(
          `[contact] 送信設定が未完了のため受け付けられません。未設定: ${missing.join(", ")}`
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "ただいまお問い合わせフォームからの送信ができません。お急ぎの場合は、X（旧Twitter）@setagayafes_tcu のダイレクトメッセージからご連絡ください。",
          },
          { status: 503 }
        );
      }

      // 開発時のみ、内容をログへ出して受け付けたことにする
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

    // 6. 送信
    const mailer = resolveMailer();

    if (!mailer) {
      // decideMailerAction が "send" を返した以上ここへは来ない。型を閉じるためだけの分岐
      throw new Error("送信設定の解決に失敗しました");
    }

    const emailContent = generateEmailContent({
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      subject: data.subject,
      message: data.message,
    });

    await mailer.transporter.sendMail({
      from: mailer.from,
      to: mailer.to,
      replyTo: data.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    /*
     * 成功時も1行残す。Vercel の Functions ログで、届いているかを確認する唯一の手段になる。
     * **氏名・メールアドレス・本文は出さない。** 種別と本文の長さがあれば、量と傾向は追える。
     */
    console.log(`[contact] 送信しました type=${data.type} len=${data.message.length}`);

    return NextResponse.json({
      success: true,
      message: "お問い合わせを受け付けました",
    });
  } catch (error) {
    console.error("[contact] 送信中にエラーが発生しました:", error);

    return NextResponse.json(
      {
        success: false,
        error: "送信中にエラーが発生しました。時間をおいて再度お試しください。",
      },
      { status: 500 }
    );
  }
}
