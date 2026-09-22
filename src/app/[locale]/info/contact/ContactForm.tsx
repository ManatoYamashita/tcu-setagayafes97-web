"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { contactFormSchema, type ContactFormData, type ContactType } from "@/types/contact";

/**
 * 種別カード1枚分の内容
 *
 * 文言はロケール別なので、next-intl のサーバー API を持つ `page.tsx` で解決して渡す。
 */
export interface ContactTypeOption {
  value: ContactType;
  title: string;
  description: string;
}

/**
 * 入力欄の共通スタイル
 *
 * 白いシートの上に白い入力欄を置くと、境界線だけが欄の存在を示すことになり、
 * どこを触ればよいのか分かりにくい。淡い藤色（primary-50）で面を作り、
 * フォーカス時に白へ抜けることで「いま入力している欄」を1つだけ際立たせる。
 *
 * ホバーで面の色を変えてはいけない。同じ `background-color` を争うことになり、
 * Tailwind の並び順ではホバーが `aria-invalid` に勝つ。入力漏れの欄にカーソルが
 * 乗っているあいだだけ赤い面が消え、境界線だけが赤い状態になる（実測）。 同じ理由で
 * フォーカス時に境界線の色も変えない。3px のアウトラインが既にフォーカスを示しており、
 * 境界線まで紫にすると `aria-invalid` の赤が隠れる。
 */
const FIELD_CLASS =
  "w-full rounded-xl border border-transparent bg-primary-50 px-4 py-3 text-gray-900 transition-colors placeholder:text-gray-500 focus:bg-white focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-primary-600 aria-[invalid=true]:border-red-600 aria-[invalid=true]:bg-red-50 motion-reduce:transition-none";

/**
 * ラベル列と入力列の2段組。md 未満では積み上げる
 *
 * 入力列の右端は、上に並ぶ種別カードの右端と同じ1本に揃える。欄ごとに幅を変えると
 * 右端が階段状にばらけ、意図ではなく作りかけに見える。幅で内容の長さを示すのは
 * お名前と電話番号の2つだけにとどめる。
 */
const ROW_CLASS = "md:grid md:grid-cols-[8rem_minmax(0,1fr)] md:gap-x-6";

/**
 * ラベル・補足・エラーを1組にまとめた行
 *
 * 補足（hint）とエラーの両方が `aria-describedby` の対象になるため、
 * id の組み立てを呼び出し側に散らさず、ここで一括して決める。
 */
