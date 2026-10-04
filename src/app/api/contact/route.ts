import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { decideMailerAction, evaluateSubmission, RETRY_HINT } from "@/lib/contact-guard";
import { buildContactEmail, resolveMailConfig } from "@/lib/contact-mail";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { contactSubmissionSchema, contactTypeLabels } from "@/types/contact";

/**
 * お問い合わせフォーム送信APIエンドポイント
 *
 * 環境変数:
 * - SMTP_HOST: SMTPサーバーホスト
 * - SMTP_PORT: SMTPサーバーポート
 * - SMTP_USER: SMTPユーザー名
 * - SMTP_PASS: SMTPパスワード
 * - CONTACT_FROM_EMAIL: 送信元メールアドレス（任意。省略時は SMTP_USER）
 *
 * 届け先は環境変数ではなく `src/data/contact.ts` が持つ。
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

/**
 * POST: お問い合わせ送信
 *
 * 失敗の応答には `code`（`ContactErrorCode`）を付ける。`error` は日本語の文面で、
 * 来場者へ見せる文言はクライアントが `code` からロケール別に引く（`contact.errors.*`）。
 * 新しい失敗の経路を足したら `code` も足し、4言語の `contact.errors` へ対応するキーを足すこと。
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
          code: "rate_limited",
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
        { success: false, code: "invalid", error: "入力内容に誤りがあります。" },
        { status: 400 }
      );
    }

    // 3. 検証
    const parsed = contactSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          code: "invalid",
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

      return NextResponse.json(
        { success: false, code: "rejected", error: RETRY_HINT },
        { status: 400 }
      );
    }

    // 5. 送信設定。**欠けていたら受け付けない**
    const mailConfig = resolveMailConfig(process.env);
    const missing = mailConfig.ok ? [] : mailConfig.missing;
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
            code: "unavailable",
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
    if (!mailConfig.ok) {
      // decideMailerAction が "send" を返した以上ここへは来ない。型を閉じるためだけの分岐
      throw new Error("送信設定の解決に失敗しました");
    }

    const { config } = mailConfig;
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });

    const emailContent = buildContactEmail({
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      subject: data.subject,
      message: data.message,
    });

    await transporter.sendMail({
      from: config.from,
      to: config.to,
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
        code: "server_error",
        error: "送信中にエラーが発生しました。時間をおいて再度お試しください。",
      },
      { status: 500 }
    );
  }
}