function Field({
  name,
  label,
  optional,
  hint,
  error,
  children,
}: {
  name: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={ROW_CLASS}>
      <label
        htmlFor={name}
        className={`mb-2 block text-sm font-semibold text-gray-900 md:mb-0 ${hint ? "" : "md:pt-3.5"}`}
      >
        {label}
        {optional && <span className="ml-2 font-normal text-gray-600">任意</span>}
      </label>
      <div className="min-w-0">
        {hint && (
          <p id={`${name}-hint`} className="mb-2 text-sm text-gray-600">
            {hint}
          </p>
        )}
        {children}
        {error && (
          <p id={`${name}-error`} className="mt-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/** `aria-describedby` に載せる id を組み立てる。該当が無ければ属性ごと落とす */
function describedBy(
  name: string,
  { hasHint, hasError }: { hasHint?: boolean; hasError?: boolean }
) {
  const ids = [hasHint && `${name}-hint`, hasError && `${name}-error`].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

/**
 * お問い合わせフォームコンポーネント
 */
export function ContactForm({ typeOptions }: { typeOptions: ContactTypeOption[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  /**
   * サーバーが返した案内文
   *
   * **固定文言だけを出してはいけません。** 送信設定が未完了のとき（#261）や自動投稿よけに
   * 掛かったときは「時間をおいて再度お試しください」では直らず、来場者が何をすべきか分かりません。
   * サーバーが具体的な案内を返したらそれを出し、無ければ従来の文言へ落とします。
   */
  const [serverError, setServerError] = useState<string | null>(null);

  /**
   * ハニーポット
   *
   * 画面外にあり、人には見えません。**自動投稿だけが値を入れます。**
   * `react-hook-form` の管理下へ置かないのは、`zodResolver` が
   * **来場者に見えない欄のエラーを画面へ出してしまう**ためです。
   */
  const [botField, setBotField] = useState("");

  /**
   * フォームが描画された時刻
   *
   * 送信までの経過時間をサーバーへ渡します。**描画を経ずに直接 POST する相手はこれを送れません。**
   * `useRef` の初期化子ではなく効果の中で入れるのは、サーバー描画時の時刻を混ぜないためです。
   */
  const mountedAtRef = useRef<number | null>(null);

  /**
   * 送信結果バナー。結果が出たらここへフォーカスを移す。
   *
   * 成功時は `reset()` で入力内容が消えるため、フォーカスを動かさないと
   * **「何も起きずに入力だけが消えた」ようにしか分からない。**
   * バナーは `role` で読み上げられるが、読み上げを使わないキーボード利用者には
   * 届かないので、フォーカスの移動が要る（#177 B-2）。
   */
  const statusRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      type: "general",
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      agreeToPrivacyPolicy: false,
    },
  });

  /** 選択中の種別。カードの塗りと、フォームを指す角の表示に使う */
  const selectedType = watch("type");

  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (submitStatus) statusRef.current?.focus();
  }, [submitStatus]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setServerError(null);

    const mountedAt = mountedAtRef.current;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          botField,
          // 未描画（= 効果が走っていない）なら送らない。サーバー側が「描画を経ていない」と判定する
          ...(mountedAt === null ? {} : { elapsedMs: Date.now() - mountedAt }),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "送信に失敗しました");
      }

      setSubmitStatus("success");
      reset();
      setBotField("");
      // 連続送信でも経過時間を測り直せるようにする
      mountedAtRef.current = Date.now();
    } catch (error) {
      console.error("Form submission error:", error);
      setServerError(error instanceof Error ? error.message : null);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* 成功メッセージ */}
      {submitStatus === "success" && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="status"
          className="mb-8 flex items-start gap-3 rounded-2xl bg-green-50 p-5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-700" />
          <div>
            <p className="font-semibold text-green-900">送信しました</p>
            <p className="mt-1 text-sm text-green-900">
              3営業日以内にご返信します。確認メールは届かないため、控えが必要な場合はこの画面を保存してください。
            </p>
          </div>
        </div>
      )}

      {/* エラーメッセージ */}
      {submitStatus === "error" && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="mb-8 flex items-start gap-3 rounded-2xl bg-red-50 p-5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-700" />
          <div>
            <p className="font-semibold text-red-900">送信できませんでした</p>
            <p className="mt-1 text-sm text-red-900">
              {serverError ?? "送信中にエラーが発生しました。時間をおいて再度お試しください。"}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/*
          ハニーポット（自動投稿よけ）

          **来場者からも支援技術からも隠します。** `aria-hidden` で読み上げから外し、
          `tabIndex={-1}` でキーボードの移動順からも外します。両方やらないと、
          スクリーンリーダーの利用者や Tab で辿る人が「入力してはいけない欄」に到達します。

          `display: none` ではなく画面外へ飛ばしているのは、そのほうが自動投稿に
          埋められやすいためです（見えない＝入力される、が狙い）。

          `autoComplete="off"` はブラウザの自動入力による誤爆を減らすためです。
          それでも埋まる可能性はあるので、**拒否時の案内は「再読み込み」を促す文言**にしてあります
          （`src/lib/contact-guard.ts` の `RETRY_HINT`）。
        */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="contact-bot-field">この欄は入力しないでください</label>
          <input
            id="contact-bot-field"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={botField}
            onChange={(event) => setBotField(event.target.value)}
          />
        </div>

        {/*
          お問い合わせ種別

          カードそのものがラジオボタンである。`<input>` は `sr-only` で視覚的にだけ隠し、
          フォーカスも読み上げも従来どおり届く。見た目の分岐は `peer-*` ではなく
          `selectedType` で行う（`:checked` と `:has()` の組み合わせに頼らずに済み、
          条件が TSX 上で読めるため）。フォーカスリングだけは CSS 側で持つ必要があるので
          `peer-focus-visible:` を使う。
        */}
        <fieldset className="min-w-0">
          <legend className="mb-4 text-base font-semibold text-gray-900">どのご用件ですか</legend>
          <div className="grid gap-4 md:grid-cols-3">
            {typeOptions.map((option) => {
              const isSelected = selectedType === option.value;

              return (
                <label key={option.value} className="block cursor-pointer">
                  <input
                    type="radio"
                    value={option.value}
                    {...register("type")}
                    className="peer sr-only"
                  />
                  <span
                    className={`relative flex h-full flex-col gap-1.5 rounded-2xl border p-5 transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-600 motion-reduce:transition-none ${
                      isSelected
                        ? "border-primary-700 bg-primary-700 text-white"
                        : "border-gray-200 bg-white text-gray-900 hoverable:hover:border-primary hoverable:hover:bg-primary-50"
                    }`}
                  >
                    <span className="font-serif text-lg leading-snug font-bold">
                      {option.title}
                    </span>
                    <span
                      className={`text-sm leading-relaxed ${isSelected ? "text-primary-50" : "text-gray-600"}`}
                    >
                      {option.description}
                    </span>
                    {/*
                      選択中のカードから下向きの角を出し、この下のフォームが
                      いまどの用件に紐づいているかを示す。カードが横並びになる
                      md 以上でだけ意味を持つ（縦積みでは直下の別カードを指してしまう）。
                    */}
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-2 left-1/2 hidden h-4 w-4 -translate-x-1/2 rotate-45 rounded-[3px] bg-primary-700 md:block"
                      />
                    )}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.type && (
            <p className="mt-2 text-sm font-medium text-red-700">{errors.type.message}</p>
          )}
        </fieldset>

        <div className="space-y-6">
          {/*
            必須の印は付けない。**任意なのは電話番号だけ**であり、
            5つの欄に赤い `*` を並べて末尾に凡例を置くより、
            例外のほうへ印を付けたほうが読む量が減る。
            機械向けには各欄の `aria-required` が伝える。
          */}
          <p className="text-sm text-gray-600">電話番号のみ任意です。</p>

          <Field name="name" label="お名前" error={errors.name?.message}>
            <input
              id="name"
              type="text"
              {...register("name")}
              autoComplete="name"
              aria-required="true"
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={describedBy("name", { hasError: !!errors.name })}
              placeholder="山田 太郎"
              className={`${FIELD_CLASS} max-w-sm`}
            />
          </Field>

          <Field name="email" label="メールアドレス" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              {...register("email")}
              autoComplete="email"
              aria-required="true"
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={describedBy("email", { hasError: !!errors.email })}
              placeholder="example@example.com"
              className={FIELD_CLASS}
            />
          </Field>

          <Field name="phone" label="電話番号" optional error={errors.phone?.message}>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              autoComplete="tel"
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={describedBy("phone", { hasError: !!errors.phone })}
              placeholder="090-1234-5678"
              className={`${FIELD_CLASS} max-w-[14rem]`}
            />
          </Field>

          <Field name="subject" label="件名" error={errors.subject?.message}>
            <input
              id="subject"
              type="text"
              {...register("subject")}
              aria-required="true"
              aria-invalid={errors.subject ? "true" : undefined}
              aria-describedby={describedBy("subject", { hasError: !!errors.subject })}
              placeholder="企画の開催時間について"
              className={FIELD_CLASS}
            />
          </Field>

          {/*
            本文には placeholder を置かない。ラベルと同じ文言を繰り返すうえ、
            入力を始めた瞬間に「10文字以上」という条件ごと消えてしまう。
            条件は hint として常に見える位置に残す。
          */}
          <Field
            name="message"
            label="お問い合わせ内容"
            hint="日時や企画名など、具体的に書いていただけると回答が早くなります（10文字以上）。"
            error={errors.message?.message}
          >
            <textarea
              id="message"
              {...register("message")}
              rows={8}
              aria-required="true"
              aria-invalid={errors.message ? "true" : undefined}
              aria-describedby={describedBy("message", {
                hasHint: true,
                hasError: !!errors.message,
              })}
              className={FIELD_CLASS}
            />
          </Field>
        </div>

        {/* 同意と送信。入力欄と切り離して、押す前に読む場所だと分かるようにする */}
        <div className={`border-t border-gray-200 pt-8 ${ROW_CLASS}`}>
          <div className="space-y-6 md:col-start-2">
            <div>
              <label className="flex items-start gap-3 text-sm text-gray-900">
                <input
                  type="checkbox"
                  {...register("agreeToPrivacyPolicy")}
                  aria-invalid={errors.agreeToPrivacyPolicy ? "true" : undefined}
                  aria-describedby={
                    errors.agreeToPrivacyPolicy ? "agreeToPrivacyPolicy-error" : undefined
                  }
                  className="mt-0.5 h-5 w-5 flex-shrink-0 accent-primary-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                />
                <span>
                  <Link
                    href="/about/privacy"
                    className="font-semibold text-primary-600 underline underline-offset-4 hoverable:hover:no-underline"
                  >
                    プライバシーポリシー
                  </Link>
                  に同意します
                </span>
              </label>
              {errors.agreeToPrivacyPolicy && (
                <p
                  id="agreeToPrivacyPolicy-error"
                  className="mt-2 text-sm font-medium text-red-700"
                >
                  {errors.agreeToPrivacyPolicy.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary-600 px-10 py-3.5 font-semibold text-white transition-[background-color,box-shadow,scale] duration-150 ease-out hoverable:hover:bg-primary-700 hoverable:hover:shadow-lg focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    <span>送信中</span>
                  </>
                ) : (
                  <span>送信する</span>
                )}
              </button>
              <p className="text-sm text-gray-600">
                内容によっては、回答までお時間をいただく場合があります。
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
